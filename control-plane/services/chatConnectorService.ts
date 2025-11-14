// @ts-nocheck
import axios from 'axios';
import * as tmi from 'tmi.js';
import YouTubeGrpcService from './youtubeGrpcService';
import Database from '../lib/database';
import { WebSocketServer } from 'ws';
import EventSource from 'eventsource';

// Type definitions
export interface ChatConnectorConfig {
  accessToken?: string;
  platformUsername?: string;
  displayName?: string;
  liveVideoId?: string;
  [key: string]: any;
}

export interface ChatConnectorRecord {
  id: number;
  source_id: number;
  platform: string;
  username?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
  config?: ChatConnectorConfig;
  // Platform-specific properties
// @ts-ignore
  twitchClient?: tmi.Client;
  youtubePollingInterval?: NodeJS.Timeout;
  instagramEventSource?: any;
  instagramPollingInterval?: NodeJS.Timeout;
}

export interface IncomingMessageData {
  authorName: string;
  authorId?: string;
  messageText: string;
  platform: string;
  messageType?: string;
  metadata?: Record<string, any>;
}

export interface BroadcastMessage {
  connectorId: number;
  platformMessageId: string;
  authorName: string;
  authorId: string;
  messageText: string;
  messageType: string;
  platform: string;
  metadata: Record<string, any>;
}

class ChatConnectorService {
  private db: Database;
  private wsServer: WebSocketServer;
  private connectors: Map<number, ChatConnectorRecord>;
  private youtubeGrpcService: YouTubeGrpcService;

  constructor(wsServer: WebSocketServer) {
    this.db = new Database();
    this.wsServer = wsServer;
    this.connectors = new Map();
    this.youtubeGrpcService = new YouTubeGrpcService(this);
  }

