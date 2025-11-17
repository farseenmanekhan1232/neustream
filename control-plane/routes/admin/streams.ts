import express, { Request, Response } from "express";
import Database from "../../lib/database";
import mediamtxService from "../../services/mediamtxService";

const router = express.Router();
const db = new Database();

// Get active streams with enhanced details
router.get("/active", async (req: Request, res: Response): Promise<void> => {
  try {
    // Get streams from MediaMTX
    const activePaths = await mediamtxService.getActivePaths();

    // Enhance with user data from database
    const enhancedStreams = await Promise.all(
      activePaths.map(async (path) => {
        // Look up user by stream key
        const userResult = await db.query<any>(
          `SELECT u.id, u.email, u.display_name
           FROM users u
           WHERE u.stream_key = $1`,
          [path.name],
        );

        // Also check active_streams table for additional info
        const streamInfo = await db.query<any>(
          `SELECT as_.*
           FROM active_streams as_
           WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
          [path.name],
        );

        return {
          stream_key: path.name,
          user_email: userResult[0]?.email || "Unknown",
          user_display_name: userResult[0]?.display_name,
          user_id: userResult[0]?.id,
          publisher_id: path.publisher?.id,
          started_at: path.publisher?.created,
          bytes_received: path.publisher?.bytesReceived || 0,
          packets_received: path.publisher?.packetsReceived || 0,
          stream_info: streamInfo[0] || null,
        };
      }),
    );

    res.json({
      data: {
        streams: enhancedStreams,
        total: enhancedStreams.length,
      },
    });
  } catch (error: any) {
    console.error("Get active streams error:", error);
    res.status(500).json({ error: "Failed to fetch active streams" });
  }
});

// Get stream preview information
router.get("/:streamKey/preview", async (req: Request, res: Response): Promise<void> => {
  const { streamKey } = req.params;

  try {
    // Get stream details from MediaMTX
    const path = await mediamtxService.getPathDetails(streamKey);

    if (!path) {
      res.status(404).json({ error: "Stream not found" });
      return;
    }

    // Generate HLS URL for preview
    const mediaServerHost = process.env.MEDIA_SERVER_HOST || "localhost";
    const hlsPort = process.env.HLS_PORT || "8888";
    const previewUrl = `http://${mediaServerHost}:${hlsPort}/hls/${streamKey}.m3u8`;

    // Get stream metrics
    const metrics = await mediamtxService.getStreamMetrics(streamKey);

    // Get user info
    const userResult = await db.query<any>(
      `SELECT u.id, u.email, u.display_name
       FROM users u
       WHERE u.stream_key = $1`,
      [streamKey],
    );

    res.json({
      data: {
        streamKey,
        previewUrl,
        isActive: !!path.publisher,
        user: userResult[0] || null,
        metrics,
        startedAt: path.publisher?.created,
        publisherId: path.publisher?.id,
      },
    });
  } catch (error: any) {
    console.error("Get stream preview error:", error);
    res.status(500).json({ error: "Failed to get stream preview" });
  }
});

// Stop a stream
router.post("/:streamKey/stop", async (req: Request, res: Response): Promise<void> => {
  const { streamKey } = req.params;
  const { reason } = req.body as { reason?: string };
  const adminId = (req as any).user.id;

  try {
    // Get stream info before stopping
    const streamInfo = await db.query<any>(
      `SELECT as_.*, u.email
       FROM active_streams as_
       JOIN users u ON as_.user_id = u.id
       WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
      [streamKey],
    );

    // Stop the stream via MediaMTX API
    const stopResult = await mediamtxService.stopStream(streamKey);

    if (stopResult.success) {
      // Log the action
      await db.run(
        `INSERT INTO stream_control_logs (
          stream_key, action, reason, admin_id, created_at
        ) VALUES ($1, $2, $3, $4, NOW())`,
        [
          streamKey,
          "stopped_by_admin",
          reason || "No reason provided",
          adminId,
        ],
      );

      res.json({
        success: true,
        message: stopResult.message,
        data: {
          stream_key: streamKey,
          user_email: streamInfo[0]?.email,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        error: stopResult.message,
      });
    }
  } catch (error: any) {
    console.error("Stop stream error:", error);
    res.status(500).json({ error: "Failed to stop stream" });
  }
});

// Get stream control logs
router.get("/control-logs", async (req: Request, res: Response): Promise<void> => {
  const { limit = 50 } = req.query;

  try {
    const logs = await db.query<any>(
      `SELECT scl.*, u.email as admin_email
       FROM stream_control_logs scl
       JOIN users u ON scl.admin_id = u.id
       ORDER BY scl.created_at DESC
       LIMIT $1`,
      [limit],
    );

    res.json({ data: logs });
  } catch (error: any) {
    console.error("Get stream control logs error:", error);
    res.status(500).json({ error: "Failed to fetch stream control logs" });
  }
});

export default router;
