import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import posthogService from "../services/posthog";
import type { UsePostHogReturn } from "@/types";

export const usePostHog = (): UsePostHogReturn => {
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
    trackEvent: (
      eventName: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.trackEvent(eventName, properties);
    },

    // Track authentication events
    trackAuthEvent: (
      eventName: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.trackAuthEvent(eventName, properties);
    },

    // Track stream events
    trackStreamEvent: (
      streamKey: string,
      eventName: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.trackStreamEvent(streamKey, eventName, properties);
    },

    // Track destination events
    trackDestinationEvent: (
      destinationId: string,
      eventName: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.trackDestinationEvent(
        destinationId,
        eventName,
        properties,
      );
    },

    // Track UI interactions
    trackUIInteraction: (
      elementName: string,
      interactionType: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.trackUIInteraction(
        elementName,
        interactionType,
        properties,
      );
    },

    // Identify user
    identifyUser: (
      userId: string,
      properties: Record<string, unknown> = {},
    ): void => {
      posthogService.identifyUser(userId, properties);
    },

    // Reset user
    resetUser: (): void => {
      posthogService.resetUser();
    },

    // Check if PostHog is enabled
    isEnabled: (): boolean => posthogService.isEnabled(),
  };
};
