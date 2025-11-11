import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  MonitorSpeaker,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Users,
  Send,
  Smile,
  Settings,
  Crown,
  Share2,
  Maximize2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import StreamPreview from "./StreamPreview";
import LiveChat from "./LiveChat";
import OnboardingTour, { useOnboarding } from "./OnboardingTour";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";

function StreamPreviewPage() {
  const { user } = useAuth();
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const { trackUIInteraction } = usePostHog();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
    refetchInterval: 10000, // Refresh every 10 seconds for live status
  });

  const sources = sourcesData?.sources || [];
  const activeSources = sources.filter((source) => source.is_active);

  // Auto-select first active source if none selected
  const selectedSource = selectedSourceId
    ? activeSources.find((source) => source.id === selectedSourceId) ||
      activeSources[0]
    : activeSources[0];

  // Update selected source when active sources change
  useEffect(() => {
    if (activeSources.length > 0 && !selectedSourceId) {
      setSelectedSourceId(activeSources[0].id);
    } else if (activeSources.length === 0) {
      setSelectedSourceId(null);
    }
  }, [activeSources, selectedSourceId]);

  // Handle source switching
  const handleSourceSwitch = (sourceId) => {
    setSelectedSourceId(sourceId);
    const source = activeSources.find((s) => s.id === sourceId);
    if (source) {
      trackUIInteraction("switch_preview_source", "click", {
        source_id: sourceId,
        source_name: source.name,
        total_active_sources: activeSources.length,
        page: "stream_preview",
      });
    }
  };

  if (sourcesLoading) {
    return (
      <div className="w-full px-6 py-6 space-y-6  mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="aspect-video bg-muted rounded-lg mb-4"></div>
        </div>
      </div>
    );
  }

  // No active streams - Show encouraging message
  if (activeSources.length === 0) {
    // Positive psychology messages (rotate based on time for variety)
    const hour = new Date().getHours();
    const messages = [
      {
        title: "Your stage is set!",
        description:
          "Everything's ready to go. When you start streaming from your broadcasting software, you'll see the magic happen here!",
      },
      {
        title: "All systems ready! ",
        description:
          "Your stream is prepped and waiting. Time to create some amazing content!",
      },
      {
        title: "Ready to shine bright! ",
        description:
          "The digital stage is yours. Start streaming whenever you're ready to put on a show!",
      },
      {
        title: "The spotlight's on you! ",
        description:
          "Everything's configured and waiting. Your audience is eager to see what you'll create!",
      },
    ];

    const message = messages[hour % messages.length];

    return (
      <div className="w-full px-6 py-6 space-y-6  mx-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-normal">Stream Preview</div>
              <p className="text-muted-foreground">
                Monitor your live streams and engage with your audience
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/dashboard/streaming">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <EmptyState
            icon="stream"
            title={message.title}
            description={message.description}
            actionLabel="Configure Stream Sources"
            actionHref="/dashboard/streaming"
            secondaryActionLabel="Quick Start Guide"
            onSecondaryAction={() => {
              // TODO: Open tutorial video
              alert("Tutorial video coming soon!");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 mx-auto min-h-0 flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-3xl font-normal">Stream Preview</div>
          <p className="text-muted-foreground">
            Monitor your live streams and engage with your audience
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/streaming">
              <Settings className="h-4 w-4 mr-2" />
              Stream Settings
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Mini Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Streams</CardDescription>
            <CardTitle className="text-2xl">{activeSources.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {sources.length - activeSources.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Viewers</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Users className="h-5 w-5" />0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Real-time count</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Stream Quality</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MonitorSpeaker className="h-5 w-5" />
              1080p
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">60 fps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status</CardDescription>
            <CardTitle className="text-2xl">
              <Badge
                variant="outline"
                className="text-green-600 border-green-600"
              >
                <div className="w-2 h-2 rounded-full bg-green-600 mr-2 animate-pulse" />
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {selectedSource?.name || "No source selected"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Selector */}
      {activeSources.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Active Stream Sources</span>
              <Badge variant="outline">
                {activeSources.findIndex((s) => s.id === selectedSource.id) + 1}{" "}
                of {activeSources.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = activeSources.findIndex(
                    (s) => s.id === selectedSource.id,
                  );
                  const prevIndex =
                    currentIndex === 0
                      ? activeSources.length - 1
                      : currentIndex - 1;
                  handleSourceSwitch(activeSources[prevIndex].id);
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <MonitorSpeaker className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">{selectedSource.name}</span>
                  <Badge variant="default" className="bg-emerald-500">
                    LIVE
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSource.description || "Stream source"}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentIndex = activeSources.findIndex(
                    (s) => s.id === selectedSource.id,
                  );
                  const nextIndex = (currentIndex + 1) % activeSources.length;
                  handleSourceSwitch(activeSources[nextIndex].id);
                }}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Source dots indicator */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              {activeSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSourceSwitch(source.id)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    source.id === selectedSource.id
                      ? "bg-primary"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  title={source.name}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3 flex-1 min-h-0">
        {/* Stream Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MonitorSpeaker className="h-5 w-5 mr-2 text-primary" />
                  {selectedSource.name}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-emerald-500">
                    <div className="h-2 w-2 bg-white rounded-full animate-pulse mr-2"></div>
                    LIVE
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                High-quality preview of your live stream
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-4">
              <StreamPreview
                streamKey={selectedSource.stream_key}
                isActive={selectedSource.is_active}
              />

              {/* Stream Actions Bar */}
              <div className="flex items-center justify-between mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Users className="h-4 w-4 mr-2" />
                    Viewers: --
                  </Button>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <span>Stream Quality: Auto</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Chat Section */}
        <div className="lg:col-span-1 self-stretch h-full">
          {selectedSource && <LiveChat sourceId={selectedSource.id} />}
        </div>
      </div>

      {/* Additional Stream Sources */}
      {activeSources.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Active Streams</CardTitle>
            <CardDescription>
              Switch between different stream sources to monitor each one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {activeSources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSourceSwitch(source.id)}
                  className={`p-4 rounded-lg border transition-colors text-left ${
                    source.id === selectedSource.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-background border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <MonitorSpeaker className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium truncate">{source.name}</h4>
                        {source.id === selectedSource.id ? (
                          <Badge
                            variant="default"
                            className="text-xs bg-emerald-500"
                          >
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {source.description || "Stream source"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {source.destinations_count} destination
                        {source.destinations_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Onboarding Tour for first-time users */}
      <OnboardingTour
        isOpen={showOnboarding}
        onClose={() => {}}
        onComplete={completeOnboarding}
      />
    </div>
  );
}

export default StreamPreviewPage;
