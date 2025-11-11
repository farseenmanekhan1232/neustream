import React, { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Copy, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface StreamConfigProps {
  streamKey: string;
  rtmpUrl?: string;
  onCopy?: (field: string, text: string) => void;
  showRegenerateButton?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
  canRegenerate?: boolean;
  size?: "default" | "compact";
}

function StreamConfig({
  streamKey,
  rtmpUrl = "rtmp://stream.neustream.app/live",
  onCopy,
  showRegenerateButton = false,
  onRegenerate,
  isRegenerating = false,
  canRegenerate = true,
  size = "default",
}: StreamConfigProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);

      if (onCopy) {
        onCopy(field, text);
      }

      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleRegenerate = () => {
    if (
      onRegenerate &&
      window.confirm(
        "Are you sure you want to regenerate the stream key? Your current stream key will stop working immediately.",
      )
    ) {
      onRegenerate();
    }
  };

  const isCompact = size === "compact";
  const inputClass = isCompact ? "text-xs" : "text-sm";
  const buttonSize = isCompact ? "sm" : "default";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className={`font-medium ${isCompact ? "text-sm" : ""}`}>
          Stream Configuration
        </Label>
        {showRegenerateButton && (
          <Button
            variant="outline"
            size={buttonSize}
            onClick={handleRegenerate}
            disabled={isRegenerating || !canRegenerate}
            className={isCompact ? "h-7 text-xs" : ""}
          >
            {isRegenerating ? "Regenerating..." : "Regenerate Key"}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {/* RTMP URL */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <span className={`font-medium ${inputClass}`}>RTMP URL:</span>
          <code className={`flex-1 ${inputClass} font-mono`}>{rtmpUrl}</code>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => copyToClipboard(rtmpUrl, "RTMP URL")}
            className={isCompact ? "h-7 px-2" : ""}
          >
            {copiedField === "RTMP URL" ? (
              <Check className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            ) : (
              <Copy className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            )}
          </Button>
        </div>

        {/* Stream Key */}
        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
          <span className={`font-medium ${inputClass}`}>Stream Key:</span>
          <code className={`flex-1 ${inputClass} font-mono`}>
            {showStreamKey ? streamKey : "•".repeat(24)}
          </code>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => setShowStreamKey(!showStreamKey)}
            className={isCompact ? "h-7 px-2" : ""}
          >
            {showStreamKey ? (
              <EyeOff className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            ) : (
              <Eye className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            )}
          </Button>
          <Button
            variant="ghost"
            size={buttonSize}
            onClick={() => copyToClipboard(streamKey, "Stream Key")}
            className={isCompact ? "h-7 px-2" : ""}
          >
            {copiedField === "Stream Key" ? (
              <Check className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            ) : (
              <Copy className={`h-4 w-4 ${isCompact ? "h-3 w-3" : ""}`} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default StreamConfig;
