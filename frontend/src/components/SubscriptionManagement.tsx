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
  const [showPlanDialog, setShowPlanDialog] = useState(false);

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

  const getPlanFeatures = (planName: string) => {
    const planKey = planName.toLowerCase();
    return planFeatures[planKey] || planFeatures.free;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
          <p className="text-muted-foreground">Manage your plan and billing details.</p>
        </div>
        <Button onClick={() => setShowPlanDialog(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Upgrade Plan
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current Plan Card */}
        <Card className="lg:col-span-2 border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Crown className="w-32 h-32" />
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
            <CardTitle className="text-3xl">{currentPlan?.plan_name || "Free"} Plan</CardTitle>
            <CardDescription>
              {currentPlan?.billing_cycle === "yearly" ? "Billed Annually" : "Billed Monthly"}
              {currentPlan?.current_period_end && (
                <span> • Renews on {new Date(currentPlan.current_period_end).toLocaleDateString()}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
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

        {/* Quick Actions / Support */}
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm flex flex-col justify-center">
          <CardHeader>
            <CardTitle>Need more power?</CardTitle>
            <CardDescription>
              Upgrade to unlock unlimited streaming, more destinations, and priority support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/contact">
                  <Shield className="mr-2 h-4 w-4" />
                  Contact Support
                </Link>
             </Button>
             <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/dashboard/streaming">
                  <Zap className="mr-2 h-4 w-4" />
                  Manage Sources
                </Link>
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plans Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-5xl w-full h-[90vh] md:h-auto overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-3xl font-bold">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-lg">
              Unlock the full potential of Neustream with our flexible pricing plans.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center mb-8">
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

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan: any) => {
              const isCurrent = currentPlan?.plan_name?.toLowerCase() === plan.name.toLowerCase();
              const isPro = plan.name.toLowerCase() === "pro";
              const features = getPlanFeatures(plan.name);

              return (
                <div
                  key={plan.id}
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
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

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
