import React from "react";

interface PlatformConfig {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PlatformSelectorProps {
  platforms?: unknown;
  selectedPlatform: string;
  onPlatformChange: (platform: string) => void;
  platformConfig: Record<string, PlatformConfig>;
}

export default function PlatformSelector({
  platforms,
  selectedPlatform,
  onPlatformChange,
  platformConfig,
}: PlatformSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Select Platform</div>
      <div className="grid lg:grid-cols-2 gap-3">
        {Object.entries(platformConfig).map(([key, config]) => {
          const Icon = config.icon;
          const isSelected = selectedPlatform === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onPlatformChange(key)}
              className={`relative p-4 border rounded-lg text-left transition-all group ${
                isSelected
                  ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-lg ${config.color} text-white group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">{config.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {config.description}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="absolute text-sm font-medium right-1 top-1 text-green-700">
                  ✓ Selected
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
