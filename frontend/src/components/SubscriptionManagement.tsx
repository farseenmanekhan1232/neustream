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
  Loader2,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { subscriptionService } from "../services/subscription";
import { useCurrency } from "../contexts/CurrencyContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

function SubscriptionManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { formatPrice } = useCurrency();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState("yearly");

  // Fetch current subscription
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription", user?.id],
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

  // Update subscription mutation (for free plan)
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string; billingCycle: string }) => {
      return await subscriptionService.updateSubscription(planId, billingCycle);
    },
    onSuccess: () => {
      toast.success("Subscription updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      toast.error("Failed to update subscription: " + error.message);
    },
  });

  // Payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async ({ planId, billingCycle }: { planId: string; billingCycle: string }) => {
      const orderData = await subscriptionService.createPaymentOrder(planId, billingCycle);

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await subscriptionService.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verifyResponse.success) {
              toast.success("Payment successful! Your subscription has been upgraded.");
              queryClient.invalidateQueries({ queryKey: ["subscription", user?.id] });
              setSelectedPlan(null);
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.displayName || "",
          email: user?.email || "",
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

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

      return orderData;
    },
    onError: (error: any) => {
      toast.error("Failed to process payment: " + error.message);
    },
  });

  const currentPlan = subscriptionData?.subscription;
  const currentLimits = subscriptionData?.limits;
  const currentUsage = subscriptionData?.current_usage;
  const plans = plansData?.data?.plans || plansData?.plans || plansData || [];

  const planFeatures: Record<string, any[]> = {
    free: [
      { name: "Basic Analytics", icon: TrendingUp },
      { name: "Community Support", icon: Users },
      { name: "Stream to platforms simultaneously", icon: Zap },
      { name: "35 hours streaming monthly", icon: Clock },
      { name: "1 chat connector", icon: Star },
    ],
    pro: [
      { name: "Advanced Analytics", icon: TrendingUp },
      { name: "Priority Support", icon: Users },
      { name: "Stream to platforms simultaneously", icon: Zap },
      { name: "1000 hours streaming monthly", icon: Clock },
      { name: "Up to 2 streaming sources", icon: Zap },
      { name: "3 chat connectors", icon: Star },
    ],
    business: [
      { name: "Enterprise Analytics", icon: TrendingUp },
      { name: "24/7 Support", icon: Users },
      { name: "Stream to platforms simultaneously", icon: Zap },
      { name: "5000 hours streaming monthly", icon: Clock },
      { name: "Up to 5 streaming sources", icon: Zap },
      { name: "10 chat connectors", icon: Star },
    ],
  };

  const getPlanFeatures = (planName: string, planData?: any) => {
    const planKey = planName.toLowerCase();
    const baseFeatures = planFeatures[planKey] || planFeatures.free;
    
    // If no plan data provided, return base features
    if (!planData) return baseFeatures;

    // Create a copy of base features to modify
    const features = [...baseFeatures];

    // Override with actual plan data from API
    if (planData.max_destinations) {
      const destIndex = features.findIndex(f => f.name.includes("Stream to"));
      if (destIndex !== -1) {
        features[destIndex] = {
          ...features[destIndex],
          name: `Stream to ${planData.max_destinations} platform${planData.max_destinations > 1 ? "s" : ""} simultaneously`
        };
      }
    }

    if (planData.max_streaming_hours_monthly) {
      const hoursIndex = features.findIndex(f => f.name.includes("hours streaming"));
      if (hoursIndex !== -1) {
        features[hoursIndex] = {
          ...features[hoursIndex],
          name: `${planData.max_streaming_hours_monthly} hours streaming monthly`
        };
      }
    }

    if (planData.max_sources && planData.max_sources > 1) {
      const sourcesIndex = features.findIndex(f => f.name.includes("streaming sources"));
      if (sourcesIndex !== -1) {
        features[sourcesIndex] = {
          ...features[sourcesIndex],
          name: `Up to ${planData.max_sources} streaming sources`
        };
      }
    }

    // Parse chat connectors from plan features array
    if (planData.features && Array.isArray(planData.features)) {
      const chatFeature = planData.features.find((f: string) => f.includes("Chat Connectors:"));
      if (chatFeature) {
        const match = chatFeature.match(/Chat Connectors:\s*(\d+)/);
        if (match) {
          const chatConnectorsCount = parseInt(match[1]);
          const chatIndex = features.findIndex(f => f.name.includes("chat connector"));
          if (chatIndex !== -1) {
            features[chatIndex] = {
              ...features[chatIndex],
              name: `${chatConnectorsCount} chat connector${chatConnectorsCount > 1 ? "s" : ""}`
            };
          }
        }
      }
    }

    return features;
  };

  const getPlanPrice = (plan: any) => {
    if (!plan) return { monthly: formatPrice(0), yearly: formatPrice(0) };
    return {
      monthly: plan.formatted_price_monthly || formatPrice(plan.price_monthly),
      yearly: plan.formatted_price_yearly || formatPrice(plan.price_yearly),
    };
  };

  if (subscriptionLoading || plansLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate usage percentages
  const sourceUsagePercent = currentUsage && currentLimits ? (currentUsage.sources_count / currentLimits.max_sources) * 100 : 0;
  const destinationUsagePercent = currentUsage && currentLimits ? (currentUsage.destinations_count / currentLimits.max_destinations) * 100 : 0;
  const streamingHours = currentUsage?.streaming_hours ? parseFloat(currentUsage.streaming_hours.toString()) : 0;
  const streamingUsagePercent = currentLimits ? (streamingHours / currentLimits.max_streaming_hours_monthly) * 100 : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Subscription Plans</h1>
        <p className="text-muted-foreground text-lg">Choose the perfect plan for your streaming needs</p>
      </div>

      {/* Current Usage Summary - Streamlined */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Crown className="w-24 h-24" />
        </div>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Current Plan
            </Badge>
            {currentPlan?.status === "active" && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">
                Active
              </Badge>
            )}
          </div>
          <CardTitle className="text-2xl">{currentPlan?.plan_name || "Free"} Plan</CardTitle>
          <CardDescription>
            {currentPlan?.billing_cycle === "yearly" ? "Billed Annually" : "Billed Monthly"}
            {currentPlan?.current_period_end && (
              <span> • Renews on {new Date(currentPlan.current_period_end).toLocaleDateString()}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Streaming Hours</span>
                <span className="font-medium">{streamingHours.toFixed(1)} / {currentLimits?.max_streaming_hours_monthly || "∞"}h</span>
              </div>
              <Progress value={Math.min(streamingUsagePercent, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sources</span>
                <span className="font-medium">{currentUsage?.sources_count || 0} / {currentLimits?.max_sources || "∞"}</span>
              </div>
              <Progress value={Math.min(sourceUsagePercent, 100)} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destinations</span>
                <span className="font-medium">{currentUsage?.destinations_count || 0} / {currentLimits?.max_destinations || "∞"}</span>
              </div>
              <Progress value={Math.min(destinationUsagePercent, 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <div className="flex items-center p-1 bg-muted rounded-full border border-border/50">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all",
              billingCycle === "monthly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
              billingCycle === "yearly" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yearly
            <Badge variant="secondary" className="text-[10px] h-5 bg-green-500/10 text-green-600">Save 20%</Badge>
          </button>
        </div>
      </div>

      {/* Plan Cards - Inline */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan: any) => {
          const isCurrent = currentPlan?.plan_name?.toLowerCase() === plan.name.toLowerCase();
          const isPro = plan.name.toLowerCase() === "pro";
          const features = getPlanFeatures(plan.name, plan);

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col transition-all hover:shadow-lg",
                isPro ? "border-primary/50 bg-primary/5 shadow-md" : "border-border/40 bg-card/50",
                isCurrent && "ring-2 ring-primary"
              )}
            >
              {isPro && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary">Most Popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Current</Badge>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    {plan.name.toLowerCase() === "free" ? "Free" : formatPrice(billingCycle === "yearly" ? plan.price_yearly / 12 : plan.price_monthly)}
                  </span>
                  {plan.name.toLowerCase() !== "free" && (
                    <span className="text-muted-foreground">/mo</span>
                  )}
                </div>
                {billingCycle === "yearly" && plan.name.toLowerCase() !== "free" && (
                   <p className="text-xs text-muted-foreground mt-1">Billed {formatPrice(plan.price_yearly)} yearly</p>
                )}
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {features.map((feature: any, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature.name}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={cn("w-full", isPro ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}
                variant={isPro ? "default" : "outline"}
                disabled={isCurrent}
                onClick={() => setSelectedPlan(plan)}
              >
                {isCurrent ? "Current Plan" : "Select Plan"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Support Section */}
      <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
          <CardDescription>
            Our team is here to help you choose the right plan and get the most out of Neustream.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/contact">
              <Shield className="mr-2 h-4 w-4" />
              Contact Support
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/dashboard/streaming">
              <Zap className="mr-2 h-4 w-4" />
              Manage Sources
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription</DialogTitle>
            <DialogDescription>
              You are about to switch to the <span className="font-semibold text-foreground">{selectedPlan?.name}</span> plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
             <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">Total due today</span>
                <span className="text-xl font-bold">
                  {selectedPlan?.name.toLowerCase() === "free" 
                    ? "Free" 
                    : formatPrice(billingCycle === "yearly" ? selectedPlan?.price_yearly : selectedPlan?.price_monthly)
                  }
                </span>
             </div>
             <p className="text-sm text-muted-foreground">
                {selectedPlan?.name.toLowerCase() !== "free" 
                  ? "You will be redirected to our secure payment processor to complete your purchase." 
                  : "Your plan will be updated immediately."}
             </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedPlan(null)}>Cancel</Button>
            <Button 
              onClick={() => {
                if (selectedPlan.name.toLowerCase() === "free") {
                  updateSubscriptionMutation.mutate({ planId: selectedPlan.id, billingCycle });
                } else {
                  processPaymentMutation.mutate({ planId: selectedPlan.id, billingCycle });
                }
              }}
              disabled={updateSubscriptionMutation.isPending || processPaymentMutation.isPending}
            >
              {updateSubscriptionMutation.isPending || processPaymentMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubscriptionManagement;
