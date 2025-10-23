import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Clock,
  Radio,
  Target,
  Check,
  X,
  Crown,
  Zap,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function SubscriptionPlans() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Fetch subscription plans
  const { data: plansData, isLoading } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/admin/subscription-plans");
      if (!response.ok) throw new Error("Failed to fetch plans");
      return response.json();
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      const response = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });
      if (!response.ok) throw new Error("Failed to create plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setIsCreateDialogOpen(false);
      toast.success("Subscription plan created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create subscription plan: " + error.message);
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, planData }) => {
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planData),
      });
      if (!response.ok) throw new Error("Failed to update plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      setEditingPlan(null);
      toast.success("Subscription plan updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update subscription plan: " + error.message);
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/subscription-plans/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete plan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-subscription-plans"]);
      toast.success("Subscription plan deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete subscription plan: " + error.message);
    },
  });

  const handleCreatePlan = (formData) => {
    createPlanMutation.mutate({
      name: formData.name,
      description: formData.description,
      price_monthly: parseFloat(formData.price_monthly),
      price_yearly: parseFloat(formData.price_yearly),
      max_sources: parseInt(formData.max_sources),
      max_destinations: parseInt(formData.max_destinations),
      max_streaming_hours_monthly: parseInt(formData.max_streaming_hours_monthly),
      features: formData.features ? formData.features.split("\n").filter(f => f.trim()) : [],
    });
  };

  const handleUpdatePlan = (id, formData) => {
    updatePlanMutation.mutate({
      id,
      planData: {
        name: formData.name,
        description: formData.description,
        price_monthly: parseFloat(formData.price_monthly),
        price_yearly: parseFloat(formData.price_yearly),
        max_sources: parseInt(formData.max_sources),
        max_destinations: parseInt(formData.max_destinations),
        max_streaming_hours_monthly: parseInt(formData.max_streaming_hours_monthly),
        features: formData.features ? formData.features.split("\n").filter(f => f.trim()) : [],
      },
    });
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case "pro":
        return <Zap className="h-5 w-5 text-blue-500" />;
      case "business":
        return <Shield className="h-5 w-5 text-purple-500" />;
      default:
        return <Crown className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const plans = plansData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground mt-2">
            Manage subscription plans and pricing tiers
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subscription Plan</DialogTitle>
              <DialogDescription>
                Define a new subscription plan with its features and pricing.
              </DialogDescription>
            </DialogHeader>
            <PlanForm
              onSubmit={handleCreatePlan}
              isLoading={createPlanMutation.isLoading}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPlanIcon(plan.name)}
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingPlan(plan)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
                        deletePlanMutation.mutate(plan.id);
                      }
                    }}
                    disabled={plan.active_subscriptions > 0}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold">${plan.price_monthly}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <div className="text-sm text-muted-foreground">
                ${plan.price_yearly} billed annually
              </div>

              {/* Limits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Radio className="h-4 w-4 text-muted-foreground" />
                    <span>Sources</span>
                  </div>
                  <span className="font-medium">{plan.max_sources}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>Destinations</span>
                  </div>
                  <span className="font-medium">{plan.max_destinations}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Streaming Hours</span>
                  </div>
                  <span className="font-medium">{plan.max_streaming_hours_monthly}h</span>
                </div>
              </div>

              {/* Features */}
              {plan.features && plan.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Features</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Active Subscriptions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Active Subscriptions</span>
                </div>
                <Badge variant="outline">{plan.active_subscriptions || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details and features.
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <PlanForm
              plan={editingPlan}
              onSubmit={(formData) => handleUpdatePlan(editingPlan.id, formData)}
              isLoading={updatePlanMutation.isLoading}
              onCancel={() => setEditingPlan(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Plan Form Component
function PlanForm({ plan, onSubmit, isLoading, onCancel }) {
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price_monthly: plan?.price_monthly || "",
    price_yearly: plan?.price_yearly || "",
    max_sources: plan?.max_sources || "",
    max_destinations: plan?.max_destinations || "",
    max_streaming_hours_monthly: plan?.max_streaming_hours_monthly || "",
    features: plan?.features ? plan.features.join("\n") : "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Pro, Business"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Brief description of the plan"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price_monthly">Monthly Price ($)</Label>
            <Input
              id="price_monthly"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_monthly}
              onChange={(e) => handleChange("price_monthly", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="price_yearly">Yearly Price ($)</Label>
            <Input
              id="price_yearly"
              type="number"
              step="0.01"
              min="0"
              value={formData.price_yearly}
              onChange={(e) => handleChange("price_yearly", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="max_sources">Max Sources</Label>
            <Input
              id="max_sources"
              type="number"
              min="0"
              value={formData.max_sources}
              onChange={(e) => handleChange("max_sources", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max_destinations">Max Destinations</Label>
            <Input
              id="max_destinations"
              type="number"
              min="0"
              value={formData.max_destinations}
              onChange={(e) => handleChange("max_destinations", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="max_streaming_hours_monthly">Monthly Hours</Label>
            <Input
              id="max_streaming_hours_monthly"
              type="number"
              min="0"
              value={formData.max_streaming_hours_monthly}
              onChange={(e) => handleChange("max_streaming_hours_monthly", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="features">Features (one per line)</Label>
          <Textarea
            id="features"
            value={formData.features}
            onChange={(e) => handleChange("features", e.target.value)}
            placeholder="Advanced analytics\nPriority support\nCustom branding"
            rows={4}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : plan ? "Update Plan" : "Create Plan"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default SubscriptionPlans;