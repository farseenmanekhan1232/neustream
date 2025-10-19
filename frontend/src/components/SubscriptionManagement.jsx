import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  X,
  Crown,
  Star,
  Zap,
  CreditCard,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { subscriptionService } from "../services/subscription";
import { usePostHog } from "../hooks/usePostHog";
import { toast } from "sonner";

const SubscriptionManagement = () => {
  const queryClient = useQueryClient();
  const { trackUIInteraction } = usePostHog();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly");

  // Fetch subscription data
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionService.getMySubscription(),
    retry: 2,
  });

  // Fetch available plans
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: () => subscriptionService.getPlans(),
    retry: 2,
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation({
    mutationFn: ({ planId, billingCycle }) =>
      subscriptionService.createSubscription(planId, billingCycle),
    onSuccess: (data) => {
      // Redirect to Razorpay checkout
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast.success("Redirecting to payment gateway...", {
          description: "You'll be redirected to complete your subscription payment."
        });
        trackUIInteraction("subscription_checkout_started", "click", {
          plan_id: selectedPlan,
          billing_cycle: billingCycle,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error) => {
      console.error("Failed to create subscription:", error);
      toast.error("Failed to create subscription", {
        description: error.response?.data?.error || "Please try again later."
      });
    },
  });

  // Change subscription plan mutation
  const changePlanMutation = useMutation({
    mutationFn: ({ planId, billingCycle }) =>
      subscriptionService.changePlan(planId, billingCycle),
    onSuccess: (data) => {
      // Redirect to Razorpay checkout for plan change
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
        toast.success("Redirecting to payment gateway...", {
          description: "You'll be redirected to complete your plan change payment."
        });
        trackUIInteraction("subscription_plan_change_started", "click", {
          plan_id: selectedPlan,
          billing_cycle: billingCycle,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (error) => {
      console.error("Failed to change subscription plan:", error);
      toast.error("Failed to change subscription plan", {
        description: error.response?.data?.error || "Please try again later."
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: () => subscriptionService.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription cancelled successfully", {
        description: "Your subscription will remain active until the end of the current billing period."
      });
      trackUIInteraction("subscription_cancelled", "click");
    },
    onError: (error) => {
      console.error("Failed to cancel subscription:", error);
      toast.error("Failed to cancel subscription", {
        description: error.response?.data?.error || "Please try again later."
      });
    },
  });

  const currentSubscription = subscriptionData?.subscription;
  const currentUsage = subscriptionData?.usage;
  const plans = plansData?.plans || [];

  // Check if user is approaching plan limits
  const isApproachingStreamSourceLimit = currentSubscription &&
    currentUsage &&
    currentUsage.active_stream_sources >= currentSubscription.max_stream_sources * 0.8;

  const isApproachingDestinationLimit = currentSubscription &&
    currentUsage &&
    currentUsage.total_destinations >= currentSubscription.max_simultaneous_destinations * 0.8;

  const isApproachingStreamingHoursLimit = currentSubscription &&
    currentUsage &&
    currentUsage.streaming_hours_used >= currentSubscription.max_streaming_hours_monthly * 0.8;

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case "pro":
        return <Zap className="h-5 w-5" />;
      case "business":
        return <Crown className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const formatPrice = (price) => {
    if (price === 0) return "Free";
    return `₹${(price / 100).toFixed(0)}`;
  };

  const getPlanFeatures = (plan) => {
    const baseFeatures = [
      { name: "Stream Sources", value: plan.max_stream_sources, icon: "📡" },
      {
        name: "Simultaneous Destinations",
        value: plan.max_simultaneous_destinations,
        icon: "🎯",
      },
      {
        name: "Monthly Streaming Hours",
        value: plan.max_streaming_hours_monthly,
        icon: "⏱️",
      },
    ];

    const premiumFeatures = [
      { name: "Advanced Analytics", enabled: plan.has_advanced_analytics },
      { name: "Priority Support", enabled: plan.has_priority_support },
      { name: "Custom RTMP", enabled: plan.has_custom_rtmp },
      { name: "Stream Preview", enabled: plan.has_stream_preview },
      { name: "Team Access", enabled: plan.has_team_access },
      { name: "Custom Branding", enabled: plan.has_custom_branding },
      { name: "API Access", enabled: plan.has_api_access },
    ];

    return { baseFeatures, premiumFeatures };
  };

  const handleSubscribe = (planId) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate({ planId, billingCycle });
  };

  const handleChangePlan = (planId) => {
    setSelectedPlan(planId);
    changePlanMutation.mutate({ planId, billingCycle });
  };

  const handleCancelSubscription = () => {
    if (
      window.confirm(
        "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
      )
    ) {
      cancelSubscriptionMutation.mutate();
    }
  };

  // Determine if a plan is an upgrade or downgrade from current plan
  const getPlanChangeType = (plan) => {
    if (!currentSubscription) return 'upgrade';

    const currentPlanName = currentSubscription.plan_name.toLowerCase();
    const newPlanName = plan.name.toLowerCase();

    const planOrder = { 'pro': 1, 'business': 2 };
    const currentOrder = planOrder[currentPlanName] || 0;
    const newOrder = planOrder[newPlanName] || 0;

    if (newOrder > currentOrder) return 'upgrade';
    if (newOrder < currentOrder) return 'downgrade';
    return 'same';
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-4" />
                {[1, 2, 3].map((j) => (
                  <Skeleton key={j} className="h-4 w-full mb-2" />
                ))}
              </CardContent>
              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription Status */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getPlanIcon(currentSubscription.plan_name)}
              Current Subscription: {currentSubscription.plan_name}
            </CardTitle>
            <CardDescription>
              Your subscription is{" "}
              <Badge variant="outline">{currentSubscription.status}</Badge>
              {currentSubscription.current_period_end && (
                <span className="ml-2">
                  • Renews on{" "}
                  {new Date(
                    currentSubscription.current_period_end
                  ).toLocaleDateString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">Billing Cycle</div>
                <div className="text-muted-foreground capitalize">
                  {currentSubscription.billing_cycle}
                </div>
              </div>
              <div>
                <div className="font-medium">Status</div>
                <div>
                  <Badge
                    variant={
                      currentSubscription.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {currentSubscription.status}
                  </Badge>
                </div>
              </div>
              <div>
                <div className="font-medium">Next Billing</div>
                <div className="text-muted-foreground">
                  {currentSubscription.current_period_end
                    ? new Date(
                        currentSubscription.current_period_end
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </CardContent>
          {currentSubscription.status === "active" && (
            <CardFooter>
              <Button
                variant="outline"
                onClick={handleCancelSubscription}
                disabled={cancelSubscriptionMutation.isPending}
              >
                {cancelSubscriptionMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Cancel Subscription
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {/* Subscription Status Alerts */}
      {currentSubscription && (
        <div className="space-y-4">
          {currentSubscription.status === "past_due" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription payment is past due. Please update your payment method to avoid service interruption.
              </AlertDescription>
            </Alert>
          )}
          {currentSubscription.status === "canceled" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription has been canceled. You'll lose access to premium features at the end of your billing period.
              </AlertDescription>
            </Alert>
          )}
          {currentSubscription.cancel_at_period_end && (
            <Alert variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your subscription is scheduled to cancel at the end of the current billing period.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Usage Limit Alerts */}
      {currentSubscription && (
        <div className="space-y-4">
          {isApproachingStreamSourceLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your stream source limit ({currentUsage.active_stream_sources}/{currentSubscription.max_stream_sources}).
                Consider upgrading to a higher plan for more sources.
              </AlertDescription>
            </Alert>
          )}
          {isApproachingDestinationLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your destination limit ({currentUsage.total_destinations}/{currentSubscription.max_simultaneous_destinations}).
                Consider upgrading to a higher plan for more simultaneous destinations.
              </AlertDescription>
            </Alert>
          )}
          {isApproachingStreamingHoursLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You're approaching your monthly streaming hours limit ({currentUsage.streaming_hours_used.toFixed(1)}/{currentSubscription.max_streaming_hours_monthly} hours).
                Consider upgrading to a higher plan for more streaming hours.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Usage Overview */}
      {currentUsage && (
        <Card>
          <CardHeader>
            <CardTitle>Current Usage</CardTitle>
            <CardDescription>
              Your usage for the current billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentUsage.streaming_hours_used.toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">
                  Streaming Hours
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentUsage.active_stream_sources}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Sources
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {currentUsage.total_destinations}
                </div>
                <div className="text-sm text-muted-foreground">
                  Destinations
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Choose Your Plan
            </h2>
            <p className="text-muted-foreground">
              Select the plan that fits your streaming needs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={billingCycle === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "outline"}
              size="sm"
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly (Save 20%)
            </Button>
          </div>
        </div>

        {plansError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load subscription plans. Please try again later.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const { baseFeatures, premiumFeatures } = getPlanFeatures(plan);
            const price =
              billingCycle === "yearly"
                ? plan.price_yearly
                : plan.price_monthly;
            const isCurrentPlan = currentSubscription?.plan_name === plan.name;

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.name.toLowerCase() === "pro"
                    ? "border-primary shadow-lg scale-105"
                    : ""
                }`}
              >
                {plan.name.toLowerCase() === "pro" && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-2">
                    {getPlanIcon(plan.name)}
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="text-3xl font-bold">
                      {formatPrice(price)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      per {billingCycle === "yearly" ? "year" : "month"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Base Features */}
                  <div className="space-y-2">
                    {baseFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm">
                          {feature.icon} {feature.name}
                        </span>
                        <span className="font-medium">{feature.value}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Premium Features */}
                  <div className="space-y-2">
                    {premiumFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {feature.enabled ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm ${
                            feature.enabled ? "" : "text-muted-foreground"
                          }`}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : currentSubscription ? (
                    <Button
                      className="w-full"
                      variant={
                        getPlanChangeType(plan) === "upgrade"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleChangePlan(plan.id)}
                      disabled={changePlanMutation.isPending}
                    >
                      {changePlanMutation.isPending &&
                      selectedPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {getPlanChangeType(plan) === "upgrade" ? "Upgrade" : "Downgrade"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={
                        plan.name.toLowerCase() === "pro"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={createSubscriptionMutation.isPending}
                    >
                      {createSubscriptionMutation.isPending &&
                      selectedPlan === plan.id ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Subscribe
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            View your recent payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistory />
        </CardContent>
      </Card>
    </div>
  );
};

// Payment History Component
const PaymentHistory = () => {
  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["payment-history"],
    queryFn: () => subscriptionService.getPaymentHistory(),
    onError: (error) => {
      toast.error("Failed to load payment history", {
        description: "Please try again later."
      });
    },
  });

  const payments = paymentsData?.payments || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No payment history found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-2 rounded-full ${
                payment.status === "succeeded"
                  ? "bg-green-100 text-green-600"
                  : payment.status === "failed"
                  ? "bg-red-100 text-red-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">
                ₹{(payment.amount / 100).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {payment.description || "Subscription Payment"}
              </div>
            </div>
          </div>
          <div className="text-right">
            <Badge
              variant={
                payment.status === "succeeded"
                  ? "default"
                  : payment.status === "failed"
                  ? "destructive"
                  : "secondary"
              }
            >
              {payment.status}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              {payment.paid_at
                ? new Date(payment.paid_at).toLocaleDateString()
                : "Pending"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SubscriptionManagement;