  // Initialize chat connectors for a source
  async initializeConnectorsForSource(sourceId: number): Promise<void> {
    try {
      const connectors = await this.db.query<ChatConnectorRecord>(
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
  async startConnector(connector: ChatConnectorRecord): Promise<void> {
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
        case 'instagram':
          await this.startInstagramConnector(connector);
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
  async stopConnector(connectorId: number): Promise<void> {
    try {
      const connector = this.connectors.get(connectorId);
      if (connector) {
        const { platform } = connector;

        // Platform-specific cleanup
        switch (platform) {
          case 'twitch':
            if (connector.twitchClient) {
              connector.twitchClient.disconnect();
              connector.twitchClient = undefined;
              console.log(`Disconnected from Twitch IRC`);
            }
            break;
          case 'youtube':
            if (connector.youtubePollingInterval) {
              clearInterval(connector.youtubePollingInterval);
              connector.youtubePollingInterval = undefined;
              console.log(`Stopped YouTube chat polling`);
            }
            // Stop gRPC streaming
            await this.youtubeGrpcService.stopGrpcStreaming(connectorId);
            break;
          case 'instagram':
            if (connector.instagramEventSource) {
              connector.instagramEventSource.close();
              connector.instagramEventSource = undefined;
              console.log(`Closed Instagram SSE connection`);
            }
            if (connector.instagramPollingInterval) {
              clearInterval(connector.instagramPollingInterval);
              connector.instagramPollingInterval = undefined;
              console.log(`Stopped Instagram chat polling`);
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
  async startTwitchConnector(connector: ChatConnectorRecord): Promise<void> {
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
// @ts-ignore
      // Initialize tmi.js client
      const options: tmi.Options = {
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
// @ts-ignore
      };

      const client = new tmi.client(options);

      // Connect to Twitch
      client.connect().catch(console.error);
      console.log(`Connecting to Twitch IRC as ${config.platformUsername}`);

      // Listen for connection events
      client.on('connected', (addr: string, port: number) => {
        console.log(`Connected to Twitch IRC at ${addr}:${port}`);
      });

      client.on('join', (channel: string, username: string, self: boolean) => {
        if (!self) {
          console.log(`${username} joined ${channel}`);
        } else {
          console.log(`Joined Twitch channel ${channel}`);
        }
// @ts-ignore
      });

      // Listen for chat messages
      client.on('message', async (channel: string, tags: tmi.ChatUser, message: string, self: boolean) => {
        if (self) return; // Ignore messages from the bot itself

        try {
          const messageData: IncomingMessageData = {
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

    } catch (error: any) {
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

  async startYouTubeGrpcConnector(connector: ChatConnectorRecord): Promise<void> {
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

    } catch (error: any) {
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

  async startInstagramConnector(connector: ChatConnectorRecord): Promise<void> {
    const { config } = connector;

    if (!config || !config.accessToken || !config.liveVideoId) {
      console.error('Instagram connector config, access token, or live video ID missing');
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: 'Instagram connector configuration is incomplete. Please reconnect your Instagram account and ensure you have an active live stream.',
        platform: 'instagram',
        messageType: 'error',
        metadata: {
          error: true,
          config: !!config,
          accessToken: !!config?.accessToken,
          liveVideoId: !!config?.liveVideoId
        }
      });
      return;
    }

    const displayName = config.displayName || config.platformUsername || 'Instagram User';
    console.log(`Starting Instagram connector for live video: ${config.liveVideoId}`);

    try {
      // Try Server-Sent Events (SSE) for real-time comments first
      await this.startInstagramSSE(connector);

      // Send connection message
      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Connected to ${displayName}'s Instagram Live comments via real-time streaming`,
        platform: 'instagram',
        messageType: 'system',
        metadata: { connection: true, streaming: true }
      });

    } catch (error: any) {
      console.error('Failed to start Instagram SSE connector:', error);

      // Fallback to polling
      console.log('Falling back to Instagram polling mode');
      await this.startInstagramPolling(connector);

      await this.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Connected to ${displayName}'s Instagram Live comments via polling`,
        platform: 'instagram',
        messageType: 'system',
        metadata: { connection: true, polling: true }
      });
    }
  }

  async startInstagramSSE(connector: ChatConnectorRecord): Promise<void> {
    const { config } = connector;
    const { accessToken, liveVideoId } = config!;

    // Instagram SSE endpoint for real-time comments
    const sseUrl = `https://streaming-graph.facebook.com/${liveVideoId}/live_comments?access_token=${accessToken}`;

    console.log(`Starting Instagram SSE connection to: ${sseUrl}`);

    try {
      // Use EventSource for Server-Sent Events
      const eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        console.log('Instagram SSE connection opened');
      };

      eventSource.onmessage = async (event: any) => {
        try {
          // Skip ping messages
          if (event.data === ': ping') {
            return;
          }

          const comment = JSON.parse(event.data);
          await this.handleInstagramComment(connector, comment);
        } catch (error) {
          console.error('Error processing Instagram SSE message:', error);
        }
      };

      eventSource.onerror = (error: any) => {
        console.error('Instagram SSE error:', error);
        // SSE failed, fallback to polling
        if (connector.instagramEventSource) {
          connector.instagramEventSource.close();
          connector.instagramEventSource = null;
        }
        this.startInstagramPolling(connector);
      };

      // Store for cleanup
      connector.instagramEventSource = eventSource;

    } catch (error: any) {
      console.error('Failed to create Instagram SSE connection:', error);
      throw error; // Let caller handle fallback
    }
  }

  async startInstagramPolling(connector: ChatConnectorRecord): Promise<void> {
    const { config } = connector;
    const { accessToken, liveVideoId } = config!;

    console.log(`Starting Instagram polling for live video: ${liveVideoId}`);

    // Track last comment ID to avoid duplicates
    let lastCommentId: string | null = null;

    const pollComments = async () => {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/${liveVideoId}/comments?access_token=${accessToken}&limit=50`
        );

        const comments = response.data.data || [];

        // Process comments in reverse order (oldest first)
        for (const comment of comments.reverse()) {
          // Skip if we've already processed this comment
          if (lastCommentId && comment.id <= lastCommentId) {
            continue;
          }

          await this.handleInstagramComment(connector, comment);

          // Update last comment ID
          if (!lastCommentId || comment.id > lastCommentId) {
            lastCommentId = comment.id;
          }
        }

      } catch (error: any) {
        console.error('Instagram polling error:', error.response?.data || error.message);
      }
    };

    // Initial poll
    await pollComments();

    // Set up polling interval (every 5 seconds)
    connector.instagramPollingInterval = setInterval(pollComments, 5000);
  }

  async handleInstagramComment(connector: ChatConnectorRecord, comment: any): Promise<void> {
    try {
      const messageData: IncomingMessageData = {
        authorName: comment.from?.name || 'Instagram User',
        authorId: comment.from?.id || 'unknown',
        messageText: comment.message,
        platform: 'instagram',
        messageType: 'text',
        metadata: {
          id: comment.id,
          created_time: comment.created_time,
          view_id: comment.view_id,
          from: comment.from
        }
      };

      await this.handleIncomingMessage(connector, messageData);
    } catch (error) {
      console.error('Error handling Instagram comment:', error);
    }
  }

  async startFacebookConnector(connector: ChatConnectorRecord): Promise<void> {
    const { config } = connector;
    console.log(`Starting Facebook connector with config:`, config);

    // In production, this would:
    // 1. Use Facebook Live Comments API
    // 2. Listen for new comments
    // 3. Forward messages to WebSocket server
  }

  async startCustomConnector(connector: ChatConnectorRecord): Promise<void> {
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
  async handleIncomingMessage(connector: ChatConnectorRecord, messageData: IncomingMessageData): Promise<void> {
    try {
      const { source_id } = connector;
      const { authorName, messageText, platform, messageType = 'text', metadata = {} } = messageData;

      // Generate platform message ID based on actual platform data
      let platformMessageId: string;
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
  getActiveConnectors(sourceId: number): ChatConnectorRecord[] {
    return Array.from(this.connectors.values()).filter(
      connector => connector.source_id === sourceId
    );
  }

  // Get all active connectors
  getAllActiveConnectors(): ChatConnectorRecord[] {
    return Array.from(this.connectors.values());
  }

  // Initialize connectors for a source when a user connects (called from WebSocket)
  async initializeForSourceConnection(sourceId: number): Promise<void> {
    try {
      console.log(`Initializing chat connectors for source ${sourceId}`);
      await this.initializeConnectorsForSource(sourceId);
    } catch (error) {
      console.error(`Failed to initialize connectors for source ${sourceId}:`, error);
    }
  }

  /**
   * Disconnect all chat connectors for a user
   */
  async disconnectUserConnectors(userId: number): Promise<number> {
    try {
      const userConnectors = await this.db.query<ChatConnectorRecord>(`
        SELECT cc.* FROM chat_connectors cc
        JOIN stream_sources ss ON cc.source_id = ss.id
        WHERE ss.user_id = $1 AND cc.is_active = true
      `, [userId]);

      console.log(`Disconnecting ${userConnectors.length} chat connectors for user ${userId}`);

      for (const connector of userConnectors) {
        await this.stopConnector(connector.id);
        await this.db.run(
          'UPDATE chat_connectors SET is_active = false WHERE id = $1',
          [connector.id]
        );
        console.log(`Disconnected chat connector ${connector.id} for user ${userId}`);
      }

      return userConnectors.length;
    } catch (error) {
      console.error(`Failed to disconnect chat connectors for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Gracefully disconnect connectors for users with expired subscriptions
   * Keeps the most recently used connector active for free tier
   */
  async disconnectExpiredSubscriptionConnectors(userId: number): Promise<number> {
    try {
      const userConnectors = await this.db.query<ChatConnectorRecord>(`
        SELECT cc.* FROM chat_connectors cc
        JOIN stream_sources ss ON cc.source_id = ss.id
        WHERE ss.user_id = $1 AND cc.is_active = true
        ORDER BY cc.updated_at DESC
      `, [userId]);

      if (userConnectors.length === 0) {
        return 0;
      }

      console.log(`Gracefully disconnecting ${userConnectors.length - 1} chat connectors for expired subscription user ${userId}`);

      // Keep the most recently used connector active
      const connectorsToDisconnect = userConnectors.slice(1);

      for (const connector of connectorsToDisconnect) {
        await this.stopConnector(connector.id);
        await this.db.run(
          'UPDATE chat_connectors SET is_active = false WHERE id = $1',
          [connector.id]
        );
        console.log(`Gracefully disconnected chat connector ${connector.id} for user ${userId}`);
      }

      return connectorsToDisconnect.length;
    } catch (error) {
      console.error(`Failed to gracefully disconnect chat connectors for user ${userId}:`, error);
      throw error;
    }
  }
}

export default ChatConnectorService;
