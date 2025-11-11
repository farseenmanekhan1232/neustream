import React from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Copy, ExternalLink } from "lucide-react";

interface PlatformConfig {
  [key: string]: {
    name: string;
    logo?: string;
    description?: string;
    rtmpUrlTemplate?: string;
  };
}

interface DestinationConfigProps {
  platform: string;
  rtmpUrl: string;
  streamKey: string;
  onRtmpUrlChange: (value: string) => void;
  onStreamKeyChange: (value: string) => void;
  onCopy: (text: string, field: string) => void;
  platformConfig: PlatformConfig;
  copiedField: string | null;
}

function DestinationConfig({
  platform,
  rtmpUrl,
  streamKey,
  onRtmpUrlChange,
  onStreamKeyChange,
  onCopy,
  platformConfig,
  copiedField,
}: DestinationConfigProps) {
  const config = platformConfig[platform];

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Configuration</div>

      {/* RTMP URL */}
      <div className="space-y-2">
        <Label htmlFor="rtmp-url" className="text-sm">
          RTMP URL
        </Label>
        <div className="relative">
          <Input
            id="rtmp-url"
            type="text"
            value={rtmpUrl}
            onChange={(e) => onRtmpUrlChange(e.target.value)}
            placeholder="rtmp://..."
            required
            className="font-mono text-sm pr-10"
            disabled={platform !== "custom"}
          />
          {rtmpUrl && (
            <button
              type="button"
              onClick={() => onCopy(rtmpUrl, "RTMP URL")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
        </div>
        {platform !== "custom" && (
          <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
            Auto-filled for {config.name}
          </p>
        )}
      </div>

      {/* Stream Key */}
      <div className="space-y-2">
        <Label htmlFor="stream-key" className="text-sm">
          Stream Key
        </Label>
        <Input
          id="stream-key"
          type="text"
          value={streamKey}
          onChange={(e) => onStreamKeyChange(e.target.value)}
          placeholder="Paste your stream key here"
          required
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Get this from your {config.name} streaming dashboard
          {config.helpUrl && (
            <a
              href={config.helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              <ExternalLink className="h-3 w-3 inline mr-1" />
              Learn how
            </a>
          )}
        </p>
      </div>
    </div>
  );
}

export default DestinationConfig;
