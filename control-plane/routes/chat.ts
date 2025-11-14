import * as express from "express";
import { Request, Response } from "express";
import { google } from "googleapis";
import axios from "axios";
import Database from "../lib/database";
import { authenticateToken } from "../middleware/auth";
import posthogService from "../services/posthog";
import { handleGenericIdParam } from "../middleware/idHandler";
import { canCreateChatConnector } from "../middleware/planValidation";

const router = express.Router();
const db = new Database();

// Get chat connectors for a source
router.get(
  "/sources/:sourceId/connectors",
  authenticateToken,
  handleGenericIdParam('stream_sources'),
  async (req: Request, res: Response): Promise<void> => {
    const { sourceId } = req.params;
    const userId = (req as any).user.id;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query<{ id: number }>(
        "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
      );

      if (sourceCheck.length === 0) {
        res.status(404).json({ error: "Stream source not found" });
        return;
      }

      // Get chat connectors for this source
      const connectors = await db.query<any>(
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
  handleGenericIdParam('stream_sources'),
  canCreateChatConnector,
  async (req: Request, res: Response): Promise<void> => {
    const { sourceId } = req.params;
    const { platform, connectorType, config } = req.body as { platform: string; connectorType: string; config: any };
    const userId = (req as any).user.id;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query<{ id: number; name: string }>(
        "SELECT id, name FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
      );

      if (sourceCheck.length === 0) {
        res.status(404).json({ error: "Stream source not found" });
        return;
      }

      // Validate input
      if (!platform || !connectorType || !config) {
        res.status(400).json({
          error: "Platform, connector type, and config are required",
        });
        return;
      }

      // Check if connector already exists for this platform and source
      const existingConnectors = await db.query<{ id: number }>(
        "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
        [sourceId, platform],
      );

      if (existingConnectors.length > 0) {
        res.status(400).json({
          error: `A ${platform} chat connector already exists for this source`,
        });
        return;
      }

      // Create the chat connector
      const result = await db.run<any>(
        "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
        [sourceId, platform, connectorType, config],
      );

      // Track connector creation
      posthogService.trackAuthEvent(userId, "chat_connector_created", {
        source_id: Number(sourceId.toString()),
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
router.put("/connectors/:connectorId", authenticateToken, handleGenericIdParam('chat_connectors'), async (req: Request, res: Response): Promise<void> => {
  const { connectorId } = req.params;
  const { config, isActive } = req.body as { config?: any; isActive?: boolean };
  const userId = (req as any).user.id;

  try {
    // Verify connector belongs to user's source
    const connectorCheck = await db.query<any>(
      `SELECT cc.*, ss.name as source_name
       FROM chat_connectors cc
       JOIN stream_sources ss ON cc.source_id = ss.id
       WHERE cc.id = $1 AND ss.user_id = $2`,
      [connectorId, userId],
    );

    if (connectorCheck.length === 0) {
      res.status(404).json({ error: "Chat connector not found" });
      return;
    }

    // Update the connector
    const result = await db.run<any>(
      "UPDATE chat_connectors SET config = COALESCE($1, config), is_active = COALESCE($2, is_active) WHERE id = $3 RETURNING *",
      [config, isActive, connectorId],
    );

    if (!result) {
      res.status(404).json({ error: "Chat connector not found" });
      return;
    }

    // Track connector update
    posthogService.trackAuthEvent(userId, "chat_connector_updated", {
      connector_id: Number(connectorId.toString()),
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
  handleGenericIdParam('chat_connectors'),
  async (req: Request, res: Response): Promise<void> => {
    const { connectorId } = req.params;
    const userId = (req as any).user.id;

    try {
      // Verify connector belongs to user's source
      const connectorCheck = await db.query<any>(
        `SELECT cc.*, ss.name as source_name
       FROM chat_connectors cc
       JOIN stream_sources ss ON cc.source_id = ss.id
       WHERE cc.id = $1 AND ss.user_id = $2`,
        [connectorId, userId],
      );

      if (connectorCheck.length === 0) {
        res.status(404).json({ error: "Chat connector not found" });
        return;
      }

      // Stop the active connector (if running)
      const chatConnectorService = (req.app as any).chatConnectorService;
      if (chatConnectorService) {
        await chatConnectorService.stopConnector(connectorId);
      }

      // Delete related chat messages first (to satisfy foreign key constraint)
      await db.run("DELETE FROM chat_messages WHERE connector_id = $1", [
        connectorId,
      ]);

      // Then delete the connector
      const result = await db.run<any>("DELETE FROM chat_connectors WHERE id = $1", [
        connectorId,
      ]);

      if (!result.changes || result.changes === 0) {
        res.status(404).json({ error: "Chat connector not found" });
        return;
      }

      // Track connector deletion
      posthogService.trackAuthEvent(userId, "chat_connector_deleted", {
        connector_id: Number(connectorId.toString()),
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
  handleGenericIdParam('stream_sources'),
  async (req: Request, res: Response): Promise<void> => {
    const { sourceId } = req.params;
    const userId = (req as any).user.id;
    const { limit = 50, offset = 0 } = req.query as any;

    try {
      // Verify source belongs to user
      const sourceCheck = await db.query<{ id: number }>(
        "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
        [sourceId, userId],
      );

      if (sourceCheck.length === 0) {
        res.status(404).json({ error: "Stream source not found" });
        return;
      }

      // Get chat messages for this source
      const messages = await db.query<any>(
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
        [sourceId, Number(limit.toString()), Number(offset.toString())],
      );

      // Get total count
      const countResult = await db.query<{ total: string }>(
        "SELECT COUNT(*) as total FROM chat_messages WHERE source_id = $1",
        [sourceId],
      );

      res.json({
        messages: messages.reverse(), // Return in chronological order
        total: Number(countResult[0].total),
        limit: Number(limit.toString()),
        offset: Number(offset.toString()),
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
  canCreateChatConnector,
  async (req: Request, res: Response): Promise<void> => {
    const { platform } = req.params;
    const { sourceId, redirectUrl } = req.query as any;
    const userId = (req as any).user.id;

    try {
      // Verify source belongs to user
      if (sourceId) {
        const sourceCheck = await db.query<{ id: number }>(
          "SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2",
          [sourceId, userId],
        );

        if (sourceCheck.length === 0) {
          res.status(404).json({ error: "Stream source not found" });
          return;
        }
      }

      // Generate OAuth URL based on platform
      let oauthUrl: string;
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
            `https://www.facebook.com/v24.0/dialog/oauth?` +
            `client_id=${process.env.INSTAGRAM_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(
              process.env.INSTAGRAM_CALLBACK_URL ||
                `${process.env.BACKEND_URL}/api/chat/connectors/instagram/oauth/callback`,
            )}` +
            `&response_type=code` +
            `&scope=${encodeURIComponent(
              "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_engagement,pages_read_user_content",
            )}` +
            `&state=${state}`;
          break;
        default:
          res
            .status(400)
            .json({ error: `Unsupported platform: ${platform}` });
          return;
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
router.get("/connectors/:platform/oauth/callback", async (req: Request, res: Response): Promise<void> => {
  const { platform } = req.params;
  const { code, state, error } = req.query as any;

  try {
    if (error) {
      res.redirect(
        `${
          process.env.FRONTEND_URL
        }/dashboard/streaming?oauth_error=${encodeURIComponent(error)}`,
      );
      return;
    }

    if (!code || !state) {
      res.redirect(
        `${process.env.FRONTEND_URL}/dashboard/streaming?oauth_error=invalid_callback`,
      );
      return;
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
    const existingConnectors = await db.query<{ id: number }>(
      "SELECT id FROM chat_connectors WHERE source_id = $1 AND platform = $2",
      [sourceId, platform],
    );

    let connector: any;
    if (existingConnectors.length > 0) {
      // Update existing connector
      connector = await db.run<any>(
        "UPDATE chat_connectors SET config = $1, is_active = true WHERE id = $2 RETURNING *",
        [connectorConfig, existingConnectors[0].id],
      );
    } else {
      // Create new connector
      connector = await db.run<any>(
        "INSERT INTO chat_connectors (source_id, platform, connector_type, config) VALUES ($1, $2, $3, $4) RETURNING *",
        [sourceId, platform, "oauth", connectorConfig],
      );
    }

    // Track successful OAuth connection
    posthogService.trackAuthEvent(userId, "chat_connector_oauth_success", {
      platform,
      source_id: Number(sourceId),
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
async function exchangeCodeForTokens(platform: string, code: string): Promise<any> {
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
async function exchangeTwitchCodeForTokens(code: string): Promise<any> {
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
  } catch (error: any) {
    console.error(
      "Twitch token exchange error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to exchange Twitch authorization code");
  }
}

// YouTube OAuth token exchange
async function exchangeYouTubeCodeForTokens(code: string): Promise<any> {
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
      `client_id=${encodeURIComponent(process.env.GOOGLE_CLIENT_ID!)}&` +
        `client_secret=${encodeURIComponent(
          process.env.GOOGLE_CLIENT_SECRET!,
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
// @ts-ignore
      part: "snippet",
      mine: true,
    });

    // @ts-ignore
    if (
      // @ts-ignore
      !channelResponse.data.items ||
      // @ts-ignore
      channelResponse.data.items.length === 0
    ) {
// @ts-ignore
      throw new Error("No YouTube channel found for authenticated user");
    }

    // @ts-ignore
    const channel = channelResponse.data.items[0];
    const channelId = channel.id!;
    const channelTitle = channel.snippet?.title || '';

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
  } catch (error: any) {
    console.error(
      "YouTube token exchange error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to exchange YouTube authorization code");
  }
}

// Public chat endpoint - get messages by source ID (no authentication required)
router.get("/public/sources/:sourceId/messages", handleGenericIdParam('stream_sources'), async (req: Request, res: Response): Promise<void> => {
  const { sourceId } = req.params;
  const { limit = 50, offset = 0 } = req.query as any;

  try {
    // Verify source exists and is active
    const sourceCheck = await db.query<{ id: number; name: string; is_active: boolean }>(
      "SELECT id, name, is_active FROM stream_sources WHERE id = $1",
      [sourceId],
    );

    if (sourceCheck.length === 0) {
      res.status(404).json({ error: "Stream source not found" });
      return;
    }

    if (!sourceCheck[0].is_active) {
      res.status(400).json({ error: "Stream source is not active" });
      return;
    }

    // Get chat messages for this source
    const messages = await db.query<any>(
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
      [sourceId, Number(limit.toString()), Number(offset.toString())],
    );

    // Get total count
    const countResult = await db.query<{ total: string }>(
      "SELECT COUNT(*) as total FROM chat_messages WHERE source_id = $1",
      [sourceId],
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      total: Number(countResult[0].total),
      limit: Number(limit.toString()),
      offset: Number(offset.toString()),
    });
  } catch (error) {
    console.error("Get public chat messages error:", error);
    res.status(500).json({ error: "Failed to fetch chat messages" });
  }
});

// Instagram OAuth token exchange
async function exchangeInstagramCodeForTokens(code: string): Promise<any> {
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
      "https://graph.facebook.com/v20.0/oauth/access_token",
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

    // Get user info with the access token - focus on Instagram data
    const userResponse = await axios.get(
      `https://graph.facebook.com/v20.0/me?fields=id,name,accounts{id,name,access_token,instagram_business_account{id,username,name,media{id,caption,media_type,media_url,timestamp,comments{id,text,username,timestamp}}}}&access_token=${access_token}`,
    );

    const userData = userResponse.data;
    console.log("Instagram user info:", userData);
    console.log("Instagram user accounts data:", userData.accounts);

    // Find Instagram business account and get Live videos
    let instagramAccount: any = null;
    let liveVideoId: string | null = null;

    if (userData.accounts && userData.accounts.data.length > 0) {
      for (const account of userData.accounts.data) {
        if (account.instagram_business_account) {
          instagramAccount = account.instagram_business_account;
          console.log("Found Instagram business account:", instagramAccount);

          // Try to find active Live videos
          if (instagramAccount.media && instagramAccount.media.data) {
            for (const media of instagramAccount.media.data) {
              if (media.media_type === "VIDEO" && media.comments) {
                console.log("Found video with comments:", media);
                // This could be a Live video - we'll use this for testing
                liveVideoId = media.id;
                break;
              }
            }
          }
          break;
        }
      }
    }

    if (!instagramAccount) {
      console.log(
        "No Instagram business account found, trying to get Instagram account directly...",
      );

      // Try to get Instagram account directly
      try {
        const instagramResponse = await axios.get(
          `https://graph.facebook.com/v20.0/me/accounts?fields=instagram_business_account{id,username,name,media{id,caption,media_type,media_url,timestamp,comments{id,text,username,timestamp}}}&access_token=${access_token}`,
        );

        console.log("Instagram accounts response:", instagramResponse.data);

        if (
          instagramResponse.data.data &&
          instagramResponse.data.data.length > 0
        ) {
          for (const account of instagramResponse.data.data) {
            if (account.instagram_business_account) {
              instagramAccount = account.instagram_business_account;
              console.log(
                "Found Instagram business account via accounts endpoint:",
                instagramAccount,
              );
              break;
            }
          }
        }
      } catch (directError: any) {
        console.log(
          "Direct Instagram account fetch failed:",
          directError.message,
        );
      }

      if (!instagramAccount) {
        throw new Error(
          "No Instagram business account found for authenticated user. Please ensure you have an Instagram Business account connected to your Facebook account and try again.",
        );
      }
    }

    console.log("Instagram business account found:", instagramAccount);

    return {
      accessToken: access_token,
      expiresAt: new Date(Date.now() + expires_in * 1000).toISOString(),
      platformUserId: instagramAccount.id,
      platformUsername: instagramAccount.username,
      displayName: instagramAccount.name || instagramAccount.username,
      liveVideoId: liveVideoId,
      // Note: Instagram doesn't provide refresh tokens in basic flow
      // We'll need to handle token refresh separately
    };
  } catch (error: any) {
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

export default router;
