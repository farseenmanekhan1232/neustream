const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const fs = require('fs');
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
      // Load the proto file directly
      const protoPath = path.join(__dirname, '../protos/stream_list.proto');

      // Parse the proto content from the file
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
    const { id, config } = connector;

    if (!config || !config.accessToken) {
      console.error('YouTube connector config or access token missing for gRPC streaming');
      return;
    }

    console.log(`Starting YouTube gRPC streaming for connector ${id}`);

    try {
      // Get live chat ID using REST API (this is the only REST call needed)
      const liveChatId = await this.getLiveChatId(config);
      if (!liveChatId) {
        console.log('No active live chat found for YouTube channel');
        return;
      }

      console.log(`Found live chat ID: ${liveChatId}`);

      // Start real gRPC streaming connection
      await this.startRealGrpcConnection(connector, liveChatId, config.accessToken);

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

  // Get live chat ID using REST API (optimized for quota usage)
  async getLiveChatId(config) {
    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: config.accessToken });

      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // Find active live broadcast using LiveBroadcasts API (more efficient than Search API)
      const broadcastsResponse = await youtube.liveBroadcasts.list({
        part: 'snippet',
        broadcastStatus: 'active',
        mine: true
      });

      if (broadcastsResponse.data.items.length === 0) {
        console.log('No active live broadcast found for YouTube channel');
        return null;
      }

      const broadcast = broadcastsResponse.data.items[0];
      const liveChatId = broadcast.snippet.liveChatId;

      if (!liveChatId) {
        console.log('No live chat ID found for active broadcast');
        return null;
      }

      console.log(`Found live chat ID: ${liveChatId} for broadcast: ${broadcast.snippet.title}`);
      return liveChatId;
    } catch (error) {
      console.error('Failed to get live chat ID:', error);
      throw error;
    }
  }

  // Start real gRPC streaming connection
  async startRealGrpcConnection(connector, liveChatId, accessToken) {
    try {
      // Create gRPC channel
      const credentials = grpc.credentials.createSsl();
      const channel = new grpc.Client('dns:///youtube.googleapis.com:443', credentials);

      // Create stub for the service
      const stub = new this.youtubeProto.youtube.api.v3.V3DataLiveChatMessageService(
        'dns:///youtube.googleapis.com:443',
        credentials
      );

      // Create metadata with OAuth token
      const metadata = new grpc.Metadata();
      metadata.add('authorization', `Bearer ${accessToken}`);

      // Create request
      const request = {
        live_chat_id: liveChatId,
        part: ['snippet', 'authorDetails'],
        max_results: 20
      };

      // Start streaming
      const stream = stub.StreamList(request, metadata);

      // Store the stream for cleanup
      this.streams.set(connector.id, stream);

      // Handle incoming messages
      stream.on('data', (response) => {
        this.handleGrpcResponse(connector, response);
      });

      stream.on('error', (error) => {
        console.error('YouTube gRPC stream error:', error);
        this.handleGrpcError(connector, error);
      });

      stream.on('end', () => {
        console.log(`YouTube gRPC stream ended for connector ${connector.id}`);
        this.streams.delete(connector.id);
      });

      console.log(`YouTube gRPC streaming started for connector ${connector.id}`);

      // Send connection success message
      await this.chatConnectorService.handleIncomingMessage(connector, {
        authorName: 'System',
        authorId: 'system',
        messageText: 'Connected to YouTube chat via real-time gRPC streaming',
        platform: 'youtube',
        messageType: 'system',
        metadata: { connection: true, streaming: true, grpc: true }
      });

    } catch (error) {
      console.error('Failed to establish gRPC connection:', error);
      throw error;
    }
  }

  // Handle gRPC response with chat messages
  handleGrpcResponse(connector, response) {
    try {
      if (response.items && response.items.length > 0) {
        console.log(`YouTube gRPC: Received ${response.items.length} messages`);

        for (const message of response.items) {
          this.processGrpcMessage(connector, message);
        }
      }
    } catch (error) {
      console.error('Error handling gRPC response:', error);
    }
  }

  // Process individual gRPC message
  async processGrpcMessage(connector, message) {
    try {
      const snippet = message.snippet;
      const authorDetails = message.author_details;

      if (!snippet || !authorDetails || !snippet.display_message) {
        return; // Skip silent or invalid messages
      }

      const messageData = {
        authorName: authorDetails.display_name,
        authorId: authorDetails.channel_id,
        messageText: snippet.display_message,
        platform: 'youtube',
        messageType: this.getMessageType(snippet.type),
        metadata: {
          messageId: message.id,
          channelId: authorDetails.channel_id,
          profileImageUrl: authorDetails.profile_image_url,
          isChatModerator: authorDetails.is_chat_moderator,
          isChatOwner: authorDetails.is_chat_owner,
          isChatSponsor: authorDetails.is_chat_sponsor,
          publishedAt: snippet.published_at,
          messageType: snippet.type
        }
      };

      await this.chatConnectorService.handleIncomingMessage(connector, messageData);
    } catch (error) {
      console.error('Error processing gRPC message:', error);
    }
  }

  // Map gRPC message type to our message type
  getMessageType(grpcType) {
    const typeMap = {
      TEXT_MESSAGE_EVENT: 'text',
      SUPER_CHAT_EVENT: 'superchat',
      SUPER_STICKER_EVENT: 'supersticker',
      NEW_SPONSOR_EVENT: 'subscription',
      MEMBER_MILESTONE_CHAT_EVENT: 'milestone',
      MEMBERSHIP_GIFTING_EVENT: 'gifting',
      GIFT_MEMBERSHIP_RECEIVED_EVENT: 'gift_received'
    };

    return typeMap[grpcType] || 'text';
  }

  // Handle gRPC stream errors
  async handleGrpcError(connector, error) {
    console.error(`YouTube gRPC error for connector ${connector.id}:`, error);

    // Send error message to chat
    await this.chatConnectorService.handleIncomingMessage(connector, {
      authorName: 'System',
      authorId: 'system',
      messageText: `YouTube chat streaming error: ${error.message}`,
      platform: 'youtube',
      messageType: 'error',
      metadata: { error: true }
    });

    // Try to restart the stream after a delay
    setTimeout(() => {
      console.log(`Attempting to restart gRPC stream for connector ${connector.id}`);
      this.startGrpcStreaming(connector).catch(console.error);
    }, 5000);
  }

  // Stop gRPC streaming for a connector
  async stopGrpcStreaming(connectorId) {
    const stream = this.streams.get(connectorId);
    if (stream) {
      stream.cancel();
      this.streams.delete(connectorId);
      console.log(`Stopped YouTube gRPC streaming for connector ${connectorId}`);
    }

    const client = this.clients.get(connectorId);
    if (client) {
      this.clients.delete(connectorId);
    }
  }

  // Get active gRPC connections
  getActiveConnections() {
    return Array.from(this.streams.keys());
  }

  // Cleanup all gRPC connections
  cleanup() {
    for (const [connectorId, stream] of this.streams) {
      stream.cancel();
    }
    this.clients.clear();
    this.streams.clear();
    console.log('YouTube gRPC service cleaned up');
  }
}

module.exports = YouTubeGrpcService;