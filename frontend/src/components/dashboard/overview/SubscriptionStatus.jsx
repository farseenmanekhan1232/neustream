import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsageMeter from "@/components/UsageMeter";

const SubscriptionStatus = memo(function SubscriptionStatus({ subscriptionData }) {
  if (!subscriptionData) return null;

  const {
    subscription,
    limits,
    current_usage,
    features
  } = subscriptionData;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-primary" />
            {subscription.plan_name} Plan
          </span>
          <Badge
            variant={
              subscription.status === "active"
                ? "default"
                : "secondary"
            }
          >
            {subscription.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plan Limits */}
          <div className="grid gap-4 md:grid-cols-3 text-center">
            <div>
              <div className="text-2xl font-normal text-primary">
                {limits.max_sources}
              </div>
              <div className="text-sm text-muted-foreground">
                Max Sources
              </div>
            </div>
            <div>
              <div className="text-2xl font-normal text-primary">
                {limits.max_destinations}
              </div>
              <div className="text-sm text-muted-foreground">
                Max Destinations
              </div>
            </div>
            <div>
              <div className="text-2xl font-normal text-primary">
                {limits.max_streaming_hours_monthly}h
              </div>
              <div className="text-sm text-muted-foreground">
                Monthly Hours
              </div>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="space-y-4">
            <UsageMeter
              label="Streaming Hours"
              current={current_usage.streaming_hours}
              max={limits.max_streaming_hours_monthly}
              unit="hours"
            />
            <UsageMeter
              label="Sources"
              current={current_usage.sources_count}
              max={limits.max_sources}
              unit="sources"
            />
            <UsageMeter
              label="Destinations"
              current={current_usage.destinations_count}
              max={limits.max_destinations}
              unit="destinations"
            />
          </div>

          {/* Plan Features */}
          {features && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Plan Features:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(features).map(
                  ([key, value]) => (
                    <Badge key={key} variant="outline" className="text-xs">
                      {key}: {value}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {subscription.current_period_end
              ? `Renews on ${new Date(
                  subscription.current_period_end
                ).toLocaleDateString()}`
              : "No active subscription"}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/subscription">
              Manage
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

export default SubscriptionStatus;