import posthog from "posthog-js";

class PostHogService {
  private isInitialized: boolean;
  private userId: string | null;
  private userProperties: Record<string, unknown>;

  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.userProperties = {};

    // Check if PostHog is available (initialized by PostHogProvider)
    if (posthog.__loaded) {
      this.isInitialized = true;
      console.log("PostHog frontend analytics initialized via React provider");
    } else {
      console.log(
        "PostHog frontend analytics disabled - PostHogProvider not found",
      );
    }
  }

  // Track page views
  trackPageView(
    pageName: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.isInitialized) return;

    posthog.capture("$pageview", {
      page: pageName,
      ...properties,
    });
  }

  // Track user events
  trackEvent(
    eventName: string,
    properties: Record<string, unknown> = {},
  ): void {
    if (!this.isInitialized) return;

    posthog.capture(eventName, {
      ...properties,
      user_id: this.userId,
    });
  }

  // Track authentication events
  trackAuthEvent(
    eventName: string,
    properties: Record<string, unknown> = {},
  ): void {
    this.trackEvent(eventName, {
      auth_event: true,
      ...properties,
    });
  }

  // Track stream events
  trackStreamEvent(
    streamKey: string,
    eventName: string,
    properties: Record<string, unknown> = {},
  ): void {
    this.trackEvent(eventName, {
      stream_key: streamKey,
      ...properties,
    });
  }

  // Track destination events
  trackDestinationEvent(
    destinationId: string,
    eventName: string,
    properties: Record<string, unknown> = {},
  ): void {
    this.trackEvent(eventName, {
      destination_id: destinationId,
      ...properties,
    });
  }

  // Track UI interactions
  trackUIInteraction(
    elementName: string,
    interactionType: string,
    properties: Record<string, unknown> = {},
  ): void {
    this.trackEvent("ui_interaction", {
      element_name: elementName,
      interaction_type: interactionType,
      ...properties,
    });
  }

  // Identify user
  identifyUser(userId: string, properties: Record<string, unknown> = {}): void {
    if (!this.isInitialized) return;

    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    posthog.identify(userId, {
      ...properties,
      identified_at: new Date().toISOString(),
    });
  }

  // Reset user (on logout)
  resetUser(): void {
    if (!this.isInitialized) return;

    this.userId = null;
    this.userProperties = {};
    posthog.reset();
  }

  // Get PostHog instance for direct access
  getInstance(): typeof posthog | null {
    return this.isInitialized ? posthog : null;
  }

  // Check if PostHog is enabled
  isEnabled(): boolean {
    return this.isInitialized;
  }

  // Check if feature is enabled
  isFeatureEnabled(featureName: string): boolean {
    if (!this.isInitialized) return false;
    return posthog.isFeatureEnabled(featureName) || false;
  }

  // Get feature flag value
  getFeatureFlag(flagName: string, defaultValue?: unknown): unknown {
    if (!this.isInitialized) return defaultValue;
    return posthog.getFeatureFlag(flagName) ?? defaultValue;
  }
}

// Create singleton instance
const posthogService = new PostHogService();

export default posthogService;
