const { PostHog } = require('posthog-node');

class PostHogService {
  constructor() {
    this.client = null;
    this.isEnabled = process.env.POSTHOG_API_KEY && process.env.POSTHOG_HOST;

    if (this.isEnabled) {
      this.client = new PostHog(
        process.env.POSTHOG_API_KEY,
        {
          host: process.env.POSTHOG_HOST,
        }
      );
      console.log('PostHog analytics initialized');
    } else {
      console.log('PostHog analytics disabled - missing API key or host');
    }
  }

  // Track user events
  trackUserEvent(userId, event, properties = {}) {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId,
        event: event,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      console.error('PostHog tracking error:', error);
    }
  }

  // Track stream events
  trackStreamEvent(userId, streamKey, event, properties = {}) {
    this.trackUserEvent(userId, event, {
      stream_key: streamKey,
      ...properties,
    });
  }

  // Track authentication events
  trackAuthEvent(userId, event, properties = {}) {
    this.trackUserEvent(userId, event, {
      auth_event: true,
      ...properties,
    });
  }

  // Track API usage
  trackApiUsage(userId, endpoint, method, statusCode, responseTime) {
    this.trackUserEvent(userId, 'api_request', {
      endpoint,
      method,
      status_code: statusCode,
      response_time: responseTime,
    });
  }

  // Track destination events
  trackDestinationEvent(userId, destinationId, event, properties = {}) {
    this.trackUserEvent(userId, event, {
      destination_id: destinationId,
      ...properties,
    });
  }

  // Track subscription events
  trackSubscriptionEvent(userId, event, properties = {}) {
    this.trackUserEvent(userId, event, {
      subscription_event: true,
      ...properties,
    });
  }

  // Identify user properties
  identifyUser(userId, properties = {}) {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId,
        properties: {
          ...properties,
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }

  // Flush events (useful for serverless environments)
  async flush() {
    if (!this.isEnabled || !this.client) return;

    try {
      await this.client.shutdown();
    } catch (error) {
      console.error('PostHog flush error:', error);
    }
  }
}

// Create singleton instance
const posthogService = new PostHogService();

module.exports = posthogService;