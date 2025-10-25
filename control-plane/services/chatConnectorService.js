const Database = require('../lib/database');
const WebSocketServer = require('../lib/websocket');
const axios = require('axios');
const { TwitchJs } = require('twitch-js');
const { google } = require('googleapis');

class ChatConnectorService {
  constructor(wsServer) {
    this.db = new Database();
    this.wsServer = wsServer;
    this.connectors = new Map();
  }

  // Initialize chat connectors for a source
  async initializeConnectorsForSource(sourceId) {
    try {
      const connectors = await this.db.query(
        'SELECT * FROM chat_connectors WHERE source_id = $1 AND is_active = true',
        [sourceId]
      );

      for (const connector of connectors) {
        await this.startConnector(connector);
      }

      console.log(`Initialized ${connectors.length} chat connectors for source ${sourceId}`);
    } catch (error) {
      console.error(`Failed to initialize connectors for source ${sourceId}:`, error);
    }
  }

  // Start a chat connector
  async startConnector(connector) {
    try {
      const { id, platform, config } = connector;

      // Platform-specific connector logic would go here
      switch (platform) {
        case 'twitch':
          await this.startTwitchConnector(connector);
          break;
        case 'youtube':
          await this.startYouTubeConnector(connector);
          break;
        case 'facebook':
          await this.startFacebookConnector(connector);
          break;
        case 'custom':
          await this.startCustomConnector(connector);
          break;
        default:
          console.warn(`Unknown platform: ${platform}`);
      }

      this.connectors.set(id, connector);
      console.log(`Started ${platform} chat connector for source ${connector.source_id}`);
    } catch (error) {
      console.error(`Failed to start connector ${connector.id}:`, error);
    }
  }

  // Stop a chat connector
  async stopConnector(connectorId) {
    try {
      const connector = this.connectors.get(connectorId);
      if (connector) {
        const { platform } = connector;

        // Platform-specific cleanup
        switch (platform) {
          case 'twitch':
            if (connector.twitchClient) {
              await connector.twitchClient.chat.disconnect();
              connector.twitchClient = null;
              console.log(`Disconnected from Twitch IRC`);
            }
            break;
          case 'youtube':
            if (connector.youtubePollingInterval) {
              clearInterval(connector.youtubePollingInterval);
              connector.youtubePollingInterval = null;
              console.log(`Stopped YouTube chat polling`);
            }
            break;
        }

        this.connectors.delete(connectorId);
        console.log(`Stopped chat connector ${connectorId}`);
      }
    } catch (error) {
      console.error(`Failed to stop connector ${connectorId}:`, error);
    }
  }

