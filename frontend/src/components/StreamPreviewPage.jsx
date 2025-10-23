import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Play,
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
import { Separator } from "@/components/ui/separator";
import StreamPreview from "./StreamPreview";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";

function StreamPreviewPage() {
  const { user } = useAuth();
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const { trackUIInteraction } = usePostHog();

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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="aspect-video bg-muted rounded-lg mb-4"></div>
        </div>
      </div>
    );
  }

  // No active streams
  if (activeSources.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Stream Preview</h1>
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

        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MonitorSpeaker className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Active Streams</h3>
            <p className="text-muted-foreground mb-6">
              Start streaming from your broadcasting software to see the preview
              here.
            </p>
            <Button asChild>
              <Link to="/dashboard/streaming">
                <Settings className="h-4 w-4 mr-2" />
                Configure Stream Sources
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stream Preview</h1>
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
                    (s) => s.id === selectedSource.id
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
                  <MonitorSpeaker className="h-4 w-4 text-green-500" />
                  <span className="font-medium">{selectedSource.name}</span>
                  <Badge variant="default" className="bg-green-500">
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
                    (s) => s.id === selectedSource.id
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stream Preview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MonitorSpeaker className="h-5 w-5 mr-2 text-primary" />
                  {selectedSource.name}
                </span>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-green-500">
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
            <CardContent>
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
        <div className="lg:col-span-1">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2 text-primary" />
                  Live Chat
                </span>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>
                Engage with your audience in real-time
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* "Coming Soon" Overlay */}
                <div className="flex items-center justify-center h-full min-h-[400px]">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      Live Chat Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      We're working on a real-time chat system to help you
                      connect with your audience.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <Crown className="h-4 w-4 text-primary" />
                        <span>Real-time messaging</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span>User moderation tools</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <Smile className="h-4 w-4 text-primary" />
                        <span>Emojis & reactions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Input (Disabled) */}
              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message... (Coming soon)"
                    disabled
                    className="flex-1"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                  />
                  <Button disabled size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button disabled variant="ghost" size="icon">
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Chat features will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
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
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <MonitorSpeaker className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium truncate">{source.name}</h4>
                        {source.id === selectedSource.id ? (
                          <Badge
                            variant="default"
                            className="text-xs bg-green-500"
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
    </div>
  );
}

export default StreamPreviewPage;
