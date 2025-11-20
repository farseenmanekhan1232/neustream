import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/**
 * MinimalStatCard - Clean, modern stat card with hover effects
 * @param {string} title - Card title
 * @param {string|number} value - Main value to display
 * @param {React.Component} icon - Icon component (from lucide-react)
 * @param {string} trend - Optional trend text
 * @param {string} trendType - 'positive', 'negative', or 'neutral'
 * @param {string} className - Additional classes
 */
export function MinimalStatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
  className,
}) {
  const trendColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  };

  return (
    <Card
      className={cn(
        "card-minimal hover-lift cursor-default border",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-semibold text-foreground tracking-tight">
              {value}
            </p>
            {trend && (
              <p className={cn("text-xs font-medium", trendColors[trendType])}>
                {trend}
              </p>
            )}
          </div>
          {Icon && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default MinimalStatCard;
