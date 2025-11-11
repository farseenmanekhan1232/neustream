// Analytics and metrics types

export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

export interface PostHogUser {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  oauthProvider?: string;
}

export interface AuthEvent {
  eventName: "user_login" | "user_logout" | "user_register" | "oauth_success";
  properties: {
    user_id: string;
    oauth_provider?: string;
    timestamp: string;
  };
}

export interface StreamEvent {
  streamKey: string;
  eventName: string;
  properties: Record<string, unknown>;
}

export interface DestinationEvent {
  destinationId: string;
  eventName: string;
  properties: Record<string, unknown>;
}

export interface UIInteraction {
  elementName: string;
  interactionType: "click" | "hover" | "focus" | "scroll";
  properties: Record<string, unknown>;
}

export interface MetricsData {
  totalViewers: number;
  peakViewers: number;
  averageViewers: number;
  totalMessages: number;
  streamDuration: number;
  engagementRate: number;
}

export interface DashboardMetrics {
  streams: {
    active: number;
    total: number;
  };
  destinations: {
    connected: number;
    total: number;
  };
  sources: {
    active: number;
    total: number;
  };
  subscription: {
    status: string;
    plan: string;
  };
}
