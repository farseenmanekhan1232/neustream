import posthog from "posthog-js";

class PostHogService {
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
        "PostHog frontend analytics disabled - PostHogProvider not found"
      );
    }
  }

  // Track page views
  trackPageView(pageName, properties = {}) {
    if (!this.isInitialized) return;

    posthog.capture("$pageview", {
      page: pageName,
      ...properties,
    });
  }

  // Track user events
  trackEvent(eventName, properties = {}) {
    if (!this.isInitialized) return;

    posthog.capture(eventName, {
      ...properties,
      user_id: this.userId,
    });
  }

  // Track authentication events
  trackAuthEvent(eventName, properties = {}) {
    this.trackEvent(eventName, {
      auth_event: true,
      ...properties,
    });
  }

  // Track stream events
  trackStreamEvent(streamKey, eventName, properties = {}) {
    this.trackEvent(eventName, {
      stream_key: streamKey,
      ...properties,
    });
  }

  // Track destination events
  trackDestinationEvent(destinationId, eventName, properties = {}) {
    this.trackEvent(eventName, {
      destination_id: destinationId,
      ...properties,
    });
  }

  // Track UI interactions
  trackUIInteraction(elementName, interactionType, properties = {}) {
    this.trackEvent("ui_interaction", {
      element_name: elementName,
      interaction_type: interactionType,
      ...properties,
    });
  }

  // Identify user
  identifyUser(userId, properties = {}) {
    if (!this.isInitialized) return;

    this.userId = userId;
    this.userProperties = { ...this.userProperties, ...properties };

    posthog.identify(userId, {
      ...properties,
      identified_at: new Date().toISOString(),
    });
  }

  // Reset user (on logout)
  resetUser() {
    if (!this.isInitialized) return;

    this.userId = null;
    this.userProperties = {};
    posthog.reset();
  }

  // Get PostHog instance for direct access
  getInstance() {
    return this.isInitialized ? posthog : null;
  }

  // Check if PostHog is enabled
  isEnabled() {
    return this.isInitialized;
  }
}

// Create singleton instance
const posthogService = new PostHogService();

export default posthogService;
