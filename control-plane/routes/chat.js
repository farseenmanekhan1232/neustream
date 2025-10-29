const express = require("express");
const axios = require("axios");
const { google } = require("googleapis");
const Database = require("../lib/database");
const { authenticateToken } = require("../middleware/auth");
const posthogService = require("../services/posthog");

const router = express.Router();
const db = new Database();

// Get chat connectors for a source
router.get(
  "/sources/:sourceId/connectors",
  authenticateToken,
  async (req, res) => {
    const { sourceId } = req.params;
    const userId = req.user.id;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query(
        "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
      );

      if (sourceCheck.length === 0) {
        return res.status(404).json({ error: "Stream source not found" });
      }

      // Get chat connectors for this source
      const connectors = await db.query(
        "SELECT * FROM chat_connectors WHERE source_id = $1 ORDER BY created_at DESC",
        [sourceId],
      );

      res.json({ connectors });
    } catch (error) {
      console.error("Get chat connectors error:", error);
      res.status(500).json({ error: "Failed to fetch chat connectors" });
    }
  },
);

// Create new chat connector
router.post(
  "/sources/:sourceId/connectors",
  authenticateToken,
  async (req, res) => {
    const { sourceId } = req.params;
    const { platform, connectorType, config } = req.body;
    const userId = req.user.id;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query(
        "SELECT id, name FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
      );

      if (sourceCheck.length === 0) {
        return res.status(404).json({ error: "Stream source not found" });
      }

      // Validate input
      if (!platform || !connectorType || !config) {
        return res.status(400).json({
          error: "Platform, connector type, and config are required",
        });
      }

      // Check if connector already exists for this platform and source
      const existingConnectors = await db.query(
        "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
        [sourceId, platform],
      );

      if (existingConnectors.length > 0) {
        return res.status(400).json({
          error: `A ${platform} chat connector already exists for this source`,
        });
      }

      // Create the chat connector
      const result = await db.run(
        "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
        [sourceId, platform, connectorType, config],
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
  },
);

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
      [connectorId, userId],
    );

    if (connectorCheck.length === 0) {
      return res.status(404).json({ error: "Chat connector not found" });
    }

    // Update the connector
    const result = await db.run(
      "UPDATE chat_connectors SET config = COALESCE($1, config), is_active = COALESCE($2, is_active) WHERE id = $3 RETURNING *",
      [config, isActive, connectorId],
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
router.delete(
  "/connectors/:connectorId",
  authenticateToken,
  async (req, res) => {
    const { connectorId } = req.params;
    const userId = req.user.id;

    try {
      // Verify connector belongs to user's source
      const connectorCheck = await db.query(
        `SELECT cc.*, ss.name as source_name
       FROM chat_connectors cc
       JOIN stream_sources ss ON cc.source_id = ss.id
       WHERE cc.id = $1 AND ss.user_id = $2`,
        [connectorId, userId],
      );

      if (connectorCheck.length === 0) {
        return res.status(404).json({ error: "Chat connector not found" });
      }

      // Stop the active connector (if running)
      const chatConnectorService = req.app.chatConnectorService;
      if (chatConnectorService) {
        await chatConnectorService.stopConnector(connectorId);
      }

      // Delete related chat messages first (to satisfy foreign key constraint)
      await db.run("DELETE FROM chat_messages WHERE connector_id = $1", [
        connectorId,
      ]);

      // Then delete the connector
      const result = await db.run("DELETE FROM chat_connectors WHERE id = $1", [
        connectorId,
      ]);

      if (!result.changes || result.changes === 0) {
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
  },
);

// Get chat messages for a source
router.get(
  "/sources/:sourceId/messages",
  authenticateToken,
  async (req, res) => {
    const { sourceId } = req.params;
    const userId = req.user.id;
    const { limit = 50, offset = 0 } = req.query;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query(
        "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
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
        [sourceId, parseInt(limit), parseInt(offset)],
      );

      // Get total count
      const countResult = await db.query(
        "SELECT COUNT(*) as total FROM chat_messages WHERE source_id = $1",
        [sourceId],
      );

      res.json({
        messages: messages.reverse(), // Return in chronological order
        total: parseInt(countResult[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
    } catch (error) {
      console.error("Get chat messages error:", error);
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  },
);

// OAuth flow for chat connectors
router.get(
  "/connectors/:platform/oauth/start",
  authenticateToken,
  async (req, res) => {
    const { platform } = req.params;
    const { sourceId, redirectUrl } = req.query;
    const userId = req.user.id;

    try {
      // Verify source belongs to user
      if (sourceId) {
        const sourceCheck = await db.query(
          "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
          [sourceId, userId],
        );

        if (sourceCheck.length === 0) {
          return res.status(404).json({ error: "Stream source not found" });
        }
      }

      // Generate OAuth URL based on platform
      let oauthUrl;
      const state = Buffer.from(
        JSON.stringify({
          userId,
          sourceId,
          redirectUrl:
            redirectUrl || `${process.env.FRONTEND_URL}/dashboard/streaming`,
        }),
      ).toString("base64");

      switch (platform.toLowerCase()) {
        case "twitch":
          oauthUrl =
            `https://id.twitch.tv/oauth2/authorize?` +
            `client_id=${process.env.TWITCH_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(
              process.env.TWITCH_CHAT_CALLBACK_URL ||
                `${process.env.BACKEND_URL}/api/chat/connectors/twitch/oauth/callback`,
            )}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent("chat:read chat:edit")}` +
            `&state=${state}`;
          break;
        case "youtube":
          oauthUrl =
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(
              process.env.YOUTUBE_CHAT_CALLBACK_URL ||
                `${process.env.BACKEND_URL}/api/chat/connectors/youtube/oauth/callback`,
            )}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(
              "https://www.googleapis.com/auth/youtube.readonly",
            )}` +
            `&access_type=offline` +
            `&prompt=consent` +
            `&include_granted_scopes=true` +
            `&state=${state}`;
          break;
        case "instagram":
          oauthUrl =
            `https://www.facebook.com/v18.0/dialog/oauth?` +
            `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(
              process.env.INSTAGRAM_CALLBACK_URL ||
                `${process.env.BACKEND_URL}/api/chat/connectors/instagram/oauth/callback`,
            )}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(
              "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
            )}` +
            `&state=${state}`;
          break;
        default:
          return res
            .status(400)
            .json({ error: `Unsupported platform: ${platform}` });
      }

      console.log(
        `OAuth start successful for ${platform}, redirecting to:`,
        oauthUrl,
      );
      console.log(`OAuth start request details:`, {
        platform,
        sourceId,
        userId,
        redirectUrl:
          redirectUrl || `${process.env.FRONTEND_URL}/dashboard/streaming`,
        oauthUrlLength: oauthUrl.length,
      });
      res.json({ oauthUrl });
    } catch (error) {
      console.error("OAuth start error:", error);
      res.status(500).json({ error: "Failed to start OAuth flow" });
    }
  },
);

// OAuth callback endpoint (placeholder - will be implemented per platform)
router.get("/connectors/:platform/oauth/callback", async (req, res) => {
  const { platform } = req.params;
  const { code, state, error } = req.query;

  try {
    if (error) {
      return res.redirect(
        `${
          process.env.FRONTEND_URL
        }/dashboard/streaming?oauth_error=${encodeURIComponent(error)}`,
      );
    }

    if (!code || !state) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=invalid_callback`,
      );
    }

    // Parse state
    const stateData = JSON.parse(Buffer.from(state, "base64").toString());
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
      platformUsername: tokens.platformUsername,
    };

    // Check if connector already exists
    const existingConnectors = await db.query(
      "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
      [sourceId, platform],
    );

    let connector;
    if (existingConnectors.length > 0) {
      // Update existing connector
      connector = await db.run(
        "UPDATE chat_connectors SET config = $1, is_active = true WHERE id = $2 RETURNING *",
        [connectorConfig, existingConnectors[0].id],
      );
    } else {
      // Create new connector
      connector = await db.run(
        "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
        [sourceId, platform, "oauth", connectorConfig],
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
    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=callback_failed`,
    );
  }
});

// Real OAuth token exchange implementation
async function exchangeCodeForTokens(platform, code) {
  switch (platform.toLowerCase()) {
    case "twitch":
      return await exchangeTwitchCodeForTokens(code);
    case "youtube":
      return await exchangeYouTubeCodeForTokens(code);
    case "instagram":
      return await exchangeInstagramCodeForTokens(code);
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

// Twitch OAuth token exchange
async function exchangeTwitchCodeForTokens(code) {
  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      null,
      {
        params: {
          client_id: process.env.TWITCH_CLIENT_ID,
          client_secret: process.env.TWITCH_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri:
            process.env.TWITCH_CHAT_CALLBACK_URL ||
            `${process.env.BACKEND_URL}/api/chat/connectors/twitch/oauth/callback`,
        },
      },
    );

    const { access_token, refresh_token, expires_in } = response.data;

    // Get user info with the access token
    const userResponse = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Client-Id": process.env.TWITCH_CLIENT_ID,
      },
    });

    const userData = userResponse.data.data[0];

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      platformUserId: userData.id,
      platformUsername: userData.login,
      displayName: userData.display_name,
    };
  } catch (error) {
    console.error(
      "Twitch token exchange error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to exchange Twitch authorization code");
  }
}

