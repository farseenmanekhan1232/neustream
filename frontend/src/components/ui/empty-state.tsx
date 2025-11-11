import { ReactNode } from "react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  MonitorSpeaker,
  Radio,
  Video,
  MessageSquare,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";

interface EmptyStateProps {
  icon?: "stream" | "platform" | "source" | "chat" | "analytics" | "settings";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  className?: string;
  children?: ReactNode;
}

const iconMap = {
  stream: MonitorSpeaker,
  platform: Radio,
  source: Video,
  chat: MessageSquare,
  analytics: BarChart3,
  settings: Settings,
};

export function EmptyState({
  icon = "stream",
  title,
  description,
  actionLabel = "Get Started",
  actionHref,
  onAction,
  secondaryActionLabel,
  secondaryActionHref,
  onSecondaryAction,
  className,
  children,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  const hasPrimaryAction = actionLabel && (actionHref || onAction);
  const hasSecondaryAction = secondaryActionLabel && (secondaryActionHref || onSecondaryAction);

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16 px-6">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Plus className="h-4 w-4 text-primary" />
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-3 text-center">{title}</h3>
        <p className="text-muted-foreground text-center mb-8 max-w-md">
          {description}
        </p>

        {children}

        {(hasPrimaryAction || hasSecondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {hasPrimaryAction && (
              <Button
                size="lg"
                onClick={onAction}
                className="min-w-[160px]"
                asChild={!!actionHref}
              >
                {actionHref ? (
                  <a href={actionHref}>{actionLabel}</a>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {actionLabel}
                  </>
                )}
              </Button>
            )}
            {hasSecondaryAction && (
              <Button
                variant="outline"
                size="lg"
                onClick={onSecondaryAction}
                className="min-w-[160px]"
                asChild={!!secondaryActionHref}
              >
                {secondaryActionHref ? (
                  <a href={secondaryActionHref}>{secondaryActionLabel}</a>
                ) : (
                  secondaryActionLabel
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
