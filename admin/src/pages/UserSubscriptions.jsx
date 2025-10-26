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

  const { subscriptions, pagination } = subscriptionsData || {
    subscriptions: [],
    pagination: {},
  };
  const plans = plansData || [];

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
            {pagination.total} total subscriptions
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
              {subscriptions.map((subscription) => (
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
              isLoading={updateSubscriptionMutation.isLoading}
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
  isLoading,
  onCancel,
}) {
  const [formData, setFormData] = useState({
    plan_id: subscription.plan_id,
    status: subscription.status,
    current_period_end: subscription.current_period_end
      ? new Date(subscription.current_period_end).toISOString().split("T")[0]
      : "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(subscription.user_id, {
      ...formData,
      current_period_end: formData.current_period_end
        ? new Date(formData.current_period_end).toISOString()
        : null,
    });
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
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
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price_monthly}/month
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          {isLoading ? "Updating..." : "Update Subscription"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default UserSubscriptions;
