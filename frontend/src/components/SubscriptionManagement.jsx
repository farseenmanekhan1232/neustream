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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "../contexts/AuthContext";
import { subscriptionService } from "../services/subscription";
import { useCurrency } from "../contexts/CurrencyContext";

function SubscriptionManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState("yearly"); // Default to yearly

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
        billingCycle
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
              response.razorpay_signature
            );

            if (verifyResponse.success) {
              toast.success(
                "Payment successful! Your subscription has been upgraded."
              );
              queryClient.invalidateQueries(["subscription", user.id]);
              setSelectedPlan(null);
            } else {
              toast.error(
                "Payment verification failed. Please contact support."
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
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-6 space-y-6  mx-auto">
      {/* Current Plan Header - Compact Version */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              {currentPlan?.plan_name} Plan
            </span>
            <Badge
              variant={
                currentPlan?.status === "active" ? "default" : "secondary"
              }
              className="text-xs"
            >
              {currentPlan?.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Compact Usage Overview */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-lg font-medium text-primary">
                {currentUsage?.sources_count}/{currentLimits?.max_sources}
              </div>
              <div className="text-xs text-muted-foreground">Sources</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-medium text-primary">
                {currentUsage?.destinations_count}/{currentLimits?.max_destinations}
              </div>
              <div className="text-xs text-muted-foreground">Destinations</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-medium text-primary">
                {Number(currentUsage?.streaming_hours || 0).toFixed(0)}/{currentLimits?.max_streaming_hours_monthly}h
              </div>
              <div className="text-xs text-muted-foreground">Hours</div>
            </div>
          </div>

          {currentPlan?.current_period_end && (
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Renews {new Date(currentPlan.current_period_end).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans">Available Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Available Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center justify-center space-x-4 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
              <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch
                checked={billingCycle === "yearly"}
                onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
              />
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
                  Yearly
                </span>
                <Badge className="bg-green-500 text-white text-xs animate-pulse">
                  Save 20%
                </Badge>
              </div>
            </div>

            {/* Billing Benefits */}
            <div className="text-center max-w-2xl">
              {billingCycle === "yearly" ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 font-medium mb-2">🎉 Great choice! You're saving 20%</p>
                  <p className="text-xs text-green-600">Yearly billing gives you the best value and uninterrupted service all year long.</p>
                </div>
              ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium mb-2">💡 Switch to yearly and save 20%</p>
                  <p className="text-xs text-blue-600">Get 2 months free when you choose annual billing. Plus, you'll lock in your current rate.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const isCurrentPlan =
                currentPlan?.plan_name?.toLowerCase() ===
                plan.name.toLowerCase();
              const price = getPlanPrice(plan);
              const features = getPlanFeatures(plan.name);
              const displayPrice = billingCycle === "yearly" ? price.yearly : price.monthly;
              const savingsPercentage = 20; // You can calculate this dynamically if needed

              return (
                <Card
                  key={plan.id}
                  className={`relative border-primary/30 bg-primary/5 ${
                    isCurrentPlan ? "ring-2 ring-primary" : ""
                  }`}
                >
                  {isCurrentPlan && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>{plan.name}</span>
                      {plan.name.toLowerCase() === "free" && (
                        <Star className="h-5 w-5 text-yellow-500" />
                      )}
                      {plan.name.toLowerCase() === "pro" && (
                        <Zap className="h-5 w-5 text-primary" />
                      )}
                      {plan.name.toLowerCase() === "business" && (
                        <Shield className="h-5 w-5 text-purple-500" />
                      )}
                    </CardTitle>
                    <div className="space-y-3">
                      <div className="flex items-baseline space-x-2">
                        <div className="text-3xl font-normal">
                          {plan.name.toLowerCase() === "free" ? "Free" : displayPrice}
                        </div>
                        {plan.name.toLowerCase() !== "free" && (
                          <span className="text-sm font-normal text-muted-foreground">
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        )}
                      </div>

                      {/* Show savings for yearly billing */}
                      {billingCycle === "yearly" && plan.name.toLowerCase() !== "free" && (
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            Save {savingsPercentage}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Equivalent to {price.monthly}/month
                          </span>
                        </div>
                      )}

                      {/* Show comparison for monthly billing */}
                      {billingCycle === "monthly" && plan.name.toLowerCase() !== "free" && (
                        <div className="text-xs text-muted-foreground">
                          <span>Or {price.yearly} billed annually (Save {savingsPercentage}%)</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Plan Limits */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Sources:</span>
                        <span className="font-medium">{plan.max_sources}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Destinations:</span>
                        <span className="font-medium">
                          {plan.max_destinations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Streaming Hours:</span>
                        <span className="font-medium">
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
                            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <FeatureIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{feature.name}</span>
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
                        className="w-full"
                        onClick={() => setSelectedPlan(plan)}
                        disabled={updateSubscriptionMutation.isLoading}
                      >
                        {updateSubscriptionMutation.isLoading &&
                        selectedPlan?.id === plan.id
                          ? "Upgrading..."
                          : "Upgrade Plan"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Plan Upgrade Confirmation Modal */}
          {selectedPlan && (
            <Card className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Upgrade to {selectedPlan.name}</CardTitle>
                  <CardDescription>
                    You are about to upgrade your subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>New Plan:</span>
                      <span className="font-medium">{selectedPlan.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billing Cycle:</span>
                      <span className="font-medium capitalize">{billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price:</span>
                      <span className="font-medium">
                        {selectedPlan.name.toLowerCase() === "free"
                          ? "Free"
                          : `${billingCycle === "yearly" ? getPlanPrice(selectedPlan).yearly : getPlanPrice(selectedPlan).monthly}/${billingCycle === "yearly" ? "year" : "month"}`
                        }
                      </span>
                    </div>
                    {billingCycle === "yearly" && selectedPlan.name.toLowerCase() !== "free" && (
                      <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                        You're saving 20% with yearly billing!
                      </div>
                    )}
                  </div>

                  {selectedPlan.name.toLowerCase() === "free" ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        This is a free plan. Your subscription will be updated
                        immediately.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        You will be redirected to a secure payment page to
                        complete your purchase. Your subscription will be
                        activated immediately after successful payment.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedPlan(null)}
                    disabled={
                      updateSubscriptionMutation.isLoading ||
                      processPaymentMutation.isLoading
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
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
            </Card>
          )}
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Streaming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Recent Streaming Sessions
                </CardTitle>
                <CardDescription>
                  Your last 10 streaming sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-12 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : streamingHistory && streamingHistory.length > 0 ? (
                  <div className="space-y-3">
                    {streamingHistory.slice(0, 10).map((session, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {session.source_name || "Legacy Stream"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.started_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {Math.floor(session.duration_seconds / 3600)}h{" "}
                            {Math.floor((session.duration_seconds % 3600) / 60)}
                            m
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {session.destinations_count} destinations
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

            {/* Monthly Usage Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Usage</CardTitle>
                <CardDescription>Streaming hours per month</CardDescription>
              </CardHeader>
              <CardContent>
                {breakdownLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className="h-8 bg-gray-200 rounded animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : usageBreakdown && usageBreakdown.length > 0 ? (
                  <div className="space-y-3">
                    {usageBreakdown.map((month, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{month.month}</span>
                          <span className="font-medium">
                            {month.hours} hours
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                (month.hours /
                                  currentLimits?.max_streaming_hours_monthly) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No usage data available</p>
                    <p className="text-sm mt-2">
                      Usage data will appear after you start streaming
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Information</CardTitle>
              <CardDescription>
                Manage your subscription and view payment history
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">
                      Secure Payment Processing
                    </p>
                    <p className="text-sm text-green-600">
                      All payments are processed securely through Razorpay. Your
                      payment information is never stored on our servers.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan?.plan_name}
                    </p>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>

                {currentPlan?.current_period_end && (
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Next Billing Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          currentPlan.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
              <CardDescription>
                Your recent subscription payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payment history yet</p>
                <p className="text-sm mt-2">
                  Your payment history will appear here after you make your
                  first payment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
              <a href="/help" target="_blank" rel="noopener noreferrer">
                <Users className="h-4 w-4 mr-2" />
                View Help Center
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@neustream.app">
                <Shield className="h-4 w-4 mr-2" />
                Contact Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SubscriptionManagement;
