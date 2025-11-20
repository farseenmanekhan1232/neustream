import { Link } from "react-router-dom";
import { Sparkles, Clock, Radio } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProPlanPromotionProps {
  subscriptionData: any;
}

const ProPlanPromotion = ({ subscriptionData }: ProPlanPromotionProps) => {
  // Only show for free plan users
  const isFreeplan = subscriptionData?.subscription?.plan_name?.toLowerCase() === "free";
  
  if (!isFreeplan) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-background backdrop-blur-sm overflow-hidden relative group hover:shadow-lg transition-all duration-300">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-500" />
      
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-sm">Upgrade to Pro</h3>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Unlock unlimited streaming hours and destinations for uninterrupted broadcasting
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Unlimited</span> streaming hours
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Radio className="h-3.5 w-3.5 text-primary/70" />
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Unlimited</span> destinations
                </span>
              </div>
            </div>
          </div>

          <Button 
            size="sm" 
            asChild 
            className="shrink-0 h-8 text-xs bg-primary/90 hover:bg-primary shadow-sm"
          >
            <Link to="/dashboard/subscription">
              Learn More
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProPlanPromotion;
