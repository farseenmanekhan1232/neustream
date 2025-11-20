import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Edit,
  Filter,
  Users,
  Crown,
  Zap,
  Shield,
  Calendar,
  Radio,
  Target,
  Clock,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function UserSubscriptions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingSubscription, setEditingSubscription] = useState(null);

  // Promote/Demote subscription mutation
  const promoteDemoteMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      const response = await adminApi.promoteDemoteUserSubscription(userId, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-user-subscriptions"]);
      setEditingSubscription(null);
      toast.success("User subscription updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user subscription: " + error.message);
    },
  });

  // Fetch user subscriptions
  const { data: subscriptionsData, isLoading } = useQuery({
    queryKey: ["admin-user-subscriptions", page, search],
    queryFn: async () => {
      const params = {
        page: page.toString(),
        limit: "20",
        search: search,
      };
      const response = await adminApi.getUserSubscriptions(params);
      return response;
    },
  });

  // Fetch subscription plans
  const { data: plansData } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const response = await adminApi.getSubscriptionPlans();
      return response;
    },
  });

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ userId, subscriptionData }) => {
      const response = await adminApi.updateUserSubscription(
        userId,
        subscriptionData,
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-user-subscriptions"]);
      setEditingSubscription(null);
      toast.success("User subscription updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user subscription: " + error.message);
    },
  });

  const handleUpdateSubscription = (userId, subscriptionData) => {
    updateSubscriptionMutation.mutate({
      userId,
      subscriptionData,
    });
  };

  const handlePromoteDemote = (userId, data) => {
    promoteDemoteMutation.mutate({ userId, data });
  };

  const getPlanIcon = (planName) => {
    switch (planName.toLowerCase()) {
      case "free":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "pro":
        return <Zap className="h-4 w-4 text-blue-500" />;
      case "business":
        return <Shield className="h-4 w-4 text-purple-500" />;
      default:
        return <Crown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Active
          </Badge>
        );
      case "canceled":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Canceled
          </Badge>
        );
      case "past_due":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Past Due
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const subscriptions = subscriptionsData?.data || [];
  const pagination = subscriptionsData?.pagination || {};
  const plans = plansData?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-3xl font-normal">User Subscriptions</div>
        <p className="text-muted-foreground mt-2">
          Manage user subscriptions and billing information
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users or plans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscriptions</CardTitle>
          <CardDescription>
            {pagination?.total} total subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Renewal Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions?.map((subscription) => (
                <TableRow
                  key={`${subscription.user_id}-${subscription.plan_id}`}
                >
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {subscription.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">
                          {subscription.display_name || subscription.email}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getPlanIcon(subscription.plan_name)}
                      <span className="font-medium">
                        {subscription.plan_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${subscription.price_monthly}/month
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2">
                        <Radio className="h-3 w-3 text-muted-foreground" />
                        <span>{subscription.sources_count || 0} sources</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {subscription.destinations_count || 0} destinations
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{subscription.streaming_hours || 0} hours</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {subscription.current_period_end ? (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {new Date(
                            subscription.current_period_end,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSubscription(subscription)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {subscriptions.length} of {pagination.total}{" "}
                subscriptions
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      <Dialog
        open={!!editingSubscription}
        onOpenChange={() => setEditingSubscription(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Subscription</DialogTitle>
            <DialogDescription>
              Update the subscription plan and status for this user.
            </DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <EditSubscriptionForm
              subscription={editingSubscription}
              plans={plans}
              onSubmit={handleUpdateSubscription}
              onPromoteDemote={handlePromoteDemote}
              isLoading={updateSubscriptionMutation.isLoading || promoteDemoteMutation.isLoading}
              onCancel={() => setEditingSubscription(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Edit Subscription Form Component
function EditSubscriptionForm({
  subscription,
  plans,
  onSubmit,
  onPromoteDemote,
  isLoading,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    plan_id: subscription.plan_id,
    status: subscription.status,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end).toISOString().split("T")[0]
      : "",
    reason: "",
    mode: "standard" // 'standard' or 'promote_demote'
  });

  const selectedPlan = plans.find(p => p.id === parseInt(formData.plan_id));
  const currentPlanPrice = subscription.price_monthly || 0;
  const newPlanPrice = selectedPlan?.price_monthly || 0;

  // Determine if this is a promotion or demotion
  const priceDiff = newPlanPrice - currentPlanPrice;
  const changeType = priceDiff > 0 ? "promotion" : priceDiff < 0 ? "demotion" : "no-change";

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.mode === "promote_demote" && !formData.reason.trim()) {
      alert("Please provide a reason for this plan change");
      return;
    }

    if (formData.mode === "promote_demote") {
      onPromoteDemote(subscription.user_id, {
        plan_id: parseInt(formData.plan_id),
        reason: formData.reason
      });
    } else {
      onSubmit(subscription.user_id, {
        ...formData,
        current_period_end: formData.current_period_end
          ? new Date(formData.current_period_end).toISOString()
          : null,
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Change Mode Toggle */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant={formData.mode === "standard" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({...formData, mode: "standard"})}
          >
            Standard Update
          </Button>
          <Button
            type="button"
            variant={formData.mode === "promote_demote" ? "default" : "outline"}
            size="sm"
            onClick={() => setFormData({...formData, mode: "promote_demote"})}
          >
            Promotion/Demotion
          </Button>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="plan_id">Subscription Plan</Label>
          <Select
            value={formData.plan_id}
            onValueChange={(value) => handleChange("plan_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a plan" />
            </SelectTrigger>
            <SelectContent>
              {plans?.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{plan.name}</span>
                    <span className="text-muted-foreground ml-2">${plan.price_monthly}/month</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Plan Comparison Card (only in promote_demote mode) */}
        {formData.mode === "promote_demote" && selectedPlan && (
          <Card className={`border-2 ${changeType === "promotion" ? "border-green-200 bg-green-50" : changeType === "demotion" ? "border-orange-200 bg-orange-50" : "border-gray-200"}`}>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {changeType === "promotion" && <><TrendingUp className="h-4 w-4 text-green-600" /> Promotion</>}
                {changeType === "demotion" && <><TrendingDown className="h-4 w-4 text-orange-600" /> Demotion</>}
                {changeType === "no-change" && <><Minus className="h-4 w-4 text-gray-600" /> No Change</>}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                  <p className="font-medium">{subscription.plan_name}</p>
                  <p className="text-sm text-muted-foreground">${currentPlanPrice}/month</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">New Plan</p>
                  <p className="font-medium">{selectedPlan.name}</p>
                  <p className="text-sm text-muted-foreground">${newPlanPrice}/month</p>
                  {changeType !== "no-change" && (
                    <p className={`text-xs font-medium ${changeType === "promotion" ? "text-green-600" : "text-orange-600"}`}>
                      {priceDiff > 0 ? "+" : ""}${priceDiff}/month
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {formData.mode === "promote_demote" && (
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Change *</Label>
            <textarea
              id="reason"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              placeholder="Explain why you're promoting/demoting this user's subscription..."
              required
            />
          </div>
        )}

        {formData.mode === "standard" && (
          <>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="current_period_end">Renewal Date</Label>
              <Input
                id="current_period_end"
                type="date"
                value={formData.current_period_end}
                onChange={(e) => handleChange("current_period_end", e.target.value)}
              />
            </div>
          </>
        )}

        {/* Current Plan Info */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-2">Current Plan</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>User:</span>
                <span className="font-medium">
                  {subscription.display_name || subscription.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Current Plan:</span>
                <span className="font-medium">{subscription.plan_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Status:</span>
                <span className="font-medium">{subscription.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Updating..."
            : formData.mode === "promote_demote"
            ? changeType === "promotion"
              ? "Promote User"
              : changeType === "demotion"
              ? "Demote User"
              : "Update Plan"
            : "Update Subscription"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default UserSubscriptions;
