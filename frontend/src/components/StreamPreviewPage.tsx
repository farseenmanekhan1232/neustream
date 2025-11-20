import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Monitor,
  MessageSquare,
  Settings,
  Share2,
  Maximize2,
  Volume2,
  VolumeX,
  Radio,
  LayoutTemplate,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import StreamPreview from "./StreamPreview";
import LiveChat from "./LiveChat";
import OnboardingTour, { useOnboarding } from "./OnboardingTour";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function StreamPreviewPage() {
  const { user } = useAuth();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const { trackUIInteraction } = usePostHog();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user?.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const sources = sourcesData?.sources || [];
  const activeSources = sources.filter((source: any) => source.is_active);

  // Auto-select first active source
  useEffect(() => {
    if (activeSources.length > 0 && !selectedSourceId) {
      setSelectedSourceId(activeSources[0].id);
    } else if (activeSources.length === 0) {
      setSelectedSourceId(null);
    }
  }, [activeSources, selectedSourceId]);

  const selectedSource = activeSources.find((s: any) => s.id === selectedSourceId) || activeSources[0];

  const handleSourceSwitch = (sourceId: string) => {
    setSelectedSourceId(sourceId);
    trackUIInteraction("switch_preview_source", "click", { source_id: sourceId });
  };

  if (sourcesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Empty State
  if (activeSources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] p-6 text-center">
        <div className="w-full max-w-md space-y-8">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="relative flex items-center justify-center w-full h-full bg-primary/10 rounded-full border-2 border-primary/20">
              <Radio className="w-10 h-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Go Live?</h2>
            <p className="text-muted-foreground text-lg">
              Configure your streaming software to start broadcasting. Your preview will appear here automatically.
            </p>
          </div>

          <div className="grid gap-4">
            <Button size="lg" className="w-full gap-2 text-base" asChild>
              <Link to="/dashboard/streaming">
                <Settings className="w-5 h-5" />
                Get Stream Key
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full gap-2" asChild>
              <Link to="/help">
                <LayoutTemplate className="w-5 h-5" />
                View Setup Guide
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-black/95 relative">
      {/* Main Stage */}
      <div className="flex-1 flex flex-col relative min-w-0">
        
        {/* Top Control Bar */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-black/40 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
            
              <span className="font-medium text-white/90 truncate max-w-[200px]">
                {selectedSource?.name}
              </span>
            </div>
            
            <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />
            
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-white/50">
              {/* Stats will be implemented when backend API supports real-time metrics */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 text-white/70 hover:text-white hover:bg-white/10",
                isChatOpen && "bg-white/10 text-white"
              )}
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
          </div>
        </div>

        {/* Video Player Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden group">
          <div className="w-full h-full relative">
             <StreamPreview
                streamKey={selectedSource?.stream_key}
                isActive={selectedSource?.is_active}
              />
              

          </div>
        </div>

        {/* Bottom Source Selector (if multiple sources) */}
        {activeSources.length > 1 && (
          <div className="h-20 bg-black/40 backdrop-blur-md border-t border-white/10 flex items-center px-4 gap-4 overflow-x-auto">
            {activeSources.map((source: any) => (
              <button
                key={source.id}
                onClick={() => handleSourceSwitch(source.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg border transition-all min-w-[200px]",
                  selectedSourceId === source.id
                    ? "bg-primary/20 border-primary/50 text-white"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                )}
              >
                <div className="relative">
                  <Monitor className="w-8 h-8" />
                  {source.is_active && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-black" />
                  )}
                </div>
                <div className="text-left overflow-hidden">
                  <div className="font-medium truncate text-sm">{source.name}</div>
                  <div className="text-xs opacity-70 truncate">
                    {source.destinations_count} destinations
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      <AnimatePresence initial={false}>
        {isChatOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 360, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-l border-white/10 bg-card/95 backdrop-blur-xl relative flex flex-col z-20"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/40">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Live Chat
              </h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setIsChatOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
              {selectedSource && <LiveChat sourceId={selectedSource.id} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => {}}
        onComplete={completeOnboarding}
      />
    </div>
  );
}

export default StreamPreviewPage;
