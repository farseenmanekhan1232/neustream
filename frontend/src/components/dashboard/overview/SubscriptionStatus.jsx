import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UsageMeter from "@/components/UsageMeter";

const SubscriptionStatus = memo(function SubscriptionStatus({
  subscriptionData,
}) {
  if (!subscriptionData) return null;

  const { subscription, limits, current_usage, features } = subscriptionData;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            {subscription.plan_name} Plan
          </span>
          <Badge
            variant={subscription.status === "active" ? "default" : "secondary"}
            className="text-xs"
          >
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Compact Usage Overview */}
        <div className="flex gap-3 text-center">
          <div className="space-y-1">
            <div className="text-lg font-medium text-primary">
              {current_usage.sources_count}/{limits.max_sources}
            </div>
            <div className="text-xs text-muted-foreground">Sources</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-medium text-primary">
              {current_usage.destinations_count}/{limits.max_destinations}
            </div>
            <div className="text-xs text-muted-foreground">Destinations</div>
          </div>
        </div>

        {/* Compact Usage Meters */}
        <div className="space-y-2">
          <UsageMeter
            label="Stream Hours"
            current={current_usage.streaming_hours}
            max={limits.max_streaming_hours_monthly}
            unit="h"
            // compact={true}
          />
        </div>

        {/* Compact Footer */}
        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            {subscription.current_period_end
              ? `Renews ${new Date(
                  subscription.current_period_end,
                ).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}`
              : "No active subscription"}
          </div>
          <Button variant="ghost" size="sm" asChild className="h-7 px-2">
            <Link to="/dashboard/subscription">
              Manage
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default SubscriptionStatus;
