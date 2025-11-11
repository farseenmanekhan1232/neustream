// Subscription and billing types

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: SubscriptionFeature[];
  stripePriceId?: string;
  isPopular?: boolean;
}

export interface SubscriptionFeature {
  icon?: React.ReactNode;
  text: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
}

export interface MySubscription {
  subscription: Subscription;
  usage: SubscriptionUsage;
  limits: SubscriptionLimits;
}

export interface SubscriptionUsage {
  streamsActive: number;
  streamsLimit: number;
  chatConnectors: number;
  chatConnectorsLimit: number;
  streamingHours: number;
  streamingHoursLimit: number;
  destinationsPerSource: number;
  destinationsPerSourceLimit: number;
}

export interface SubscriptionLimits {
  maxStreams: number;
  maxChatConnectors: number;
  maxStreamingHours: number;
  maxDestinationsPerSource: number;
  support: "community" | "email" | "priority";
  features: string[];
}

export interface PlanInfo {
  description: string;
  bestFor: string;
  features: SubscriptionFeature[];
}

export interface CurrencyContextType {
  currency: string;
  location: string | null;
  loading: boolean;
  error: string | null;
  formatPrice: (price: number) => string;
  convertPrice: (
    price: number,
    fromCurrency?: string,
    toCurrency?: string,
  ) => Promise<number>;
}
