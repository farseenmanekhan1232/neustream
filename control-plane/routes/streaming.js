const express = require("express");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");
const TOTPService = require("../services/totpService");
const SessionService = require("../services/sessionService");

const router = express.Router();
const db = new Database();
const totpService = new TOTPService();
const sessionService = new SessionService();

// Start session cleanup on server start
sessionService.startCleanupInterval();

/**
 * Start a new streaming session with TOTP authentication
 */
router.post("/sessions/start", authenticateToken, async (req, res) => {
  const { totpCode } = req.body;
  const userId = req.user.id;

  try {
    // Check if user has TOTP enabled
    const isTOTPEnabled = await totpService.isTOTPEnabled(userId);
    if (!isTOTPEnabled) {
      return res.status(400).json({
        error: "TOTP not enabled",
        message: "Please enable TOTP in your account settings first"
      });
    }

    // Verify TOTP code
    const isValid = await totpService.verifyUserTOTP(userId, totpCode);
    if (!isValid) {
      return res.status(401).json({
        error: "Invalid TOTP code",
        message: "The TOTP code you entered is invalid or expired"
      });
    }

    // Get user's stream keys and destinations
    const [sources, destinations] = await Promise.all([
      // Get user's stream sources
      db.query(
        `SELECT s.id, s.name, s.stream_key
         FROM stream_sources s
         WHERE s.user_id = $1 AND s.is_active = true`,
        [userId]
      ),
      // Get user's destinations
      db.query(
        `SELECT d.id, d.platform, d.rtmp_url, d.stream_key
         FROM destinations d
         WHERE d.user_id = $1 AND d.is_active = true`,
        [userId]
      )
    ]);

    // Build stream keys object
    const streamKeys = {};

    // Add source stream keys
    for (const source of sources) {
      streamKeys[source.stream_key] = {
        type: 'source',
        sourceId: source.id,
        sourceName: source.name,
        destinations: []
      };
    }

    // Add destination stream keys (for legacy compatibility)
    for (const dest of destinations) {
      // For legacy users without sources
      if (sources.length === 0) {
        // Use user's main stream key
        const userStreamKey = req.user.streamKey;
        if (!streamKeys[userStreamKey]) {
          streamKeys[userStreamKey] = {
            type: 'legacy',
            destinations: []
          };
        }
        streamKeys[userStreamKey].destinations.push({
          platform: dest.platform,
          rtmpUrl: dest.rtmp_url,
          streamKey: dest.stream_key
        });
      }
    }

    // Create session
    const sessionId = await sessionService.createSession(userId, streamKeys);

    // Get session info
    const session = await sessionService.getSession(sessionId);

    res.json({
      success: true,
      sessionId,
      expiresAt: session.expiresAt,
      streamKeys: Object.keys(streamKeys),
      message: "Streaming session authorized successfully"
    });

  } catch (error) {
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
router.post("/sessions/stop", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    await sessionService.revokeAllUserSessions(userId);

    res.json({
      success: true,
      message: "All streaming sessions stopped"
    });
  } catch (error) {
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
router.get("/sessions", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const sessions = await sessionService.getUserSessions(userId);

    res.json({
      sessions,
      total: sessions.length
    });
  } catch (error) {
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
router.post("/emergency/stop", authenticateToken, async (req, res) => {
  const { backupCode } = req.body;
  const userId = req.user.id;

  try {
    // TODO: Implement backup code verification
    // For now, just stop all sessions
    await sessionService.revokeAllUserSessions(userId);

    res.json({
      success: true,
      message: "All streaming sessions stopped via emergency access"
    });
  } catch (error) {
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
router.get("/sessions/check/:streamKey", async (req, res) => {
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
  } catch (error) {
    console.error("Error checking session:", error);
    res.status(500).json({
      error: "Failed to check session",
      message: error.message
    });
  }
});

module.exports = router;