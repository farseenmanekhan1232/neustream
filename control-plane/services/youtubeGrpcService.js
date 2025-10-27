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
    this.messageHistory = new Map(); // Map of connectorId -> Set of processed message IDs
    this.lastMessageTimestamp = new Map(); // Map of connectorId -> timestamp of last processed message

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
      // Use mine: true to get broadcasts for the authenticated user
      // Include status part to get lifecycle status
      const broadcastsResponse = await youtube.liveBroadcasts.list({
        part: 'snippet,status',
        mine: true
      });

      console.log('YouTube broadcasts response:', {
        totalItems: broadcastsResponse.data.items?.length || 0,
        items: broadcastsResponse.data.items?.map(item => ({
          id: item.id,
          title: item.snippet?.title,
          status: item.status?.lifeCycleStatus,
          liveChatId: item.snippet?.liveChatId
        }))
      });

      if (broadcastsResponse.data.items.length === 0) {
        console.log('No live broadcasts found for YouTube channel');
        return null;
      }

      // Find the first active broadcast - check multiple possible status values
      const activeBroadcast = broadcastsResponse.data.items.find(
        broadcast => {
          // Debug the actual broadcast structure
          console.log('Broadcast structure:', {
            id: broadcast.id,
            title: broadcast.snippet?.title,
            status: broadcast.status,
            lifeCycleStatus: broadcast.status?.lifeCycleStatus,
            statusActual: broadcast.status?.lifeCycleStatus || broadcast.status
          });

          const status = broadcast.status?.lifeCycleStatus || broadcast.status;
          console.log(`Checking broadcast "${broadcast.snippet.title}" with status: ${status}`);
          return status === 'live' || status === 'active' || status === 'streaming';
        }
      );

      if (!activeBroadcast) {
        console.log('No active live broadcast found for YouTube channel');
        console.log('Available broadcasts:', broadcastsResponse.data.items.map(b => ({
          title: b.snippet.title,
          status: b.status?.lifeCycleStatus || b.status,
          liveChatId: b.snippet.liveChatId
        })));
        return null;
      }

      const liveChatId = activeBroadcast.snippet.liveChatId;

      if (!liveChatId) {
        console.log('No live chat ID found for active broadcast');
        return null;
      }

      console.log(`Found live chat ID: ${liveChatId} for broadcast: ${activeBroadcast.snippet.title}`);
      return liveChatId;
    } catch (error) {
      console.error('Failed to get live chat ID:', error);
      throw error;
    }
  }

  // Start real gRPC streaming connection
  async startRealGrpcConnection(connector, liveChatId, accessToken) {
    try {
      // Initialize message history for this connector
      if (!this.messageHistory.has(connector.id)) {
        this.messageHistory.set(connector.id, new Set());
        this.lastMessageTimestamp.set(connector.id, 0);
      }

      // Create gRPC channel with optimized keep-alive settings to prevent "excess pings" errors
      const credentials = grpc.credentials.createSsl();

      // Configure channel options for persistent streaming - optimized for YouTube's requirements
      const channelOptions = {
        'grpc.keepalive_time_ms': 30000,           // Send keepalive ping every 30 seconds (increased from 10s)
        'grpc.keepalive_timeout_ms': 10000,        // Wait 10 seconds for keepalive ping ack (increased from 5s)
        'grpc.keepalive_permit_without_calls': 1,  // Allow keepalive pings without active calls
        'grpc.http2.max_pings_without_data': 2,    // Limit to 2 pings without data (was 0 - unlimited)
        'grpc.http2.min_time_between_pings_ms': 30000,  // Minimum 30 seconds between pings (increased from 10s)
        'grpc.http2.min_ping_interval_without_data_ms': 30000,  // Minimum 30 seconds between pings without data (increased from 5s)
        'grpc.max_receive_message_length': 16777216,  // 16MB max message size
        'grpc.max_send_message_length': 16777216,     // 16MB max send size
        'grpc.enable_retries': 0,                   // Disable retries for streaming
        'grpc.http2.max_ping_strikes': 2,          // Maximum ping strikes before connection is closed
        'grpc.client_idle_timeout_ms': 0,          // No idle timeout for persistent streaming
      };

      const channel = new grpc.Client('dns:///youtube.googleapis.com:443', credentials, channelOptions);

      // Create stub for the service
      const stub = new this.youtubeProto.youtube.api.v3.V3DataLiveChatMessageService(
        'dns:///youtube.googleapis.com:443',
        credentials,
        channelOptions
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

      // Set deadline for the streaming call (no timeout for persistent streaming)
      const deadline = new Date();
      deadline.setHours(deadline.getHours() + 24); // 24 hour deadline

      // Start streaming with proper call options
      const callOptions = {
        deadline: deadline.getTime(),
        // No timeout for streaming calls
      };

      const stream = stub.StreamList(request, metadata, callOptions);

      // Store the stream for cleanup
      this.streams.set(connector.id, stream);

      // Handle incoming messages
      stream.on('data', (response) => {
        this.handleGrpcResponse(connector, response);
      });

      stream.on('error', (error) => {
        console.error(`YouTube gRPC stream error for connector ${connector.id}:`, {
          code: error.code,
          details: error.details,
          metadata: error.metadata,
          message: error.message,
          stack: error.stack
        });
        this.handleGrpcError(connector, error);
      });

      stream.on('end', () => {
        console.log(`YouTube gRPC stream ended for connector ${connector.id}`);
        this.streams.delete(connector.id);
        // Attempt intelligent reconnection - preserve message history to prevent duplicates
        console.log(`Attempting intelligent reconnection for connector ${connector.id}`);
        setTimeout(() => {
          this.startGrpcStreaming(connector).catch(err => {
            console.error(`Failed to reconnect gRPC stream for connector ${connector.id}:`, err);
          });
        }, 2000); // 2 second delay before reconnection (increased for stability)
      });

      // Handle stream status changes
      stream.on('status', (status) => {
        console.log(`YouTube gRPC stream status for connector ${connector.id}:`, status);
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

        // Track new messages for deduplication
        const newMessages = [];
        const messageHistory = this.messageHistory.get(connector.id);
        let lastTimestamp = this.lastMessageTimestamp.get(connector.id) || 0;

        for (const message of response.items) {
          const messageId = message.id;
          const messageTimestamp = new Date(message.snippet?.published_at || 0).getTime();

          // Skip if we've already processed this message
          if (messageHistory.has(messageId)) {
            console.log(`Skipping duplicate message: ${messageId}`);
            continue;
          }

          // Skip if message is older than our last processed message (except for initial connection)
          if (lastTimestamp > 0 && messageTimestamp < lastTimestamp) {
            console.log(`Skipping old message: ${messageId} (timestamp: ${messageTimestamp}, last: ${lastTimestamp})`);
            continue;
          }

          // Add to history and process
          messageHistory.add(messageId);
          newMessages.push(message);

          // Update last timestamp
          if (messageTimestamp > lastTimestamp) {
            lastTimestamp = messageTimestamp;
          }
        }

        // Update last message timestamp
        if (lastTimestamp > 0) {
          this.lastMessageTimestamp.set(connector.id, lastTimestamp);
        }

        // Clean up old message history (keep last 1000 messages)
        if (messageHistory.size > 1000) {
          const messagesToKeep = Array.from(messageHistory).slice(-1000);
          this.messageHistory.set(connector.id, new Set(messagesToKeep));
        }

        console.log(`YouTube gRPC: Processing ${newMessages.length} new messages (filtered ${response.items.length - newMessages.length} duplicates)`);

        // Process only new messages
        for (const message of newMessages) {
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

    // Intelligent reconnection with exponential backoff
    const errorCode = error.code;
    let retryDelay = 5000; // Default 5 seconds

    // Adjust retry delay based on error type
    if (errorCode === grpc.status.UNAVAILABLE) {
      retryDelay = 10000; // 10 seconds for unavailable service
    } else if (errorCode === grpc.status.RESOURCE_EXHAUSTED) {
      retryDelay = 30000; // 30 seconds for rate limiting
    } else if (errorCode === grpc.status.UNAUTHENTICATED) {
      retryDelay = 60000; // 60 seconds for authentication issues (likely token expiration)
    }

    console.log(`Will attempt to restart gRPC stream for connector ${connector.id} in ${retryDelay}ms (error code: ${errorCode})`);

    // Try to restart the stream after the calculated delay
    setTimeout(() => {
      console.log(`Attempting to restart gRPC stream for connector ${connector.id}`);
      this.startGrpcStreaming(connector).catch(console.error);
    }, retryDelay);
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

    // Clean up message history for this connector
    if (this.messageHistory.has(connectorId)) {
      this.messageHistory.delete(connectorId);
      this.lastMessageTimestamp.delete(connectorId);
      console.log(`Cleared message history for connector ${connectorId}`);
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
    this.messageHistory.clear();
    this.lastMessageTimestamp.clear();
    console.log('YouTube gRPC service cleaned up');
  }
}

module.exports = YouTubeGrpcService;