// Service layer types

import { User } from "./auth";
import { ApiResponse, QueryParams } from "./api";

// Auth Service
export interface AuthServiceInterface {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  request(endpoint: string, options?: QueryParams): Promise<ApiResponse>;
  login(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }>;
  register(
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }>;
  loginWithGoogle(): void;
  loginWithTwitch(): void;
  validateToken(token: string): Promise<User>;
  getCurrentUser(): User | null;
  logout(): void;
  setupInterceptors(): void;
}

// API Service
export interface ApiServiceInterface {
  get(
    endpoint: string,
    params?: QueryParams,
    options?: QueryParams,
  ): Promise<ApiResponse>;
  post(
    endpoint: string,
    data?: unknown,
    options?: QueryParams,
  ): Promise<ApiResponse>;
  put(
    endpoint: string,
    data?: unknown,
    options?: QueryParams,
  ): Promise<ApiResponse>;
  delete(endpoint: string, options?: QueryParams): Promise<ApiResponse>;
  request(endpoint: string, options?: QueryParams): Promise<ApiResponse>;
}

// Subscription Service
export interface SubscriptionServiceInterface {
  getPlans(): Promise<ApiResponse>;
  getMySubscription(): Promise<ApiResponse>;
  updateSubscription(planId: string): Promise<ApiResponse>;
  cancelSubscription(subscriptionId: string): Promise<ApiResponse>;
  getUsage(): Promise<ApiResponse>;
}

// Blog Service
export interface BlogServiceInterface {
  getPosts(page?: number, pageSize?: number): Promise<ApiResponse>;
  getPostBySlug(slug: string): Promise<ApiResponse>;
  getRelatedPosts(postId: string, limit?: number): Promise<ApiResponse>;
  getPostsByTag(
    tag: string,
    page?: number,
    pageSize?: number,
  ): Promise<ApiResponse>;
}

// PostHog Service
export interface PostHogServiceInterface {
  trackEvent(eventName: string, properties?: Record<string, unknown>): void;
  trackPageView(page: string, properties?: Record<string, unknown>): void;
  trackAuthEvent(eventName: string, properties?: Record<string, unknown>): void;
  trackStreamEvent(
    streamKey: string,
    eventName: string,
    properties?: Record<string, unknown>,
  ): void;
  trackDestinationEvent(
    destinationId: string,
    eventName: string,
    properties?: Record<string, unknown>,
  ): void;
  trackUIInteraction(
    elementName: string,
    interactionType: string,
    properties?: Record<string, unknown>,
  ): void;
  identifyUser(userId: string, properties?: Record<string, unknown>): void;
  resetUser(): void;
  isEnabled(): boolean;
  isFeatureEnabled(featureName: string): boolean;
  getFeatureFlag(flagName: string, defaultValue?: unknown): unknown;
}
