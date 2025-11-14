import { PostHog } from 'posthog-node';

/**
 * PostHog Analytics Service
 * Handles user event tracking, authentication events, and API usage analytics
 */
class PostHogService {
  private client: PostHog | null;
  private isEnabled: boolean;

  constructor() {
    this.client = null;
    this.isEnabled = !!(process.env.POSTHOG_API_KEY && process.env.POSTHOG_HOST);

    if (this.isEnabled) {
      this.client = new PostHog(
        process.env.POSTHOG_API_KEY!,
        {
          host: process.env.POSTHOG_HOST!,
        }
      );
      console.log('PostHog analytics initialized');
    } else {
      console.log('PostHog analytics disabled - missing API key or host');
    }
  }

  /**
   * Track user events
   */
  trackUserEvent(userId: string | number, event: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.capture({
        distinctId: userId.toString(),
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

  /**
   * Track stream events
   */
  trackStreamEvent(userId: string | number, streamKey: string, event: string, properties: Record<string, any> = {}): void {
    this.trackUserEvent(userId, event, {
      stream_key: streamKey,
      ...properties,
    });
  }

  /**
   * Track authentication events
   */
  trackAuthEvent(userId: string | number, event: string, properties: Record<string, any> = {}): void {
    this.trackUserEvent(userId, event, {
      auth_event: true,
      ...properties,
    });
  }

  /**
   * Track API usage
   */
  trackApiUsage(userId: string | number, endpoint: string, method: string, statusCode: number, responseTime: number): void {
    this.trackUserEvent(userId, 'api_request', {
      endpoint,
      method,
      status_code: statusCode,
      response_time: responseTime,
    });
  }

  /**
   * Track destination events
   */
  trackDestinationEvent(userId: string | number, destinationId: string | number, event: string, properties: Record<string, any> = {}): void {
    this.trackUserEvent(userId, event, {
      destination_id: destinationId,
      ...properties,
    });
  }

  /**
   * Track subscription events
   */
  trackSubscriptionEvent(userId: string | number, event: string, properties: Record<string, any> = {}): void {
    this.trackUserEvent(userId, event, {
      subscription_event: true,
      ...properties,
    });
  }

  /**
   * Identify user properties
   */
  identifyUser(userId: string | number, properties: Record<string, any> = {}): void {
    if (!this.isEnabled || !this.client) return;

    try {
      this.client.identify({
        distinctId: userId.toString(),
        properties: {
          ...properties,
          environment: process.env.NODE_ENV || 'development',
        },
      });
    } catch (error) {
      console.error('PostHog identify error:', error);
    }
  }

  /**
   * Flush events (useful for serverless environments)
   */
  async flush(): Promise<void> {
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

export default posthogService;
