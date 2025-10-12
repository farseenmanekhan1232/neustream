# PostHog Analytics Setup Guide

This guide explains how to set up PostHog analytics for all NeuStream services.

## Overview

PostHog has been integrated into all three services:
- **Control-plane server** - User authentication, API usage, and stream management events
- **Media-server** - RTMP connection, stream publishing, and forwarding events
- **Frontend application** - User interactions, page views, and UI events

## Environment Variables

### Control-plane Server
Add these to your `control-plane/.env` file:

```bash
# PostHog Configuration
POSTHOG_API_KEY=your_posthog_project_api_key
POSTHOG_HOST=https://app.posthog.com
```

### Media-server
Add these to your `media-server/.env` file:

```bash
# PostHog Configuration
POSTHOG_API_KEY=your_posthog_project_api_key
POSTHOG_HOST=https://app.posthog.com
```

### Frontend Application
Add these to your `frontend/.env` file:

```bash
# PostHog Configuration
VITE_POSTHOG_API_KEY=your_posthog_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

## Getting PostHog API Keys

1. **Create a PostHog account** at [posthog.com](https://posthog.com)
2. **Create a new project** in your PostHog dashboard
3. **Get your API key** from Project Settings → API Keys
4. **Configure the host** - use `https://app.posthog.com` for cloud or your self-hosted instance URL

## Events Tracked

### Control-plane Events
- **Authentication**: `user_registered`, `login_success`, `login_failed`
- **Stream Management**: `stream_auth_success`, `stream_auth_failed`, `stream_ended`
- **API Usage**: `api_request` (with endpoint, method, status code, response time)

### Media-server Events
- **RTMP Connections**: `rtmp_client_connecting`, `rtmp_client_connected`, `rtmp_client_disconnected`
- **Stream Publishing**: `stream_publishing_started`, `stream_auth_success`, `stream_forwarding_setup`
- **Relay Tasks**: `relay_task_added`, `relay_tasks_cleaned`
- **Stream End**: `stream_publishing_ended`, `stream_end_notified`
- **Errors**: `media_server_error` (with error type and message)

### Frontend Events
- **Page Views**: `$pageview` (automatic with React Router)
- **Authentication**: Custom auth events
- **Stream Management**: Stream creation, editing, deletion
- **Destination Management**: Adding, updating, removing destinations
- **UI Interactions**: Button clicks, form submissions, navigation

## Usage in Code

### Control-plane Server
```javascript
const posthogService = require('./services/posthog');

// Track user event
posthogService.trackUserEvent(userId, 'user_registered');

// Track stream event
posthogService.trackStreamEvent(userId, streamKey, 'stream_auth_success');

// Identify user
posthogService.identifyUser(userId, { email: user.email });
```

### Media-server
```javascript
const posthogService = require('./services/posthog');

// Track connection event
posthogService.trackConnectionEvent(connectionId, 'rtmp_client_connected');

// Track stream event
posthogService.trackStreamEvent(streamKey, 'stream_publishing_started');

// Track error
posthogService.trackErrorEvent(streamKey, 'authentication_error', error.message);
```

### Frontend Application
```javascript
import { usePostHog } from './hooks/usePostHog';

function MyComponent() {
  const { trackEvent, identifyUser } = usePostHog();

  // Track user event
  trackEvent('button_clicked', { button_name: 'submit' });

  // Identify user
  identifyUser(userId, { email: user.email });
}
```

## Testing

1. **Enable PostHog** by setting the environment variables
2. **Start all services** and perform actions
3. **Check PostHog dashboard** to see events coming in
4. **Verify all event types** are being tracked correctly

## Troubleshooting

- **No events appearing?** Check environment variables and PostHog project settings
- **Connection errors?** Verify POSTHOG_HOST is correct and accessible
- **Missing user data?** Ensure identifyUser is called with proper user ID
- **Performance issues?** Events are batched and sent asynchronously

## Privacy & GDPR

- PostHog is configured to respect user privacy
- Session recording can be enabled/disabled in PostHog settings
- User data is pseudonymized where possible
- Users can opt-out of tracking through browser settings

## Monitoring

Monitor these key metrics in PostHog:
- **User registration and login rates**
- **Stream success/failure rates**
- **API response times**
- **Error rates and types**
- **User engagement with features**