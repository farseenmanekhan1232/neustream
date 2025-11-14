// Database Entity Types
// These types represent the database schema entities

export interface User {
  id: number;
  uuid: string;
  email: string;
  password_hash?: string;
  display_name?: string;
  avatar_url?: string;
  stream_key?: string;
  oauth_provider?: string;
  oauth_id?: string;
  oauth_email?: string;
  email_verified?: boolean;
  email_verification_token?: string;
  email_verification_expires?: Date;
  password_reset_token?: string;
  password_reset_expires?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price_monthly?: number;
  price_yearly?: number;
  price_monthly_inr?: number;
  price_yearly_inr?: number;
  max_sources?: number;
  max_destinations?: number;
  max_streaming_hours_monthly?: number;
  features?: string[];
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'canceled' | 'past_due';
  billing_cycle?: 'monthly' | 'yearly';
  current_period_start?: Date;
  current_period_end?: Date;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields
  plan_name?: string;
  plan_description?: string;
  price_monthly?: number;
  price_yearly?: number;
  price_monthly_inr?: number;
  price_yearly_inr?: number;
  max_sources?: number;
  max_destinations?: number;
  max_streaming_hours_monthly?: number;
  features?: string[];
  is_expired_subscription?: boolean;
}

export interface StreamSource {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  stream_key?: string;
  is_active?: boolean;
  last_used_at?: Date;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields
  email?: string;
}

export interface SourceDestination {
  id: number;
  source_id: number;
  platform: string;
  destination_url: string;
  destination_key?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ActiveStream {
  id: number;
  source_id?: number;
  user_id: number;
  stream_key?: string;
  started_at?: Date;
  ended_at?: Date;
  destinations_count?: number;
  // Joined fields
  source_name?: string;
  email?: string;
}

export interface ChatConnector {
  id: number;
  source_id: number;
  platform: string;
  username?: string;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface ChatMessage {
  id: number;
  source_id: number;
  connector_id?: number;
  platform_message_id?: string;
  author_name?: string;
  author_id?: string;
  message_text?: string;
  message_type?: string;
  metadata?: Record<string, any>;
  created_at?: Date;
  // Joined fields
  platform?: string;
}

export interface Payment {
  id: number;
  user_id: number;
  plan_id: number;
  billing_cycle?: string;
  amount?: number;
  currency?: string;
  payment_id?: string;
  order_id?: string;
  status?: string;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields
  plan_name?: string;
}

export interface PaymentOrder {
  id: number;
  order_id?: string;
  user_id: number;
  plan_id: number;
  billing_cycle?: string;
  amount?: number;
  currency?: string;
  status?: 'created' | 'completed' | 'failed';
  payment_id?: string;
  created_at?: Date;
  updated_at?: Date;
  // Joined fields
  plan_name?: string;
  price_monthly?: number;
  price_yearly?: number;
}

export interface UsageTracking {
  id: number;
  user_id: number;
  source_id: number;
  stream_start?: Date;
  stream_end?: Date;
  duration_minutes?: number;
  month_year?: string;
}

export interface PlanLimitsTracking {
  id: number;
  user_id: number;
  current_sources_count?: number;
  current_destinations_count?: number;
  current_month_streaming_hours?: number;
  current_chat_connectors_count?: number;
  updated_at?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    uuid: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    streamKey?: string;
    oauthProvider?: string;
  };
}

export interface StreamInfoResponse {
  streamKey: string;
  isActive: boolean;
  rtmpUrl: string;
  activeStream?: ActiveStream;
}

export interface StreamForwardingConfig {
  sourceId: number;
  streamKey: string;
  userId: number;
  destinations: Array<{
    id: number;
    platform: string;
    destinationUrl: string;
    destinationKey?: string;
  }>;
}

// OAuth Types
export interface OAuthProfile {
  id: string;
  email?: string;
  displayName?: string;
  display_name?: string;
  photos?: Array<{ value: string }>;
  profile_image_url?: string;
}

export interface JWTPayload {
  userId: number;
  userUuid: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  streamKey?: string;
  oauthProvider?: string;
}

// WebSocket Types
export interface WebSocketUser {
  id: string | number;
  displayName?: string;
  isPublic?: boolean;
}

export interface JoinChatData {
  sourceId: number;
}

export interface SendMessageData {
  sourceId: number;
  message: string;
}

export interface ChatMessageData {
  id: string;
  sourceId: number;
  connectorId?: number;
  platformMessageId?: string;
  authorName: string;
  authorId: string | number;
  messageText: string;
  messageType?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

// Subscription Check Types
export interface CanCreateSourceResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
}

export interface CanCreateDestinationResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
}

export interface CanStreamResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
}

export interface CanCreateChatConnectorResult {
  allowed: boolean;
  current: number;
  max: number;
  remaining: number;
}

// Usage Types
export interface UserUsage {
  subscription: {
    plan_name: string;
    status: string;
    billing_cycle?: string;
    current_period_end?: Date;
  };
  limits: {
    max_sources: number;
    max_destinations: number;
    max_streaming_hours_monthly: number;
    max_chat_connectors: number;
  };
  current_usage: {
    sources_count: number;
    destinations_count: number;
    streaming_hours: number;
    chat_connectors_count: number;
  };
  features?: string[];
}

export interface MonthlyUsageBreakdown {
  month_year: string;
  stream_count: number;
  total_hours: number;
}

// Session Types
export interface StreamSession {
  id: string;
  userId: number;
  streamKeys: Record<string, { sourceId: number }>;
  expiresAt: Date;
}

// Razorpay Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
}

export interface PaymentVerificationResult {
  success: boolean;
  orderId: string;
  paymentId: string;
  userId: number;
  planId: number;
}
