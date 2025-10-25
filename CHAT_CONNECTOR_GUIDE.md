# Live Chat Connector System

## Overview

The Live Chat Connector system allows users to aggregate chat messages from multiple streaming platforms (Twitch, YouTube, Facebook, etc.) into a unified chat interface in the Neustream stream preview page.

## Architecture

### Backend Components

1. **Database Tables**
   - `chat_connectors` - Stores platform connection configurations
   - `chat_messages` - Stores aggregated chat messages
   - `chat_sessions` - Manages real-time chat sessions

2. **WebSocket Server** (`/control-plane/lib/websocket.js`)
   - Real-time message broadcasting
   - Session management
   - Message persistence

3. **Chat API** (`/control-plane/routes/chat.js`)
   - Connector management
   - OAuth flow handling
   - Message retrieval

4. **Chat Connector Service** (`/control-plane/services/chatConnectorService.js`)
   - Platform-specific connection management
   - Message aggregation
   - Error handling

### Frontend Components

1. **ChatConnectorSetup** (`/frontend/src/components/ChatConnectorSetup.jsx`)
   - Platform connection UI
   - OAuth flow initiation
   - Connection status management

2. **LiveChat** (`/frontend/src/components/LiveChat.jsx`)
   - Real-time chat display
   - WebSocket client
   - Message rendering

3. **StreamPreviewPage** (`/frontend/src/components/StreamPreviewPage.jsx`)
   - Integrated chat display
   - Source switching support

## Setup Instructions

### 1. Database Migration

Run the chat table migration:
```bash
cd control-plane
node scripts/run-migrations.js
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Chat Connector URLs
TWITCH_CHAT_CALLBACK_URL=https://your-domain.com/api/chat/connectors/twitch/oauth/callback
YOUTUBE_CHAT_CALLBACK_URL=https://your-domain.com/api/chat/connectors/youtube/oauth/callback

# Platform OAuth Credentials (already in use)
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 3. Dependencies

Install required packages:
```bash
# Backend
cd control-plane
npm install socket.io

# Frontend
cd frontend
npm install socket.io-client
```

## Usage Guide

### Connecting Chat Platforms

1. **Navigate to Streaming Configuration**
   - Go to `/dashboard/streaming`
   - Select a stream source

2. **Connect Platforms**
   - Scroll to "Chat Connectors" section
   - Click "Connect" for desired platform (Twitch, YouTube)
   - Complete OAuth flow
   - Chat messages will appear in real-time

### Viewing Aggregated Chat

1. **Open Stream Preview**
   - Go to `/dashboard/preview`
   - Select a stream source with connected chat platforms
   - View real-time aggregated chat in the right sidebar

### API Endpoints

#### Chat Connector Management

- `GET /api/chat/sources/:sourceId/connectors` - Get connectors for a source
- `POST /api/chat/sources/:sourceId/connectors` - Create new connector
- `PUT /api/chat/connectors/:connectorId` - Update connector
- `DELETE /api/chat/connectors/:connectorId` - Delete connector

#### OAuth Flow

- `GET /api/chat/connectors/:platform/oauth/start` - Start OAuth flow
- `GET /api/chat/connectors/:platform/oauth/callback` - OAuth callback

#### Chat Messages

- `GET /api/chat/sources/:sourceId/messages` - Get chat messages

## Platform Support

### Currently Supported

- **Twitch** - Real-time chat via IRC/WebSocket
- **YouTube** - Live chat via YouTube API
- **Facebook** - Live comments (coming soon)
- **Custom** - Webhook-based integration (coming soon)

### Platform Features

| Platform | Real-time | Subscriptions | Emotes | Moderation |
|----------|-----------|---------------|--------|------------|
| Twitch   | ✅        | ✅            | ✅     | ✅         |
| YouTube  | ✅        | ✅            | ✅     | ✅         |
| Facebook | 🔄        | 🔄            | 🔄     | 🔄         |
| Custom   | 🔄        | 🔄            | 🔄     | 🔄         |

## Development

### Adding New Platforms

1. **Update Database Schema**
   - Add platform to `chat_connectors.platform` enum

2. **Implement Connector**
   - Add platform handler in `ChatConnectorService`
   - Implement message parsing and forwarding

3. **Update Frontend**
   - Add platform to `PLATFORMS` array in `ChatConnectorSetup`
   - Add platform-specific UI components

### Testing

1. **Simulated Messages**
   - The `ChatConnectorService` includes simulated message generation
   - Messages appear every 5 seconds for testing

2. **WebSocket Testing**
   - Connect to WebSocket endpoint
   - Join chat room for a source
   - Send and receive messages

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check WebSocket server is running
   - Verify CORS configuration
   - Check authentication token

2. **OAuth Flow Fails**
   - Verify callback URLs in platform developer consoles
   - Check environment variables
   - Review OAuth scopes

3. **No Messages Appearing**
   - Verify connector is active in database
   - Check platform connection status
   - Review WebSocket connection

### Logging

- Backend logs connector initialization and message processing
- Frontend logs WebSocket connection status
- Check browser console for frontend errors

## Security Considerations

- OAuth tokens are securely stored in database
- WebSocket connections require authentication
- Rate limiting on API endpoints
- Input validation on all endpoints

## Performance

- Message batching for database writes
- Connection pooling for platform APIs
- Horizontal scaling support for WebSocket server
- Redis integration for pub/sub (future enhancement)

## Future Enhancements

- [ ] Message moderation tools
- [ ] Chat analytics dashboard
- [ ] Advanced filtering options
- [ ] Emote/emoji support
- [ ] Multi-language support
- [ ] Chat bot integration
- [ ] Stream alerts integration