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

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Mock authentication - in production, you'd verify the JWT
      // For now, we'll accept any token and extract user info
      try {
        // In production, you'd verify the JWT properly
        // For now, we'll just parse it as JSON if it's a string
        let userData;
        if (typeof token === 'string') {
          try {
            userData = JSON.parse(token);
          } catch {
            // If it's not JSON, treat it as a simple user ID
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

          // Verify user has access to this source
          const sources = await this.db.query(
            'SELECT id FROM stream_sources WHERE id = $1 AND user_id = $2',
            [sourceId, socket.user.id]
          );

          if (sources.length === 0) {
            socket.emit('error', { message: 'Access denied to source' });
            return;
          }

          // Join the room for this source
          socket.join(`source_${sourceId}`);
          console.log(`User ${socket.user.id} joined chat for source ${sourceId}`);

          // Send recent messages
          const recentMessages = await this.getRecentMessages(sourceId);
          socket.emit('chat_history', { messages: recentMessages });

          // Initialize chat connectors for this source
          if (this.chatConnectorService) {
            await this.chatConnectorService.initializeForSourceConnection(sourceId);
          }

          socket.emit('joined_chat', { sourceId });
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
      // Save message to database
      const savedMessage = await this.saveMessage(sourceId, messageData);

      // Broadcast to all connected clients in the source room
      this.io.to(`source_${sourceId}`).emit('new_message', savedMessage);

      return savedMessage;
    } catch (error) {
      console.error('Broadcast message error:', error);
      throw error;
    }
  }

  async saveMessage(sourceId, messageData) {
    const {
      connectorId,
      platformMessageId,
      authorName,
      authorId,
      messageText,
      messageType = 'text',
      metadata = {}
    } = messageData;

    const result = await this.db.run(
      `INSERT INTO chat_messages (
        source_id, connector_id, platform_message_id,
        author_name, author_id, message_text, message_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [sourceId, connectorId, platformMessageId, authorName, authorId, messageText, messageType, metadata]
    );

    return {
      id: result.id,
      sourceId: result.source_id,
      connectorId: result.connector_id,
      platformMessageId: result.platform_message_id,
      authorName: result.author_name,
      authorId: result.author_id,
      messageText: result.message_text,
      messageType: result.message_type,
      metadata: result.metadata,
      createdAt: result.created_at
    };
  }

  // Get active connections count for a source
  getConnectionCount(sourceId) {
    const room = this.io.sockets.adapter.rooms.get(`source_${sourceId}`);
    return room ? room.size : 0;
  }
}

module.exports = WebSocketServer;