// YouTube OAuth token exchange
async function exchangeYouTubeCodeForTokens(code) {
  try {
    const redirectUri =
      process.env.YOUTUBE_CHAT_CALLBACK_URL ||
      `${process.env.BACKEND_URL}/api/chat/connectors/youtube/oauth/callback`;
    console.log("YouTube OAuth redirect URI:", redirectUri);
    console.log(
      "YouTube OAuth client ID:",
      process.env.GOOGLE_CLIENT_ID ? "SET" : "NOT SET",
    );
    console.log(
      "YouTube OAuth client secret:",
      process.env.GOOGLE_CLIENT_SECRET ? "SET" : "NOT SET",
    );

    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
      `client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID)}&` +
        `client_secret=${encodeURIComponent(
          process.env.GOOGLE_CLIENT_SECRET,
        )}&` +
        `code=${encodeURIComponent(code)}&` +
        `grant_type=authorization_code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    console.log("YouTube token exchange response:", {
      status: response.status,
      hasAccessToken: !!response.data.access_token,
      hasRefreshToken: !!response.data.refresh_token,
      expiresIn: response.data.expires_in,
    });

    const { access_token, refresh_token, expires_in } = response.data;

    console.log(
      "YouTube token exchange successful, fetching user channel info...",
    );

    // Get the user's actual YouTube channel ID using the Channels API
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: access_token });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Get the authenticated user's channel info
    const channelResponse = await youtube.channels.list({
      part: "snippet",
      mine: true,
    });

    if (
      !channelResponse.data.items ||
      channelResponse.data.items.length === 0
    ) {
      throw new Error("No YouTube channel found for authenticated user");
    }

    const channel = channelResponse.data.items[0];
    const channelId = channel.id;
    const channelTitle = channel.snippet.title;

    console.log("YouTube channel info retrieved:", {
      channelId,
      channelTitle,
    });

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      platformUserId: channelId, // Store the actual YouTube channel ID
      platformUsername: channelTitle,
      displayName: channelTitle,
    };
  } catch (error) {
    console.error(
      "YouTube token exchange error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to exchange YouTube authorization code");
  }
}

// Public chat endpoint - get messages by source ID (no authentication required)
router.get("/public/sources/:sourceId/messages", async (req, res) => {
  const { sourceId } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  try {
    // Verify source exists and is active
    const sourceCheck = await db.query(
      "SELECT id, name, is_active FROM stream_sources WHERE id = $1",
      [sourceId],
    );

    if (sourceCheck.length === 0) {
      return res.status(404).json({ error: "Stream source not found" });
    }

    if (!sourceCheck[0].is_active) {
      return res.status(400).json({ error: "Stream source is not active" });
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
      [sourceId, parseInt(limit), parseInt(offset)],
    );

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) as total FROM chat_messages WHERE source_id = $1",
      [sourceId],
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      total: parseInt(countResult[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error("Get public chat messages error:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});
// Instagram OAuth token exchange
async function exchangeInstagramCodeForTokens(code) {
  try {
    const redirectUri =
      process.env.INSTAGRAM_CALLBACK_URL ||
      `${process.env.BACKEND_URL}/api/chat/connectors/instagram/oauth/callback`;

    console.log("Instagram OAuth redirect URI:", redirectUri);
    console.log(
      "Instagram OAuth client ID:",
      process.env.INSTAGRAM_CLIENT_ID ? "SET" : "NOT SET",
    );
    console.log(
      "Instagram OAuth client secret:",
      process.env.INSTAGRAM_CLIENT_SECRET ? "SET" : "NOT SET",
    );

    // Exchange code for access token
    const response = await axios.post(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      null,
      {
        params: {
          client_id: process.env.INSTAGRAM_CLIENT_ID,
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        },
      },
    );

    console.log("Instagram token exchange response:", {
      status: response.status,
      hasAccessToken: !!response.data.access_token,
      expiresIn: response.data.expires_in,
    });

    const { access_token, expires_in } = response.data;

    console.log("Instagram token exchange successful, fetching user info...");

    // Get user info with the access token
    const userResponse = await axios.get(
      `https://graph.facebook.com/v18.0/me?fields=id,name,accounts{id,name,access_token,instagram_business_account{id,username,name}}&access_token=${access_token}`,
    );

    const userData = userResponse.data;
    console.log("Instagram user info:", userData);

    // Find Instagram business account
    let instagramAccount = null;
    let liveVideoId = null;

    if (userData.accounts && userData.accounts.data.length > 0) {
      for (const account of userData.accounts.data) {
        if (account.instagram_business_account) {
          instagramAccount = account.instagram_business_account;
          break;
        }
      }
    }

    if (!instagramAccount) {
      throw new Error(
        "No Instagram business account found for authenticated user. Please ensure you have an Instagram Business account connected to your Facebook account and try again.",
      );
    }

    console.log("Instagram business account found:", instagramAccount);

    return {
      accessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      platformUserId: instagramAccount.id,
      platformUsername: instagramAccount.username,
      displayName: instagramAccount.name || instagramAccount.username,
      // Note: Instagram doesn't provide refresh tokens in basic flow
      // We'll need to handle token refresh separately
    };
  } catch (error) {
    console.error(
      "Instagram token exchange error:",
      error.response?.data || error.message,
    );

    // Provide more specific error messages
    if (
      error.response?.data?.error?.message?.includes(
        "Error validating client secret",
      )
    ) {
      throw new Error(
        "Instagram client secret is invalid. Please check your Facebook Developer app configuration.",
      );
    } else if (error.message.includes("No Instagram business account found")) {
      throw new Error(error.message);
    } else {
      throw new Error(
        "Failed to exchange Instagram authorization code: " +
          (error.response?.data?.error?.message || error.message),
      );
    }
  }
}

module.exports = router;
