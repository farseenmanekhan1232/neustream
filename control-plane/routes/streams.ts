import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken, optionalAuth } from "../middleware/auth";
import posthogService from "../services/posthog";
import SessionService from "../services/sessionService";

const router = express.Router();
const db = new Database();
const sessionService = new SessionService();

// Get user's stream info - requires authentication
router.get("/info", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  // Use authenticated user ID instead of query parameter
  const userId = (req as any).user.id;

  try {
    // Get user's stream key
    const users = await db.query<{ stream_key: string }>("SELECT stream_key FROM users WHERE id = $1", [
      userId,
    ]);

    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const streamKey = users[0].stream_key;

    // Check if stream is active
    const activeStreams = await db.query<any>(
      "SELECT * FROM active_streams WHERE user_id = $1 AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
      [userId]
    );

    const isActive = activeStreams.length > 0;

    res.json({
      streamKey,
      isActive,
      rtmpUrl: `rtmp://${
        process.env.STREAM_DOMAIN || process.env.MEDIA_SERVER_HOST
      }/live`,
      activeStream: isActive ? activeStreams[0] : null,
    });
  } catch (error) {
    console.error("Get stream info error:", error);
    res.status(500).json({ error: "Failed to fetch stream info" });
  }
});

// Get active streams (for monitoring) - requires authentication
router.get("/active", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const activeStreams = await db.query<any>(`
      SELECT
        s.*,
        u.email
      FROM active_streams s
      JOIN users u ON s.user_id = u.id
      WHERE s.ended_at IS NULL
      ORDER BY s.started_at DESC
    `);

    res.json({ activeStreams });
  } catch (error) {
    console.error("Get active streams error:", error);
    res.status(500).json({ error: "Failed to fetch active streams" });
  }
});

// Get RTMP forwarding configuration for a stream key - accessible by media-server
router.get("/forwarding/:streamKey", async (req: Request, res: Response): Promise<void> => {
  const { streamKey } = req.params;

  try {
    let sourceInfo: any = null;
    let userId: number | null = null;
    let destinations: any[] = [];

    // First, check if this stream key has an active session
    const session = await sessionService.getSessionByStreamKey(streamKey);
    if (session && sessionService.isSessionValid(session)) {
      // Session exists - use pre-authorized configuration
      console.log(`Using session-based forwarding for stream key: ${streamKey}`);

      // Extract user ID and destinations from session
      userId = session.userId;
      const sessionStreamKeys = session.streamKeys;

      // Get the specific stream key configuration from session
      if (sessionStreamKeys[streamKey]) {
        const streamConfig = sessionStreamKeys[streamKey];

        // Get source info
        const sources = await db.query<any>(
          `SELECT s.*, u.email FROM stream_sources s
           JOIN users u ON s.user_id = u.id
           WHERE s.id = $1`,
          [streamConfig.sourceId]
        );
        sourceInfo = sources[0];

        // Get destinations for this source
        destinations = await db.query<any>(
          `SELECT platform, rtmp_url, stream_key FROM source_destinations
           WHERE source_id = $1 AND is_active = true
           ORDER BY created_at`,
          [streamConfig.sourceId]
        );
      }
    } else {
      // No active session - use traditional authentication
      console.log(`No active session for stream key: ${streamKey}, using traditional auth`);

      // Find the stream key in stream_sources table
      const sources = await db.query<any>(
        `SELECT s.*, u.email FROM stream_sources s
         JOIN users u ON s.user_id = u.id
         WHERE s.stream_key = $1 AND s.is_active = true`,
        [streamKey]
      );

      if (sources.length === 0) {
        res.status(404).json({ error: "Stream key not found" });
        return;
      }

      // Found the source
      sourceInfo = sources[0];
      userId = sourceInfo.user_id;

      // Get destinations for this specific source
      destinations = await db.query<any>(
        `SELECT platform, rtmp_url, stream_key FROM source_destinations
         WHERE source_id = $1 AND is_active = true
         ORDER BY created_at`,
        [sourceInfo.id]
      );

      console.log(
        `Forwarding config for source: ${sourceInfo.name} (${destinations.length} destinations)`
      );
    }

    // Build RTMP push configuration
    const pushConfig = destinations.map((dest) => {
      // Construct the full RTMP URL with stream key
      // Different platforms may have different URL formats
      if (dest.platform === "youtube") {
        return `push ${dest.rtmp_url}/${dest.stream_key}`;
      } else if (dest.platform === "twitch") {
        return `push ${dest.rtmp_url}/${dest.stream_key}`;
      } else if (dest.platform === "facebook") {
        return `push ${dest.rtmp_url}/${dest.stream_key}`;
      } else {
        // Default format for custom RTMP destinations
        return `push ${dest.rtmp_url}/${dest.stream_key}`;
      }
    });

    // Track forwarding configuration request
    posthogService.trackStreamEvent(
      userId!,
      streamKey,
      "forwarding_config_requested",
      {
        source_id: sourceInfo?.id,
        source_name: sourceInfo?.name,
        destinations_count: destinations.length,
        platforms: destinations.map((d: any) => d.platform),
      }
    );

    res.json({
      streamKey,
      sourceId: sourceInfo?.id || null,
      userId,
      sourceName: sourceInfo?.name || null,
      destinations: destinations,
      pushConfig: pushConfig,
    });
  } catch (error: any) {
    console.error("Get forwarding config error:", error);
    posthogService.trackStreamEvent(
      "anonymous",
      streamKey,
      "forwarding_config_error",
      {
        error_message: error.message,
        error_code: error.code,
      }
    );
    res.status(500).json({ error: "Failed to fetch forwarding configuration" });
  }
});

export default router;
