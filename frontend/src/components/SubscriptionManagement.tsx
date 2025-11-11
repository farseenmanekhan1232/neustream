import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Crown,
  Check,
  ArrowRight,
  Star,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Shield,
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { subscriptionService } from "../services/subscription";
import { useCurrency } from "../contexts/CurrencyContext";

function SubscriptionManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("yearly"); // Default to yearly
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", user.id],
    queryFn: async () => {
      return await subscriptionService.getMySubscription();
    },
    enabled: !!user,
  });

  // Fetch available plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      return await subscriptionService.getPlans();
    },
  });

  // Fetch streaming history
  const { data: streamingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["streaming-history", user.id],
    queryFn: async () => {
      return await subscriptionService.getStreamingHistory();
    },
    enabled: !!user,
  });

  // Fetch monthly usage breakdown
  const { data: usageBreakdown, isLoading: breakdownLoading } = useQuery({
    queryKey: ["usage-breakdown", user.id],
    queryFn: async () => {
      return await subscriptionService.getMonthlyUsageBreakdown();
    },
    enabled: !!user,
  });

  // Update subscription mutation (for free plan)
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }) => {
      return await subscriptionService.updateSubscription(planId, billingCycle);
    },
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      queryClient.invalidateQueries(["subscription", user.id]);
      setSelectedPlan(null);
    },
    onError: (error) => {
      toast.error("Failed to update subscription: " + error.message);
    },
  });

  // Payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }) => {
      // Create payment order
      const orderData = await subscriptionService.createPaymentOrder(
        planId,
        billingCycle,
      );

      // Initialize Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await subscriptionService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );

            if (verifyResponse.success) {
              toast.success(
                "Payment successful! Your subscription has been upgraded.",
              );
              queryClient.invalidateQueries(["subscription", user.id]);
              setSelectedPlan(null);
            } else {
              toast.error(
                "Payment verification failed. Please contact support.",
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: orderData.theme?.color || "#2563eb",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      return orderData;
    },
    onError: (error) => {
      toast.error("Failed to process payment: " + error.message);
    },
  });

  const currentPlan = subscriptionData?.subscription;
  const currentLimits = subscriptionData?.limits;
  const currentUsage = subscriptionData?.current_usage;
  const plans = plansData?.data?.plans || plansData?.plans || plansData || [];

  // Find Pro plan for recommendation
  const proPlan = plans.find((p) => p.name.toLowerCase() === "pro");

  const planFeatures = {
    free: [
      { name: "Basic Analytics", icon: TrendingUp },
      { name: "Community Support", icon: Users },
      { name: "50 Hours Streaming", icon: Clock },
    ],
    pro: [
      { name: "Advanced Analytics", icon: TrendingUp },
      { name: "Priority Support", icon: Users },
      { name: "Unlimited Streaming Hours", icon: Clock },
      { name: "Multiple Sources", icon: Zap },
      { name: "Custom Destinations", icon: Star },
    ],
    business: [
      { name: "Enterprise Analytics", icon: TrendingUp },
      { name: "24/7 Support", icon: Users },
      { name: "Unlimited Everything", icon: Clock },
      { name: "Custom Branding", icon: Shield },
      { name: "API Access", icon: Zap },
      { name: "Dedicated Account Manager", icon: Star },
    ],
  };

  const getPlanFeatures = (planName) => {
    const planKey = planName.toLowerCase();
    return planFeatures[planKey] || planFeatures.free;
  };

  const getPlanPrice = (plan) => {
    if (!plan) return { monthly: formatPrice(0), yearly: formatPrice(0) };

    // Use formatted prices from API if available, otherwise format manually
    return {
      monthly: plan.formatted_price_monthly || formatPrice(plan.price_monthly),
      yearly: plan.formatted_price_yearly || formatPrice(plan.price_yearly),
    };
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="w-full px-6 py-6 space-y-6 mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="h-8 bg-muted rounded w-2/3"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate usage percentages
  const sourceUsagePercent =
    currentUsage && currentLimits
      ? (currentUsage.sources_count / currentLimits.max_sources) * 100
      : 0;
  const destinationUsagePercent =
    currentUsage && currentLimits
      ? (currentUsage.destinations_count / currentLimits.max_destinations) * 100
      : 0;
  const streamingHours = currentUsage?.streaming_hours
    ? parseFloat(currentUsage.streaming_hours.toString())
    : 0;
  const streamingUsagePercent = currentLimits
    ? (streamingHours / currentLimits.max_streaming_hours_monthly) * 100
    : 0;

  return (
    <div className="w-full px-6 py-6 space-y-6 mx-auto bg-background">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground">
          Manage your plan, update billing details, and view invoices.
        </p>
      </div>

      {/* Current Plan & Recommendation Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Crown className="h-5 w-5 text-teal-500" />
                Current Plan
              </CardTitle>
              <Badge
                variant={
                  currentPlan?.status === "active" ? "default" : "secondary"
                }
                className="bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20"
              >
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-foreground">
                {currentPlan?.plan_name || "Free"} Plan
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentPlan?.billing_cycle === "yearly" ? "Annual" : "Monthly"}{" "}
                billing
              </p>
            </div>

            {/* Usage Progress */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Streaming Hours</span>
                  <span className="font-medium text-foreground">
                    {streamingHours.toFixed(2)}/
                    {currentLimits?.max_streaming_hours_monthly || 0}h
                  </span>
                </div>
                <Progress
                  value={Math.min(streamingUsagePercent, 100)}
                  className="h-2 bg-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Sources</span>
                    <span className="font-medium text-foreground">
                      {currentUsage?.sources_count || 0}/
                      {currentLimits?.max_sources || 0}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(sourceUsagePercent, 100)}
                    className="h-1.5 bg-muted"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Destinations</span>
                    <span className="font-medium text-foreground">
                      {currentUsage?.destinations_count || 0}/
                      {currentLimits?.max_destinations || 0}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(destinationUsagePercent, 100)}
                    className="h-1.5 bg-muted"
                  />
                </div>
              </div>
            </div>

            {/* Renewal Info */}
            {currentPlan?.current_period_end && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Your plan renews on{" "}
                  {new Date(currentPlan.current_period_end).toLocaleDateString(
                    undefined,
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              {currentPlan?.plan_name?.toLowerCase() !== "free" && (
                <Button variant="outline" size="sm" className="flex-1">
                  Cancel Subscription
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild className="flex-1">
                <Link to="/dashboard/streaming">
                  Manage Sources
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Card */}
        <Card className="border-teal-500/30 bg-teal-500/5 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge className="bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30">
                <Star className="h-3 w-3 mr-1" />
                RECOMMENDED FOR YOU
              </Badge>
            </div>
            <CardTitle className="text-lg">Creator Pro Plan</CardTitle>
            <CardDescription>
              Based on your usage patterns, we recommend upgrading to Creator
              Pro for better performance and more features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing */}
            {proPlan && (
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <div className="text-3xl font-bold text-foreground">
                    {billingCycle === "yearly"
                      ? formatPrice(proPlan.price_monthly)
                      : formatPrice(proPlan.price_monthly)}
                    <span className="text-lg text-muted-foreground">
                      /month
                    </span>
                  </div>
                </div>
                {billingCycle === "yearly" && (
                  <p className="text-sm text-muted-foreground">
                    or {formatPrice(proPlan.price_yearly)} billed annually
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-500" />
                <span>Unlimited streaming hours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-500" />
                <span>Up to 5 sources and 10 destinations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-500" />
                <span>Priority support and advanced analytics</span>
              </div>
            </div>
            <Button
              className="w-full bg-teal-600 hover:bg-teal-700 text-white"
              onClick={() => setShowPlanDialog(true)}
            >
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Streaming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Recent Streaming Sessions
          </CardTitle>
          <CardDescription>Your last 10 streaming sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-muted rounded animate-pulse"
                ></div>
              ))}
            </div>
          ) : streamingHistory &&
            streamingHistory.data &&
            streamingHistory.data.length > 0 ? (
            <div className="space-y-3">
              {streamingHistory.data.slice(0, 10).map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {session.source_name || "Legacy Stream"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.stream_start).toLocaleDateString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {session.duration_minutes}m
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Session #{session.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No streaming sessions found</p>
              <p className="text-sm mt-2">
                Start streaming to see your usage history here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Get support for your subscription and billing questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" asChild>
              <a href="mailto:farseen@neustream.app">
                <Shield className="h-4 w-4 mr-2" />
                Contact Support ( farseen@neustream.app )
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fullscreen Plan Selection Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="w-screen h-screen max-w-none m-0 p-0 rounded-none overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Dialog Header */}
            <DialogHeader className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">
                    Choose Your Plan
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select the plan that best fits your needs
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPlanDialog(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* Dialog Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Billing Cycle Toggle */}
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center space-x-4 p-4 bg-gradient-to-r from-teal-500/10 to-teal-600/5 rounded-xl border border-teal-500/20">
                  <span
                    className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    Monthly
                  </span>
                  <Switch
                    checked={billingCycle === "yearly"}
                    onCheckedChange={(checked) =>
                      setBillingCycle(checked ? "yearly" : "monthly")
                    }
                  />
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      Yearly
                    </span>
                    <Badge className="bg-emerald-500 text-white text-xs">
                      Save 20%
                    </Badge>
                  </div>
                </div>

                <div className="text-center max-w-2xl">
                  {billingCycle === "yearly" ? (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200 font-medium">
                        🎉 Great choice! You're saving 20%
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                        💡 Switch to yearly and save 20%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => {
                  const isCurrentPlan =
                    currentPlan?.plan_name?.toLowerCase() ===
                    plan.name.toLowerCase();
                  const price = getPlanPrice(plan);
                  const features = getPlanFeatures(plan.name);
                  const savingsPercentage = 20;

                  return (
                    <Card
                      key={plan.id}
                      className={`relative border-border bg-card ${
                        isCurrentPlan ? "ring-2 ring-teal-500" : ""
                      }`}
                    >
                      {isCurrentPlan && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-teal-500 text-white">
                            Current Plan
                          </Badge>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center justify-between">
                          <span>{plan.name}</span>
                          {plan.name.toLowerCase() === "free" && (
                            <Star className="h-5 w-5 text-yellow-500" />
                          )}
                          {plan.name.toLowerCase() === "pro" && (
                            <Zap className="h-5 w-5 text-teal-500" />
                          )}
                          {plan.name.toLowerCase() === "business" && (
                            <Shield className="h-5 w-5 text-purple-500" />
                          )}
                        </CardTitle>
                        <div className="space-y-3">
                          <div className="flex items-baseline space-x-2">
                            <div className="text-3xl font-bold text-foreground">
                              {plan.name.toLowerCase() === "free"
                                ? "Free"
                                : formatPrice(plan.price_monthly)}
                              <span className="text-lg text-muted-foreground">
                                /month
                              </span>
                            </div>
                          </div>

                          {plan.name.toLowerCase() !== "free" && (
                            <p className="text-sm text-muted-foreground">
                              or {formatPrice(plan.price_yearly)} billed
                              annually
                            </p>
                          )}

                          {/* Show savings for yearly billing */}
                          {billingCycle === "yearly" &&
                            plan.name.toLowerCase() !== "free" && (
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">
                                  Save {savingsPercentage}%
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  Equivalent to {price.monthly}/month
                                </span>
                              </div>
                            )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Plan Limits */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Sources:
                            </span>
                            <span className="font-medium text-foreground">
                              {plan.max_sources}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Destinations:
                            </span>
                            <span className="font-medium text-foreground">
                              {plan.max_destinations}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Streaming Hours:
                            </span>
                            <span className="font-medium text-foreground">
                              {plan.max_streaming_hours_monthly}h
                            </span>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          {features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm"
                              >
                                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                <FeatureIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground">
                                  {feature.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {isCurrentPlan ? (
                          <Button className="w-full" variant="outline" disabled>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                            onClick={() => {
                              setSelectedPlan(plan);
                              setShowPlanDialog(false);
                            }}
                            disabled={updateSubscriptionMutation.isLoading}
                          >
                            {updateSubscriptionMutation.isLoading &&
                            selectedPlan?.id === plan.id
                              ? "Upgrading..."
                              : "Select Plan"}
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Confirmation Modal (shown after selecting a plan) */}
      {selectedPlan && !showPlanDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirm Your Selection</CardTitle>
              <CardDescription>Review your plan selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selected Plan:</span>
                  <span className="font-medium text-foreground">
                    {selectedPlan.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Cycle:</span>
                  <span className="font-medium text-foreground capitalize">
                    {billingCycle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium text-foreground">
                    {selectedPlan.name.toLowerCase() === "free"
                      ? "Free"
                      : `${formatPrice(selectedPlan.price_monthly)}/month`}
                  </span>
                </div>
                {billingCycle === "yearly" &&
                  selectedPlan.name.toLowerCase() !== "free" && (
                    <p className="text-xs text-muted-foreground">
                      or {formatPrice(selectedPlan.price_yearly)} billed
                      annually
                    </p>
                  )}
              </div>

              {selectedPlan.name.toLowerCase() === "free" ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This is a free plan. Your subscription will be updated
                    immediately.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    You will be redirected to a secure payment page to complete
                    your purchase. Your subscription will be activated
                    immediately after successful payment.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex space-x-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedPlan(null);
                  setShowPlanDialog(true);
                }}
                disabled={
                  updateSubscriptionMutation.isLoading ||
                  processPaymentMutation.isLoading
                }
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                onClick={() => {
                  if (selectedPlan.name.toLowerCase() === "free") {
                    updateSubscriptionMutation.mutate({
                      planId: selectedPlan.id,
                      billingCycle: billingCycle,
                    });
                  } else {
                    processPaymentMutation.mutate({
                      planId: selectedPlan.id,
                      billingCycle: billingCycle,
                    });
                  }
                }}
                disabled={
                  updateSubscriptionMutation.isLoading ||
                  processPaymentMutation.isLoading
                }
              >
                {updateSubscriptionMutation.isLoading ||
                processPaymentMutation.isLoading
                  ? "Processing..."
                  : selectedPlan.name.toLowerCase() === "free"
                    ? "Switch to Free"
                    : "Proceed to Payment"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SubscriptionManagement;
