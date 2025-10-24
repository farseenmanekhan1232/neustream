import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Radio, MonitorSpeaker, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QuickActions = memo(function QuickActions() {
  const actions = [
    {
      id: "destinations",
      title: "Manage Destinations",
      description: "Add or configure your streaming platforms like YouTube, Twitch, and Facebook.",
      icon: Radio,
      href: "/dashboard/streaming",
      color: "text-primary",
    },
    {
      id: "sources",
      title: "Stream Sources",
      description: "Manage multiple stream sources, each with their own destinations and settings.",
      icon: MonitorSpeaker,
      href: "/dashboard/streaming",
      color: "text-primary",
    },
    {
      id: "setup",
      title: "Stream Setup",
      description: "Get your RTMP URL and stream key for OBS Studio or other streaming software.",
      icon: Settings,
      href: "/dashboard/streaming",
      color: "text-primary",
    },
    {
      id: "analytics",
      title: "View Analytics",
      description: "Track your stream performance and viewer engagement across all platforms.",
      icon: BarChart3,
      href: "#",
      color: "text-primary",
      disabled: true,
      badge: "Coming Soon",
    },
  ];

  return (
    <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => (
        <ActionCard key={action.id} action={action} />
      ))}
    </div>
  );
});

const ActionCard = memo(function ActionCard({ action }) {
  const { id, title, description, icon: Icon, href, color, disabled, badge } = action;

  if (disabled) {
    return (
      <Card className="opacity-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <Icon className={`h-5 w-5 mr-2 ${color}`} />
              {title}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
          {badge && (
            <Badge variant="secondary" className="mt-2">
              {badge}
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Link to={href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center">
              <Icon className={`h-5 w-5 mr-2 ${color}`} />
              {title}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
});

export default QuickActions;