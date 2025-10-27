const { Server } = require('socket.io');
const Database = require('./database');
const { authenticateToken } = require('../middleware/auth');

class WebSocketServer {
  constructor(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          "https://www.neustream.app",
          "https://neustream.app",
          "https://admin.neustream.app",
          "http://localhost:5173"
        ],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.db = new Database();
    this.chatConnectorService = null;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  // Set chat connector service reference
  setChatConnectorService(chatConnectorService) {
    this.chatConnectorService = chatConnectorService;
  }

  setupMiddleware() {
    // Socket.io middleware for authentication
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const sourceId = socket.handshake.auth.sourceId;

      // Allow anonymous connections for public chat access
      if (!token && sourceId) {
        // Public chat connection - validate source exists and is active
        this.db.query(
          'SELECT id, name, is_active FROM stream_sources WHERE id = $1',
          [sourceId]
        ).then(sourceCheck => {
          if (sourceCheck.length === 0) {
            return next(new Error('Public chat error: Source not found'));
          }
          if (!sourceCheck[0].is_active) {
            return next(new Error('Public chat error: Source is not active'));
          }

          // Set anonymous user data
          socket.user = {
            id: `public_${sourceId}`,
            displayName: 'Anonymous Viewer',
            isPublic: true
          };
          socket.sourceId = sourceId;
          next();
        }).catch(error => {
          next(new Error('Public chat error: Failed to validate source'));
        });
        return;
      }

      // Authenticated connection (existing logic)
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      try {
        let userData;
        if (typeof token === 'string') {
          try {
            userData = JSON.parse(token);
          } catch {
            userData = { id: token };
          }
        } else {
          userData = token;
        }

        socket.user = userData;
        next();
      } catch (error) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user?.id} connected to WebSocket`);

      // Join chat room for a specific source
      socket.on('join_chat', async (data) => {
        try {
          const { sourceId } = data;

          if (!sourceId) {
            socket.emit('error', { message: 'Source ID is required' });
            return;
          }

          // For public connections, use the sourceId from handshake
          const effectiveSourceId = socket.sourceId || sourceId;

          // Verify source exists and is active
          const sources = await this.db.query(
            'SELECT id, is_active FROM stream_sources WHERE id = $1',
            [effectiveSourceId]
          );

          if (sources.length === 0) {
            socket.emit('error', { message: 'Stream source not found' });
            return;
          }

          if (!sources[0].is_active) {
            socket.emit('error', { message: 'Stream source is not active' });
            return;
          }

          // For authenticated users, verify ownership
          if (!socket.user.isPublic) {
            const userSources = await this.db.query(
              'SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2',
              [effectiveSourceId, socket.user.id]
            );

            if (userSources.length === 0) {
              socket.emit('error', { message: 'Access denied to source' });
              return;
            }
          }

          // Join the room for this source
          socket.join(`source_${effectiveSourceId}`);
          console.log(`User ${socket.user.id} joined chat for source ${effectiveSourceId}`);

          // Send recent messages
          const recentMessages = await this.getRecentMessages(effectiveSourceId);
          socket.emit('chat_history', { messages: recentMessages });

          // Initialize chat connectors for this source
          if (this.chatConnectorService) {
            await this.chatConnectorService.initializeForSourceConnection(effectiveSourceId);
          }

          socket.emit('joined_chat', { sourceId: effectiveSourceId });
        } catch (error) {
          console.error('Join chat error:', error);
          socket.emit('error', { message: 'Failed to join chat' });
        }
      });

      // Leave chat room
      socket.on('leave_chat', (data) => {
        const { sourceId } = data;
        if (sourceId) {
          socket.leave(`source_${sourceId}`);
          console.log(`User ${socket.user.id} left chat for source ${sourceId}`);
        }
      });

      // Send chat message (for future use when we implement sending messages)
      socket.on('send_message', async (data) => {
        try {
          const { sourceId, message } = data;

          if (!sourceId || !message) {
            socket.emit('error', { message: 'Source ID and message are required' });
            return;
          }

          // For now, we'll just broadcast the message
          // In the future, this would save to database and handle platform-specific sending
          const messageData = {
            id: Date.now().toString(), // Temporary ID
            sourceId,
            authorName: socket.user.displayName || 'User',
            authorId: socket.user.id,
            messageText: message,
            messageType: 'text',
            createdAt: new Date().toISOString()
          };

          // Broadcast to all users in the source room
          this.io.to(`source_${sourceId}`).emit('new_message', messageData);
        } catch (error) {
          console.error('Send message error:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user?.id} disconnected from WebSocket`);
      });
    });
  }

  async getRecentMessages(sourceId, limit = 50) {
    try {
      const messages = await this.db.query(
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
        LIMIT $2`,
        [sourceId, limit]
      );

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Get recent messages error:', error);
      return [];
    }
  }

  // Method to broadcast new chat message from platform connectors
  async broadcastMessage(sourceId, messageData) {
    try {
      // Generate unique ID for the message
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      // Create message object with timestamp
      const message = {
        id: messageId,
        sourceId,
        connectorId: messageData.connectorId,
        platformMessageId: messageData.platformMessageId,
        authorName: messageData.authorName,
        authorId: messageData.authorId,
        messageText: messageData.messageText,
        messageType: messageData.messageType || 'text',
        metadata: messageData.metadata || {},
        createdAt: new Date().toISOString()
      };

      // Broadcast to all connected clients in the source room
      this.io.to(`source_${sourceId}`).emit('new_message', message);

      console.log(`Broadcasted message from ${messageData.platform || 'unknown'}: ${messageData.authorName}: ${messageData.messageText}`);

      return message;
    } catch (error) {
      console.error('Broadcast message error:', error);
      throw error;
    }
  }

  // Get active connections count for a source
  getConnectionCount(sourceId) {
    const room = this.io.sockets.adapter.rooms.get(`source_${sourceId}`);
    return room ? room.size : 0;
  }
}

module.exports = WebSocketServer;