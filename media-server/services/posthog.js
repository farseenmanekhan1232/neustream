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
      console.log('[PostHog] Media server analytics initialized');
    } else {
      console.log('[PostHog] Media server analytics disabled - missing API key or host');
    }
  }

  // Track stream events
  trackStreamEvent(streamKey, event, properties = {}) {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.capture({
        distinctId: streamKey,
        event: event,
        properties: {
          ...properties,
          stream_key: streamKey,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          server_type: 'media_server',
        },
      });
    } catch (error) {
      console.error('[PostHog] Tracking error:', error);
    }
  }

  // Track RTMP connection events
  trackConnectionEvent(connectionId, event, properties = {}) {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.capture({
        distinctId: connectionId,
        event: event,
        properties: {
          ...properties,
          connection_id: connectionId,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          server_type: 'media_server',
        },
      });
    } catch (error) {
      console.error('[PostHog] Connection tracking error:', error);
    }
  }

  // Track relay/forwarding events
  trackRelayEvent(streamKey, destinationUrl, event, properties = {}) {
    this.trackStreamEvent(streamKey, event, {
      destination_url: destinationUrl,
      ...properties,
    });
  }

  // Track error events
  trackErrorEvent(streamKey, errorType, errorMessage, properties = {}) {
    this.trackStreamEvent(streamKey, 'media_server_error', {
      error_type: errorType,
      error_message: errorMessage,
      ...properties,
    });
  }

  // Track performance metrics
  trackPerformanceEvent(streamKey, metricName, value, properties = {}) {
    this.trackStreamEvent(streamKey, 'performance_metric', {
      metric_name: metricName,
      metric_value: value,
      ...properties,
    });
  }

  // Flush events
  async flush() {
    if (!this.isEnabled || !this.client) return;

    try {
      await this.client.shutdownAsync();
    } catch (error) {
      console.error('[PostHog] Flush error:', error);
    }
  }
}

// Create singleton instance
const posthogService = new PostHogService();

module.exports = posthogService;