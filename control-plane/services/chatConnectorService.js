const Database = require('../lib/database');
const WebSocketServer = require('../lib/websocket');
const axios = require('axios');
const tmi = require('tmi.js');
const YouTubeGrpcService = require('./youtubeGrpcService');

class ChatConnectorService {
  constructor(wsServer) {
    this.db = new Database();
    this.wsServer = wsServer;
    this.connectors = new Map();
    this.youtubeGrpcService = new YouTubeGrpcService(this);
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
          await this.startYouTubeGrpcConnector(connector);
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
              connector.twitchClient.disconnect();
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
            // Stop gRPC streaming
            await this.youtubeGrpcService.stopGrpcStreaming(connectorId);
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

    if (!config || !config.accessToken) {
      console.error('Twitch connector config or access token missing');
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: 'Twitch connector configuration is incomplete. Please reconnect your Twitch account.',
        platform: 'twitch',
        messageType: 'error',
        metadata: { error: true, config: !!config, accessToken: !!config?.accessToken }
      });
      return;
    }

    console.log(`Starting Twitch connector for user: ${config.platformUsername || 'Unknown'}`);

    try {
      // Initialize tmi.js client
      const options = {
        connection: {
          secure: true,
          reconnect: true,
          maxReconnectAttempts: 5,
          reconnectDecay: 1.5,
          reconnectInterval: 1000,
        },
        identity: {
          username: config.platformUsername,
          password: `oauth:${config.accessToken}`
        },
        channels: [config.platformUsername]
      };

      const client = new tmi.client(options);

      // Connect to Twitch
      client.connect().catch(console.error);
      console.log(`Connecting to Twitch IRC as ${config.platformUsername}`);

      // Listen for connection events
      client.on('connected', (addr, port) => {
        console.log(`Connected to Twitch IRC at ${addr}:${port}`);
      });

      client.on('join', (channel, username, self) => {
        if (!self) {
          console.log(`${username} joined ${channel}`);
        } else {
          console.log(`Joined Twitch channel ${channel}`);
        }
      });

      // Listen for chat messages
      client.on('message', async (channel, tags, message, self) => {
        if (self) return; // Ignore messages from the bot itself

        try {
          const messageData = {
            authorName: tags['display-name'] || tags.username,
            authorId: tags['user-id'],
            messageText: message,
            platform: 'twitch',
            messageType: 'text',
            metadata: {
              id: tags.id, // Use actual Twitch message ID
              color: tags.color,
              emotes: tags.emotes,
              badges: tags.badges,
              mod: tags.mod,
              subscriber: tags.subscriber,
              timestamp: tags['tmi-sent-ts']
            }
          };

          await this.handleIncomingMessage(connector, messageData);
        } catch (error) {
          console.error('Error handling Twitch message:', error);
        }
      });

      // Store the client for cleanup
      connector.twitchClient = client;

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

  async startYouTubeGrpcConnector(connector) {
    const { config } = connector;

    if (!config || !config.accessToken) {
      console.error('YouTube connector config or access token missing');
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: 'YouTube connector configuration is incomplete. Please reconnect your YouTube account.',
        platform: 'youtube',
        messageType: 'error',
        metadata: { error: true, config: !!config, accessToken: !!config?.accessToken }
      });
      return;
    }

    const displayName = config.displayName || config.platformUsername || 'YouTube User';
    console.log(`Starting YouTube gRPC connector for user: ${displayName}`);

    try {
      // Start gRPC streaming for real-time chat
      await this.youtubeGrpcService.startGrpcStreaming(connector);

      // Send connection message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Connected to ${displayName}'s YouTube chat via real-time streaming`,
        platform: 'youtube',
        messageType: 'system',
        metadata: { connection: true, streaming: true }
      });

    } catch (error) {
      console.error('Failed to start YouTube gRPC connector:', error);

      // Send error message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Failed to connect to YouTube chat via gRPC: ${error.message}`,
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

  // YouTube Live Chat smart polling implementation (kept for reference)
  // This method has been replaced by gRPC streaming in startYouTubeGrpcConnector

  // Handle incoming message from platform connector
  async handleIncomingMessage(connector, messageData) {
    try {
      const { source_id } = connector;
      const { authorName, messageText, platform, messageType = 'text', metadata = {} } = messageData;

      // Generate platform message ID based on actual platform data
      let platformMessageId;
      if (platform === 'youtube' && metadata.messageId) {
        platformMessageId = metadata.messageId;
      } else if (platform === 'twitch' && metadata.id) {
        platformMessageId = metadata.id;
      } else {
        // Fallback to timestamp-based ID
        platformMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      }

      // Broadcast message directly to WebSocket clients (no database storage)
      await this.wsServer.broadcastMessage(source_id, {
        connectorId: connector.id,
        platformMessageId,
        authorName,
        authorId: metadata.authorId || `user_${authorName.toLowerCase()}`,
        messageText,
        messageType,
        platform,
        metadata: {
          ...metadata,
          platform
        }
      });

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