  // Platform-specific connector implementations
  async startTwitchConnector(connector) {
    const { config } = connector;
    console.log(`Starting Twitch connector for user: ${config.platformUsername}`);

    try {
      // Initialize Twitch.js client
      const twitchClient = new TwitchJs({
        username: config.platformUsername,
        token: config.accessToken,
        log: { level: 'warn' } // Reduce log noise
      });

      // Connect to IRC
      await twitchClient.chat.connect();
      console.log(`Connected to Twitch IRC as ${config.platformUsername}`);

      // Join the user's channel
      await twitchClient.chat.join(config.platformUsername);
      console.log(`Joined Twitch channel #${config.platformUsername}`);

      // Listen for chat messages
      twitchClient.chat.on('PRIVMSG', async (message) => {
        try {
          const messageData = {
            authorName: message.displayName || message.username,
            authorId: message.userId,
            messageText: message.message,
            platform: 'twitch',
            messageType: 'text',
            metadata: {
              color: message.color,
              emotes: message.emotes,
              badges: message.badges,
              timestamp: message.timestamp
            }
          };

          await this.handleIncomingMessage(connector, messageData);
        } catch (error) {
          console.error('Error handling Twitch message:', error);
        }
      });

      // Store the client for cleanup
      connector.twitchClient = twitchClient;

      // Send welcome message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Connected to ${config.displayName || config.platformUsername}'s Twitch chat`,
        platform: 'twitch',
        messageType: 'system',
        metadata: { connection: true }
      });

    } catch (error) {
      console.error('Failed to start Twitch connector:', error);

      // Send error message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Failed to connect to Twitch chat: ${error.message}`,
        platform: 'twitch',
        messageType: 'error',
        metadata: { error: true }
      });
    }
  }

  async startYouTubeConnector(connector) {
    const { config } = connector;
    console.log(`Starting YouTube connector for user: ${config.displayName}`);

    try {
      // Initialize YouTube API client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: config.accessToken });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Start polling for live chat messages
      this.startYouTubeChatPolling(connector, youtube);

      // Send connection message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Connected to ${config.displayName}'s YouTube chat`,
        platform: 'youtube',
        messageType: 'system',
        metadata: { connection: true }
      });

    } catch (error) {
      console.error('Failed to start YouTube connector:', error);

      // Send error message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Failed to connect to YouTube chat: ${error.message}`,
        platform: 'youtube',
        messageType: 'error',
        metadata: { error: true }
      });
    }
  }

  async startFacebookConnector(connector) {
    const { config } = connector;
    console.log(`Starting Facebook connector with config:`, config);

    // In production, this would:
    // 1. Use Facebook Live Comments API
    // 2. Listen for new comments
    // 3. Forward messages to WebSocket server
  }

  async startCustomConnector(connector) {
    const { config } = connector;
    console.log(`Starting Custom connector with config:`, config);

    // In production, this would:
    // 1. Set up webhook endpoints
    // 2. Listen for incoming webhook requests
    // 3. Forward messages to WebSocket server
  }

  // YouTube Live Chat polling implementation
  async startYouTubeChatPolling(connector, youtube) {
    let liveChatId = null;
    let nextPageToken = null;
    let pollingInterval = null;

    const pollChatMessages = async () => {
      try {
        if (!liveChatId) {
          // Find active live broadcast
          const liveResponse = await youtube.search.list({
            part: 'id',
            channelId: connector.config.platformUserId,
            type: 'video',
            eventType: 'live',
            maxResults: 1
          });

          if (liveResponse.data.items.length === 0) {
            console.log('No active live stream found for YouTube channel');
            return;
          }

          const videoId = liveResponse.data.items[0].id.videoId;

          // Get live chat details
          const videoResponse = await youtube.videos.list({
            part: 'liveStreamingDetails',
            id: videoId
          });

          const liveChatId = videoResponse.data.items[0].liveStreamingDetails.activeLiveChatId;
          if (!liveChatId) {
            console.log('No active live chat found for YouTube video');
            return;
          }

          connector.youtubeLiveChatId = liveChatId;
        }

        // Poll for live chat messages
        const chatResponse = await youtube.liveChatMessages.list({
          liveChatId: connector.youtubeLiveChatId,
          part: 'id,snippet,authorDetails',
          maxResults: 50,
          pageToken: nextPageToken
        });

        const messages = chatResponse.data.items;
        nextPageToken = chatResponse.data.nextPageToken;

        // Process each message
        for (const message of messages) {
          const messageData = {
            authorName: message.authorDetails.displayName,
            authorId: message.authorDetails.channelId,
            messageText: message.snippet.displayMessage,
            platform: 'youtube',
            messageType: message.snippet.type === 'superChatEvent' ? 'superchat' : 'text',
            metadata: {
              channelId: message.authorDetails.channelId,
              profileImageUrl: message.authorDetails.profileImageUrl,
              isChatModerator: message.authorDetails.isChatModerator,
              isChatOwner: message.authorDetails.isChatOwner,
              isChatSponsor: message.authorDetails.isChatSponsor,
              superChatDetails: message.snippet.superChatDetails
            }
          };

          await this.handleIncomingMessage(connector, messageData);
        }

      } catch (error) {
        console.error('Error polling YouTube chat:', error);
      }
    };

    // Start polling every 5 seconds
    pollingInterval = setInterval(pollChatMessages, 5000);
    connector.youtubePollingInterval = pollingInterval;

    // Initial poll
    pollChatMessages();
  }

  // Handle incoming message from platform connector
  async handleIncomingMessage(connector, messageData) {
    try {
      const { source_id } = connector;
      const { authorName, messageText, platform, messageType = 'text', metadata = {} } = messageData;

      // Save message to database
      const savedMessage = await this.wsServer.saveMessage(source_id, {
        connectorId: connector.id,
        platformMessageId: `sim_${Date.now()}`,
        authorName,
        authorId: `sim_${authorName.toLowerCase()}`,
        messageText,
        messageType,
        metadata: {
          ...metadata,
          platform,
          simulated: true
        }
      });

      // Broadcast to WebSocket clients
      await this.wsServer.broadcastMessage(source_id, savedMessage);

      console.log(`Processed message from ${platform}: ${authorName}: ${messageText}`);
    } catch (error) {
      console.error('Failed to handle incoming message:', error);
    }
  }

  // Get active connectors for a source
  getActiveConnectors(sourceId) {
    return Array.from(this.connectors.values()).filter(
      connector => connector.source_id === sourceId
    );
  }

  // Get all active connectors
  getAllActiveConnectors() {
    return Array.from(this.connectors.values());
  }

  // Initialize connectors for a source when a user connects (called from WebSocket)
  async initializeForSourceConnection(sourceId) {
    try {
      console.log(`Initializing chat connectors for source ${sourceId}`);
      await this.initializeConnectorsForSource(sourceId);
    } catch (error) {
      console.error(`Failed to initialize connectors for source ${sourceId}:`, error);
    }
  }
}

module.exports = ChatConnectorService;