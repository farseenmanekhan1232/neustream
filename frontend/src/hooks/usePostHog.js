import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import posthogService from '../services/posthog';

export const usePostHog = () => {
  const location = useLocation();

  // Track page views
  useEffect(() => {
    if (posthogService.isEnabled()) {
      const pageName = location.pathname;
      posthogService.trackPageView(pageName, {
        path: location.pathname,
        search: location.search,
        hash: location.hash,
      });
    }
  }, [location]);

  return {
    // Track events
    trackEvent: (eventName, properties = {}) => {
      posthogService.trackEvent(eventName, properties);
    },

    // Track authentication events
    trackAuthEvent: (eventName, properties = {}) => {
      posthogService.trackAuthEvent(eventName, properties);
    },

    // Track stream events
    trackStreamEvent: (streamKey, eventName, properties = {}) => {
      posthogService.trackStreamEvent(streamKey, eventName, properties);
    },

    // Track destination events
    trackDestinationEvent: (destinationId, eventName, properties = {}) => {
      posthogService.trackDestinationEvent(destinationId, eventName, properties);
    },

    // Track UI interactions
    trackUIInteraction: (elementName, interactionType, properties = {}) => {
      posthogService.trackUIInteraction(elementName, interactionType, properties);
    },

    // Identify user
    identifyUser: (userId, properties = {}) => {
      posthogService.identifyUser(userId, properties);
    },

    // Reset user
    resetUser: () => {
      posthogService.resetUser();
    },

    // Check if PostHog is enabled
    isEnabled: () => posthogService.isEnabled(),
  };
};