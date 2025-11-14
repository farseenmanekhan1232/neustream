import express, { Request, Response } from "express";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import TOTPService from "../services/totpService";
import SessionService from "../services/sessionService";

const router = express.Router();
const db = new Database();
const totpService = new TOTPService();
const sessionService = new SessionService();

// Start session cleanup on server start
sessionService.startCleanupInterval();

/**
 * Start a new streaming session with TOTP authentication
 */
router.post("/sessions/start", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { totpCode } = req.body as { totpCode: string };
  const userId = (req as any).user.id;

  try {
    // Check if user has TOTP enabled
    const isTOTPEnabled = await totpService.isTOTPEnabled(userId);
    if (!isTOTPEnabled) {
      res.status(400).json({
        error: "TOTP not enabled",
        message: "Please enable TOTP in your account settings first"
      });
      return;
    }

    // Verify TOTP code
    const isValid = await totpService.verifyUserTOTP(userId, totpCode);
    if (!isValid) {
      res.status(401).json({
        error: "Invalid TOTP code",
        message: "The TOTP code you entered is invalid or expired"
      });
      return;
    }

    // Get user's stream sources
    const sources = await db.query<any>(
      `SELECT s.id, s.name, s.stream_key
       FROM stream_sources s
       WHERE s.user_id = $1 AND s.is_active = true`,
      [userId]
    );

    // Build stream keys object
    const streamKeys: Record<string, any> = {};

    // Add source stream keys with their destinations
    for (const source of sources) {
      // Get destinations for this source
      const sourceDestinations = await db.query<any>(
        `SELECT platform, rtmp_url, stream_key
         FROM source_destinations
         WHERE source_id = $1 AND is_active = true
         ORDER BY created_at`,
        [source.id]
      );

      streamKeys[source.stream_key] = {
        type: 'source',
        sourceId: source.id,
        sourceName: source.name,
        destinations: sourceDestinations.map((dest: any) => ({
          platform: dest.platform,
          rtmpUrl: dest.rtmp_url,
          streamKey: dest.stream_key
        }))
      };
    }

    // Create session
    const sessionId = await sessionService.createSession(userId, streamKeys);

    // Get session info
    const session = await sessionService.getSession(sessionId);

    res.json({
      success: true,
      sessionId,
      expiresAt: session?.expiresAt,
      streamKeys: Object.keys(streamKeys),
      message: "Streaming session authorized successfully"
    });

  } catch (error: any) {
    console.error("Error starting streaming session:", error);
    res.status(500).json({
      error: "Failed to start streaming session",
      message: error.message
    });
  }
});

/**
 * Stop/revoke current streaming session
 */
router.post("/sessions/stop", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    await sessionService.revokeAllUserSessions(userId);

    res.json({
      success: true,
      message: "All streaming sessions stopped"
    });
  } catch (error: any) {
    console.error("Error stopping streaming session:", error);
    res.status(500).json({
      error: "Failed to stop streaming session",
      message: error.message
    });
  }
});

/**
 * Get current active sessions for user
 */
router.get("/sessions", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user.id;

  try {
    const sessions = await sessionService.getUserSessions(userId);

    res.json({
      sessions,
      total: sessions.length
    });
  } catch (error: any) {
    console.error("Error getting user sessions:", error);
    res.status(500).json({
      error: "Failed to get sessions",
      message: error.message
    });
  }
});

/**
 * Emergency stop all streaming (requires backup code)
 */
router.post("/emergency/stop", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { backupCode } = req.body as { backupCode: string };
  const userId = (req as any).user.id;

  try {
    // TODO: Implement backup code verification
    // For now, just stop all sessions
    await sessionService.revokeAllUserSessions(userId);

    res.json({
      success: true,
      message: "All streaming sessions stopped via emergency access"
    });
  } catch (error: any) {
    console.error("Error with emergency stop:", error);
    res.status(500).json({
      error: "Failed to stop streaming",
      message: error.message
    });
  }
});

/**
 * Check if stream key has active session
 * Used by media server to verify session-based access
 */
router.get("/sessions/check/:streamKey", async (req: Request, res: Response): Promise<void> => {
  const { streamKey } = req.params;

  try {
    const session = await sessionService.getSessionByStreamKey(streamKey);

    if (session && sessionService.isSessionValid(session)) {
      res.json({
        hasSession: true,
        userId: session.userId,
        expiresAt: session.expiresAt
      });
    } else {
      res.json({
        hasSession: false
      });
    }
  } catch (error: any) {
    console.error("Error checking session:", error);
    res.status(500).json({
      error: "Failed to check session",
      message: error.message
    });
  }
});

export default router;
