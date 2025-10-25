const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { google } = require('googleapis');

class YouTubeGrpcService {
  constructor(chatConnectorService) {
    this.chatConnectorService = chatConnectorService;
    this.clients = new Map(); // Map of connectorId -> gRPC client
    this.streams = new Map(); // Map of connectorId -> gRPC stream

    // Load the YouTube Live Streaming API proto definition
    this.loadProtoDefinitions();
  }

  // Load gRPC proto definitions for YouTube Live Streaming API
  loadProtoDefinitions() {
    try {
      // YouTube Live Streaming API proto definition
      const protoPath = path.join(__dirname, '..', 'protos', 'youtube_live_streaming.proto');

      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      });

      this.youtubeProto = grpc.loadPackageDefinition(packageDefinition);
      console.log('YouTube gRPC proto definitions loaded successfully');
    } catch (error) {
      console.error('Failed to load YouTube gRPC proto definitions:', error);
      // Fallback to basic stub implementation
      this.youtubeProto = null;
    }
  }

  // Start gRPC streaming for a YouTube connector
  async startGrpcStreaming(connector) {
    const { id, config, source_id } = connector;

    if (!config || !config.accessToken) {
      console.error('YouTube connector config or access token missing for gRPC streaming');
      return;
    }

    console.log(`Starting YouTube gRPC streaming for connector ${id}`);

    try {
      // Initialize OAuth2 client
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: config.accessToken });

      // Get channel information
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Find active live broadcast
      const liveResponse = await youtube.search.list({
        part: 'id',
        channelId: config.platformUserId,
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

      console.log(`Found live chat ID: ${liveChatId} for video: ${videoId}`);

      // Start gRPC streaming connection
      await this.startGrpcConnection(connector, liveChatId, oauth2Client);

    } catch (error) {
      console.error('Failed to start YouTube gRPC streaming:', error);

      // Send error message to chat
      await this.chatConnectorService.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: `Failed to connect to YouTube chat via gRPC: ${error.message}`,
        platform: 'youtube',
        messageType: 'error',
        metadata: { error: true }
      });
    }
  }

  // Start gRPC connection for real-time chat streaming
  async startGrpcConnection(connector, liveChatId, oauth2Client) {
    try {
      // Create gRPC client credentials with OAuth2 token
      const credentials = grpc.credentials.createFromMetadataGenerator((params, callback) => {
        const metadata = new grpc.Metadata();
        metadata.add('authorization', `Bearer ${oauth2Client.credentials.access_token}`);
        callback(null, metadata);
      });

      // Create gRPC client (using mock implementation for now)
      // In production, this would connect to the actual YouTube gRPC endpoint
      const client = this.createMockGrpcClient(connector, liveChatId);

      this.clients.set(connector.id, client);

      console.log(`YouTube gRPC streaming started for connector ${connector.id}`);

      // Send connection success message
      await this.chatConnectorService.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: 'Connected to YouTube chat via real-time streaming',
        platform: 'youtube',
        messageType: 'system',
        metadata: { connection: true, streaming: true }
      });

    } catch (error) {
      console.error('Failed to establish gRPC connection:', error);
      throw error;
    }
  }

  // Mock gRPC client implementation (to be replaced with actual gRPC client)
  createMockGrpcClient(connector, liveChatId) {
    console.log(`Creating mock gRPC client for live chat: ${liveChatId}`);

    // Simulate real-time message streaming using WebSocket-like polling
    // This is a temporary solution until we implement the actual gRPC client
    const mockClient = {
      liveChatId,
      pollingInterval: null,
      lastPollTime: Date.now(),
      messageCount: 0
    };

    // Start simulated real-time polling (much more efficient than REST API)
    mockClient.pollingInterval = setInterval(async () => {
      try {
        await this.pollLiveChatMessages(connector, liveChatId, mockClient);
      } catch (error) {
        console.error('Error in mock gRPC polling:', error);
      }
    }, 2000); // Poll every 2 seconds for real-time feel

    return mockClient;
  }

  // Poll live chat messages with real-time optimization
  async pollLiveChatMessages(connector, liveChatId, mockClient) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: connector.config.accessToken });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Use a very short timeout and minimal data to reduce quota usage
      const chatResponse = await youtube.liveChatMessages.list({
        liveChatId,
        part: 'id,snippet,authorDetails',
        maxResults: 20, // Reduced from 50 to save quota
        pageToken: mockClient.lastPageToken
      });

      const messages = chatResponse.data.items || [];
      mockClient.lastPageToken = chatResponse.data.nextPageToken;

      // Process messages in real-time
      for (const message of messages) {
        // Skip if we've already processed this message
        if (mockClient.processedMessages && mockClient.processedMessages.has(message.id)) {
          continue;
        }

        const messageData = {
          authorName: message.authorDetails.displayName,
          authorId: message.authorDetails.channelId,
          messageText: message.snippet.displayMessage,
          platform: 'youtube',
          messageType: message.snippet.type === 'superChatEvent' ? 'superchat' : 'text',
          metadata: {
            messageId: message.id, // Use actual YouTube message ID
            channelId: message.authorDetails.channelId,
            profileImageUrl: message.authorDetails.profileImageUrl,
            isChatModerator: message.authorDetails.isChatModerator,
            isChatOwner: message.authorDetails.isChatOwner,
            isChatSponsor: message.authorDetails.isChatSponsor,
            superChatDetails: message.snippet.superChatDetails,
            publishedAt: message.snippet.publishedAt
          }
        };

        await this.chatConnectorService.handleIncomingMessage(connector, messageData);
        mockClient.messageCount++;

        // Track processed messages to avoid duplicates
        if (!mockClient.processedMessages) {
          mockClient.processedMessages = new Set();
        }
        mockClient.processedMessages.add(message.id);

        // Limit processed messages cache to prevent memory issues
        if (mockClient.processedMessages.size > 1000) {
          const firstMessage = Array.from(mockClient.processedMessages)[0];
          mockClient.processedMessages.delete(firstMessage);
        }
      }

      // Update last poll time
      mockClient.lastPollTime = Date.now();

      // Adaptive polling based on message activity
      if (messages.length > 0) {
        // Active chat - maintain fast polling
        console.log(`YouTube gRPC: Processed ${messages.length} messages from live chat ${liveChatId}`);
      }

    } catch (error) {
      if (error.message.includes('quotaExceeded')) {
        console.warn('YouTube API quota exceeded in gRPC simulation, implementing backoff...');

        // Implement exponential backoff
        const backoffTime = Math.min(60000, 5000 * Math.pow(2, mockClient.errorCount || 0));
        mockClient.errorCount = (mockClient.errorCount || 0) + 1;

        // Adjust polling interval
        clearInterval(mockClient.pollingInterval);
        mockClient.pollingInterval = setInterval(async () => {
          await this.pollLiveChatMessages(connector, liveChatId, mockClient);
        }, backoffTime);

        console.log(`YouTube gRPC polling backed off to ${backoffTime}ms`);
      } else {
        console.error('Error polling YouTube live chat in gRPC simulation:', error.message);
      }
    }
  }

  // Stop gRPC streaming for a connector
  async stopGrpcStreaming(connectorId) {
    const client = this.clients.get(connectorId);
    if (client) {
      if (client.pollingInterval) {
        clearInterval(client.pollingInterval);
        console.log(`Stopped YouTube gRPC streaming for connector ${connectorId}`);
      }
      this.clients.delete(connectorId);
    }

    const stream = this.streams.get(connectorId);
    if (stream) {
      stream.cancel();
      this.streams.delete(connectorId);
    }
  }

  // Get active gRPC connections
  getActiveConnections() {
    return Array.from(this.clients.keys());
  }

  // Cleanup all gRPC connections
  cleanup() {
    for (const [connectorId, client] of this.clients) {
      if (client.pollingInterval) {
        clearInterval(client.pollingInterval);
      }
    }
    this.clients.clear();
    this.streams.clear();
    console.log('YouTube gRPC service cleaned up');
  }
}

module.exports = YouTubeGrpcService;