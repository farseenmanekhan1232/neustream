import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Edit,
  Users,
  Crown,
  Zap,
  Shield,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
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
import { MinimalStatCard } from "../components/common/MinimalStatCard";
import { ActionMenu } from "../components/common/ActionMenu";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

function UserSubscriptions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [isPromoteDemoteMode, setIsPromoteDemoteMode] = useState(false);
  const [reason, setReason] = useState("");

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
      setIsPromoteDemoteMode(false);
      setReason("");
      toast.success("User subscription updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user subscription: " + error.message);
    },
  });

  // Promote/Demote mutation
  const promoteDemoteMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      const response = await adminApi.promoteDemoteUserSubscription(userId, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-user-subscriptions"]);
      setEditingSubscription(null);
      setIsPromoteDemoteMode(false);
      setReason("");
      toast.success("User subscription updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update user subscription: " + error.message);
    },
  });

  const handleUpdateSubscription = () => {
    if (!editingSubscription) return;

    if (isPromoteDemoteMode) {
      if (!reason || reason.trim() === "") {
        toast.error("Please provide a reason for this change");
        return;
      }

      promoteDemoteMutation.mutate({
        userId: editingSubscription.user_id,
        data: {
          planId: editingSubscription.plan_id,
          reason: reason,
        },
      });
    } else {
      updateSubscriptionMutation.mutate({
        userId: editingSubscription.user_id,
        subscriptionData: {
          planId: editingSubscription.plan_id,
          status: editingSubscription.status,
        },
      });
    }
  };

  const getPlanIcon = (planName) => {
    switch (planName?.toLowerCase()) {
      case "free":
        return Crown;
      case "pro":
        return Zap;
      case "business":
        return Shield;
      default:
        return Crown;
    }
  };

  const getPlanColor = (planName) => {
    switch (planName?.toLowerCase()) {
      case "free":
        return "text-muted-foreground";
      case "pro":
        return "text-primary";
      case "business":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "active":
        return "default";
      case "cancelled":
        return "destructive";
      case "expired":
        return "secondary";
      default:
        return "outline";
    }
  };

  const SubscriptionRow = ({ subscription }) => {
    const PlanIcon = getPlanIcon(subscription.plan_name);

    const actions = [
      {
        label: "Edit Subscription",
        icon: Edit,
        onClick: () => {
          setEditingSubscription(subscription);
          setIsPromoteDemoteMode(false);
          setReason("");
        },
      },
    ];

    return (
      <TableRow className="hover:bg-muted/50 transition-smooth">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {subscription.user_email?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {subscription.user_display_name || "Unknown User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {subscription.user_email}
              </p>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <PlanIcon className={cn("h-4 w-4", getPlanColor(subscription.plan_name))} />
            <span className="font-medium">{subscription.plan_name}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(subscription.status)}>
            {subscription.status}
          </Badge>
        </TableCell>
        <TableCell className="text-center">
          <ActionMenu actions={actions} />
        </TableCell>
      </TableRow>
    );
  };

  const subscriptions = subscriptionsData?.data?.subscriptions || [];
  const plans = plansData?.data || [];
  const totalSubscriptions = subscriptionsData?.data?.total || 0;

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "active",
  ).length;
  const paidSubscriptions = subscriptions.filter(
    (s) => s.plan_name?.toLowerCase() !== "free" && s.status === "active",
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="card-minimal">
              <CardContent className="p-6">
                <div className="h-4 w-1/2 bg-muted rounded mb-4 animate-pulse" />
                <div className="h-10 w-3/4 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight">
          User Subscriptions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage user subscription plans and status
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MinimalStatCard
          title="Total Subscriptions"
          value={totalSubscriptions}
          icon={CreditCard}
          trend="All plans"
          trendType="neutral"
        />
        <MinimalStatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          icon={Users}
          trend={`${Math.round((activeSubscriptions / Math.max(totalSubscriptions, 1)) * 100)}% of total`}
          trendType="positive"
        />
        <MinimalStatCard
          title="Paid Subscriptions"
          value={paidSubscriptions}
          icon={Zap}
          trend={`${Math.round((paidSubscriptions / Math.max(totalSubscriptions, 1)) * 100)}% of total`}
          trendType="positive"
        />
      </div>

      {/* Search */}
      <Card className="card-minimal">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by user email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            Showing {subscriptions.length} of {totalSubscriptions} subscriptions
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      {subscriptions.length > 0 ? (
        <Card className="card-minimal">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <SubscriptionRow
                    key={subscription.user_id}
                    subscription={subscription}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-minimal">
          <CardContent className="p-12 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium text-foreground">
              {search ? "No matching subscriptions" : "No subscriptions found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {search
                ? "Try adjusting your search query."
                : "Subscriptions will appear here as users subscribe to plans."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Subscription Dialog */}
      <Dialog
        open={!!editingSubscription}
        onOpenChange={() => {
          setEditingSubscription(null);
          setIsPromoteDemoteMode(false);
          setReason("");
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isPromoteDemoteMode ? "Promote/Demote User" : "Edit Subscription"}
            </DialogTitle>
          </DialogHeader>

          {editingSubscription && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  {editingSubscription.user_display_name || "Unknown User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {editingSubscription.user_email}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!isPromoteDemoteMode ? "default" : "outline"}
                  onClick={() => setIsPromoteDemoteMode(false)}
                  className="flex-1"
                >
                  Standard Edit
                </Button>
                <Button
                  variant={isPromoteDemoteMode ? "default" : "outline"}
                  onClick={() => setIsPromoteDemoteMode(true)}
                  className="flex-1"
                >
                  Promote/Demote
                </Button>
              </div>

              {/* Plan Selection */}
              <div className="space-y-2">
                <Label>Subscription Plan</Label>
                <Select
                  value={editingSubscription.plan_id}
                  onValueChange={(value) =>
                    setEditingSubscription({
                      ...editingSubscription,
                      plan_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        <div className="flex items-center gap-2">
                          {getPlanIcon(plan.name) && (
                            <span className={getPlanColor(plan.name)}>
                              {getPlanIcon(plan.name).type.name}
                            </span>
                          )}
                          {plan.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Selection (only in standard mode) */}
              {!isPromoteDemoteMode && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editingSubscription.status}
                    onValueChange={(value) =>
                      setEditingSubscription({
                        ...editingSubscription,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reason Field (only in promote/demote mode) */}
              {isPromoteDemoteMode && (
                <div className="space-y-2">
                  <Label>
                    Reason <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter the reason for this promotion/demotion..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This reason will be logged for audit purposes.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingSubscription(null);
                setIsPromoteDemoteMode(false);
                setReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateSubscription}
              disabled={
                updateSubscriptionMutation.isPending ||
                promoteDemoteMutation.isPending
              }
            >
              {updateSubscriptionMutation.isPending ||
              promoteDemoteMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserSubscriptions;
