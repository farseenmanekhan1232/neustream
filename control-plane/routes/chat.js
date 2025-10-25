const express = require("express");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");
const posthogService = require("../services/posthog");

const router = express.Router();
const db = new Database();

// Get chat connectors for a source
router.get("/sources/:sourceId/connectors", authenticateToken, async (req, res) => {
  const { sourceId } = req.params;
  const userId = req.user.id;

  try {
    // Verify source belongs to user
    const sourceCheck = await db.query(
      "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );

    if (sourceCheck.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Get chat connectors for this source
    const connectors = await db.query(
      "SELECT * FROM chat_connectors WHERE source_id = $1 ORDER BY created_at DESC",
      [sourceId]
    );

    res.json({ connectors });
  } catch (error) {
    console.error("Get chat connectors error:", error);
    res.status(500).json({ error: "Failed to fetch chat connectors" });
  }
});

// Create new chat connector
router.post("/sources/:sourceId/connectors", authenticateToken, async (req, res) => {
  const { sourceId } = req.params;
  const { platform, connectorType, config } = req.body;
  const userId = req.user.id;

  try {
    // Verify source belongs to user
    const sourceCheck = await db.query(
      "SELECT id, name FROM stream_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );

    if (sourceCheck.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Validate input
    if (!platform || !connectorType || !config) {
      return res.status(400).json({
        error: "Platform, connector type, and config are required"
      });
    }

    // Check if connector already exists for this platform and source
    const existingConnectors = await db.query(
      "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
      [sourceId, platform]
    );

    if (existingConnectors.length > 0) {
      return res.status(400).json({
        error: `A ${platform} chat connector already exists for this source`
      });
    }

    // Create the chat connector
    const result = await db.run(
      "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
      [sourceId, platform, connectorType, config]
    );

    // Track connector creation
    posthogService.trackAuthEvent(userId, "chat_connector_created", {
      source_id: parseInt(sourceId),
      source_name: sourceCheck[0].name,
      platform,
      connector_type: connectorType,
    });

    res.status(201).json({ connector: result });
  } catch (error) {
    console.error("Create chat connector error:", error);
    res.status(500).json({ error: "Failed to create chat connector" });
  }
});

// Update chat connector
router.put("/connectors/:connectorId", authenticateToken, async (req, res) => {
  const { connectorId } = req.params;
  const { config, isActive } = req.body;
  const userId = req.user.id;

  try {
    // Verify connector belongs to user's source
    const connectorCheck = await db.query(
      `SELECT cc.*, ss.name as source_name
       FROM chat_connectors cc
       JOIN stream_sources ss ON cc.source_id = ss.id
       WHERE cc.id = $1 AND ss.user_id = $2`,
      [connectorId, userId]
    );

    if (connectorCheck.length === 0) {
      return res.status(404).json({ error: "Chat connector not found" });
    }

    // Update the connector
    const result = await db.run(
      "UPDATE chat_connectors SET config = COALESCE($1, config), is_active = COALESCE($2, is_active) WHERE id = $3 RETURNING *",
      [config, isActive, connectorId]
    );

    if (!result) {
      return res.status(404).json({ error: "Chat connector not found" });
    }

    // Track connector update
    posthogService.trackAuthEvent(userId, "chat_connector_updated", {
      connector_id: parseInt(connectorId),
      source_id: result.source_id,
      platform: result.platform,
      changes: { config, isActive },
    });

    res.json({ connector: result });
  } catch (error) {
    console.error("Update chat connector error:", error);
    res.status(500).json({ error: "Failed to update chat connector" });
  }
});

// Delete chat connector
router.delete("/connectors/:connectorId", authenticateToken, async (req, res) => {
  const { connectorId } = req.params;
  const userId = req.user.id;

  try {
    // Verify connector belongs to user's source
    const connectorCheck = await db.query(
      `SELECT cc.*, ss.name as source_name
       FROM chat_connectors cc
       JOIN stream_sources ss ON cc.source_id = ss.id
       WHERE cc.id = $1 AND ss.user_id = $2`,
      [connectorId, userId]
    );

    if (connectorCheck.length === 0) {
      return res.status(404).json({ error: "Chat connector not found" });
    }

    // Delete the connector
    const result = await db.run(
      "DELETE FROM chat_connectors WHERE id = $1",
      [connectorId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Chat connector not found" });
    }

    // Track connector deletion
    posthogService.trackAuthEvent(userId, "chat_connector_deleted", {
      connector_id: parseInt(connectorId),
      source_id: connectorCheck[0].source_id,
      platform: connectorCheck[0].platform,
      source_name: connectorCheck[0].source_name,
    });

    res.json({ message: "Chat connector deleted successfully" });
  } catch (error) {
    console.error("Delete chat connector error:", error);
    res.status(500).json({ error: "Failed to delete chat connector" });
  }
});

// Get chat messages for a source
router.get("/sources/:sourceId/messages", authenticateToken, async (req, res) => {
  const { sourceId } = req.params;
  const userId = req.user.id;
  const { limit = 50, offset = 0 } = req.query;

  try {
    // Verify source belongs to user
    const sourceCheck = await db.query(
      "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
      [sourceId, userId]
    );

    if (sourceCheck.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    // Get chat messages for this source
    const messages = await db.query(
      `SELECT
        cm.id,
        cm.source_id as "sourceId",
        cm.connector_id as "connectorId",
        cm.platform_message_id as "platformMessageId",
        cm.author_name as "authorName",
        cm.author_id as "authorId",
        cm.message_text as "messageText",
        cm.message_type as "messageType",
        cm.metadata,
        cm.created_at as "createdAt",
        cc.platform
      FROM chat_messages cm
      LEFT JOIN chat_connectors cc ON cm.connector_id = cc.id
      WHERE cm.source_id = $1
      ORDER BY cm.created_at DESC
      LIMIT $2 OFFSET $3`,
      [sourceId, parseInt(limit), parseInt(offset)]
    );

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM chat_messages WHERE source_id = $1",
      [sourceId]
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      total: parseInt(countResult[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error("Get chat messages error:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

// OAuth flow for chat connectors
router.get("/connectors/:platform/oauth/start", authenticateToken, async (req, res) => {
  const { platform } = req.params;
  const { sourceId, redirectUrl } = req.query;
  const userId = req.user.id;

  try {
    // Verify source belongs to user
    if (sourceId) {
      const sourceCheck = await db.query(
        "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId]
      );

      if (sourceCheck.length === 0) {
        return res.status(404).json({ error: "Stream source not found" });
      }
    }

    // Generate OAuth URL based on platform
    let oauthUrl;
    const state = Buffer.from(JSON.stringify({
      userId,
      sourceId,
      redirectUrl: redirectUrl || `${process.env.FRONTEND_URL}/dashboard/streaming`
    })).toString('base64');

    switch (platform.toLowerCase()) {
      case 'twitch':
        oauthUrl = `https://id.twitch.tv/oauth2/authorize?` +
          `client_id=${process.env.TWITCH_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(process.env.TWITCH_CHAT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/chat/connectors/twitch/oauth/callback`)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent('chat:read chat:edit')}` +
          `&state=${state}`;
        break;
      case 'youtube':
        oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.GOOGLE_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(process.env.YOUTUBE_CHAT_CALLBACK_URL || `${process.env.BACKEND_URL}/api/chat/connectors/youtube/oauth/callback`)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly')}` +
          `&state=${state}`;
        break;
      default:
        return res.status(400).json({ error: `Unsupported platform: ${platform}` });
    }

    res.json({ oauthUrl });
  } catch (error) {
    console.error("OAuth start error:", error);
    res.status(500).json({ error: "Failed to start OAuth flow" });
  }
});

// OAuth callback endpoint (placeholder - will be implemented per platform)
router.get("/connectors/:platform/oauth/callback", async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  try {
    if (error) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=invalid_callback`);
    }

    // Parse state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { userId, sourceId, redirectUrl } = stateData;

    // Exchange code for tokens (platform-specific implementation)
    // This is a placeholder - actual implementation will vary by platform
    const tokens = await exchangeCodeForTokens(platform, code);

    // Create or update chat connector
    const connectorConfig = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      platformUserId: tokens.platformUserId,
      platformUsername: tokens.platformUsername
    };

    // Check if connector already exists
    const existingConnectors = await db.query(
      "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
      [sourceId, platform]
    );

    let connector;
    if (existingConnectors.length > 0) {
      // Update existing connector
      connector = await db.run(
        "UPDATE chat_connectors SET config = $1, is_active = true WHERE id = $2 RETURNING *",
        [connectorConfig, existingConnectors[0].id]
      );
    } else {
      // Create new connector
      connector = await db.run(
        "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
        [sourceId, platform, 'oauth', connectorConfig]
      );
    }

    // Track successful OAuth connection
    posthogService.trackAuthEvent(userId, "chat_connector_oauth_success", {
      platform,
      source_id: parseInt(sourceId),
      connector_id: connector.id,
    });

    // Redirect to success page
    res.redirect(`${redirectUrl}?oauth_success=true&platform=${platform}`);
  } catch (error) {
    console.error("OAuth callback error:", error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=callback_failed`);
  }
});

// Placeholder function for token exchange
async function exchangeCodeForTokens(platform, code) {
  // This is a placeholder - actual implementation will vary by platform
  // In production, you'd make actual API calls to exchange the code for tokens

  switch (platform.toLowerCase()) {
    case 'twitch':
      // Implement Twitch token exchange
      return {
        accessToken: 'placeholder_access_token',
        refreshToken: 'placeholder_refresh_token',
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        platformUserId: 'placeholder_user_id',
        platformUsername: 'placeholder_username'
      };
    case 'youtube':
      // Implement YouTube token exchange
      return {
        accessToken: 'placeholder_access_token',
        refreshToken: 'placeholder_refresh_token',
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        platformUserId: 'placeholder_user_id',
        platformUsername: 'placeholder_username'
      };
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

module.exports = router;