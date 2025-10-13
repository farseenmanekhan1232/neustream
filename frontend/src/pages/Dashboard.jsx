import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Copy,
  Check,
  Eye,
  EyeOff,
  Youtube,
  Twitch,
  Facebook,
  Radio,
  ExternalLink,
  Clock,
  Play,
  Settings,
  BarChart3,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import Header from "../components/Header";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../contexts/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// Platform icon mapping
const platformIcons = {
  youtube: Youtube,
  twitch: Twitch,
  facebook: Facebook,
  custom: Radio,
};

// Platform color mapping
const platformColors = {
  youtube: "bg-red-500",
  twitch: "bg-purple-500",
  facebook: "bg-blue-500",
  custom: "bg-gray-500",
};

// Platform RTMP URL mapping
const platformRtmpUrls = {
  youtube: "rtmp://a.rtmp.youtube.com/live2",
  twitch: "rtmp://live.twitch.tv/app",
  facebook: "rtmp://live-api-s.facebook.com:80/rtmp",
  custom: "",
};

// Platform descriptions
const platformDescriptions = {
  youtube: "YouTube Live Streaming",
  twitch: "Twitch Live Streaming",
  facebook: "Facebook Live Streaming",
  custom: "Custom RTMP Server",
};

function Dashboard() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [newDestination, setNewDestination] = useState({
    platform: "youtube",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    streamKey: "",
  });
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [streamDuration, setStreamDuration] = useState(0);

  // Fetch stream info with real-time polling
  const { data: streamInfo, isLoading: streamLoading } = useQuery({
    queryKey: ["streamInfo", user.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/streams/info?userId=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch stream info");
      return response.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch destinations
  const { data: destinationsData, isLoading: destinationsLoading } = useQuery({
    queryKey: ["destinations", user.id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE}/destinations?userId=${user.id}`
      );
      if (!response.ok) throw new Error("Failed to fetch destinations");
      return response.json();
    },
  });

  const destinations = destinationsData?.destinations || [];

  // Check if user is new (no destinations configured)
  const isNewUser = destinations.length === 0;

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Stream duration counter
  useEffect(() => {
    if (streamInfo?.isActive && streamInfo?.activeStream?.started_at) {
      const startTime = new Date(streamInfo.activeStream.started_at).getTime();

      const updateDuration = () => {
        const now = Date.now();
        const duration = Math.floor((now - startTime) / 1000);
        setStreamDuration(duration);
      };

      updateDuration();
      const interval = setInterval(updateDuration, 1000);

      return () => clearInterval(interval);
    } else {
      setStreamDuration(0);
    }
  }, [streamInfo?.isActive, streamInfo?.activeStream?.started_at]);

  // Format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async (destination) => {
      const response = await fetch(`${API_BASE}/destinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...destination,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add destination");
      }

      return response.json();
    },
    onSuccess: () => {
      setNewDestination({ platform: "youtube", rtmpUrl: "", streamKey: "" });
      queryClient.invalidateQueries(["destinations", user.id]);
      toast.success("Destination added successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id) => {
      const response = await fetch(`${API_BASE}/destinations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete destination");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["destinations", user.id]);
      toast.success("Destination removed successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Handle platform selection change
  const handlePlatformChange = (platform) => {
    const rtmpUrl = platformRtmpUrls[platform];
    setNewDestination({
      ...newDestination,
      platform,
      rtmpUrl: rtmpUrl || "",
    });
  };

  const handleAddDestination = (e) => {
    e.preventDefault();
    addDestinationMutation.mutate(newDestination);
  };

  const handleDeleteDestination = (id) => {
    deleteDestinationMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Toaster position="top-right" richColors closeButton />
      <main className="section-padding">
        <div className="container-custom space-y-8">
          {/* Welcome Section */}
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">
              {isNewUser ? (
                <>
                  Welcome to <span className="gradient-text">NeuStream</span>
                </>
              ) : (
                <>
                  Your <span className="gradient-text">Dashboard</span>
                </>
              )}
            </div>
            <p className="text-xl text-muted-foreground mb-4">
              {isNewUser
                ? "Let's get you streaming to multiple platforms"
                : "Manage your multi-platform streaming setup"}
            </p>
            {isNewUser && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <p className="text-sm text-primary-foreground">
                  <strong>First time here?</strong> Start by adding your
                  streaming platforms below.
                </p>
              </div>
            )}
            <button onClick={logout} className="btn btn-outline">
              Logout
            </button>
          </div>

          {/* Stream Information */}
          <div className="card">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Your Stream</h2>
                {streamInfo?.isActive && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duration: {formatDuration(streamDuration)}</span>
                  </div>
                )}
              </div>

              {streamLoading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                </div>
              ) : streamInfo ? (
                <div className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Stream Configuration
                      </h3>

                      {/* Stream Key */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Stream Key
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm border">
                            {showStreamKey
                              ? streamInfo.streamKey
                              : "•".repeat(32)}
                          </div>
                          <button
                            onClick={() => setShowStreamKey(!showStreamKey)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showStreamKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                streamInfo.streamKey,
                                "Stream Key"
                              )
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedField === "Stream Key" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* RTMP URL */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">RTMP URL</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 p-3 bg-muted rounded-md font-mono text-sm border">
                            {streamInfo.rtmpUrl}
                          </div>
                          <button
                            onClick={() =>
                              copyToClipboard(streamInfo.rtmpUrl, "RTMP URL")
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedField === "RTMP URL" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Stream Status</h3>
                      <div className="flex flex-col space-y-4">
                        <Badge
                          variant={
                            streamInfo.isActive ? "default" : "secondary"
                          }
                          className="text-lg px-4 py-2 w-fit"
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                streamInfo.isActive
                                  ? "bg-green-500 animate-pulse"
                                  : "bg-gray-500"
                              }`}
                            ></div>
                            <span>
                              {streamInfo.isActive ? "Live" : "Offline"}
                            </span>
                          </div>
                        </Badge>

                        {streamInfo.isActive && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              Your stream is currently live and broadcasting
                            </p>
                            <p>
                              Viewers can watch on your configured platforms
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No stream information available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Quick Actions</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {streamInfo && (
                  <>
                    <button
                      onClick={() =>
                        copyToClipboard(streamInfo.streamKey, "Stream Key")
                      }
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-blue-500 text-white">
                          <Copy className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Copy Stream Key</h3>
                          <p className="text-xs text-muted-foreground">
                            For OBS setup
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() =>
                        copyToClipboard(streamInfo.rtmpUrl, "RTMP URL")
                      }
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-green-500 text-white">
                          <Play className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">Copy RTMP URL</h3>
                          <p className="text-xs text-muted-foreground">
                            For streaming software
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      className="p-4 border rounded-lg hover:border-primary/50 transition-colors text-left group opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-purple-500 text-white">
                          <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">View Analytics</h3>
                          <p className="text-xs text-muted-foreground">
                            Coming soon
                          </p>
                        </div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="card">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Streaming Destinations</h2>

              {/* Add Destination Form */}
              <form onSubmit={handleAddDestination} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Platform Selection */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Select Platform</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose where you want to stream. RTMP URL will auto-fill
                        for standard platforms.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.keys(platformRtmpUrls).map((platform) => {
                        const PlatformIcon = platformIcons[platform];
                        const platformColor = platformColors[platform];
                        const isSelected = newDestination.platform === platform;

                        return (
                          <button
                            key={platform}
                            type="button"
                            onClick={() => handlePlatformChange(platform)}
                            className={`p-4 border rounded-lg text-left transition-all group ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                                : "border-border hover:border-primary/50 hover:bg-accent/50"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-lg ${platformColor} text-white group-hover:scale-105 transition-transform`}
                              >
                                <PlatformIcon className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium capitalize">
                                  {platform}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {platformDescriptions[platform]}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="mt-2 text-xs text-primary font-medium">
                                ✓ Selected
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Configuration Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configuration</h3>

                    {/* RTMP URL */}
                    <div className="form-group">
                      <div className="flex items-center justify-between">
                        <label htmlFor="rtmpUrl" className="form-label">
                          RTMP URL
                        </label>
                        {newDestination.platform !== "custom" && (
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            Auto-filled
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          id="rtmpUrl"
                          type="text"
                          value={newDestination.rtmpUrl}
                          onChange={(e) =>
                            setNewDestination({
                              ...newDestination,
                              rtmpUrl: e.target.value,
                            })
                          }
                          placeholder="rtmp://..."
                          required
                          className="form-input font-mono text-sm"
                        />
                        {newDestination.rtmpUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                newDestination.rtmpUrl,
                                "RTMP URL"
                              )
                            }
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {newDestination.platform !== "custom" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Standard{" "}
                          {platformDescriptions[newDestination.platform]} URL
                        </p>
                      )}
                    </div>

                    {/* Stream Key */}
                    <div className="form-group">
                      <label htmlFor="streamKey" className="form-label">
                        Stream Key
                      </label>
                      <input
                        id="streamKey"
                        type="text"
                        value={newDestination.streamKey}
                        onChange={(e) =>
                          setNewDestination({
                            ...newDestination,
                            streamKey: e.target.value,
                          })
                        }
                        placeholder="Your stream key from the platform"
                        required
                        className="form-input font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Get this from your {newDestination.platform} streaming
                        dashboard
                      </p>
                    </div>

                    {/* Add Button */}
                    <button
                      type="submit"
                      disabled={
                        addDestinationMutation.isPending ||
                        !newDestination.streamKey
                      }
                      className="btn btn-primary w-full"
                    >
                      {addDestinationMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        "Add Destination"
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Destination List */}
              <div className="space-y-4">
                {destinationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse w-24"></div>
                          <div className="h-3 bg-muted rounded animate-pulse w-48"></div>
                        </div>
                        <div className="h-8 bg-muted rounded animate-pulse w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : destinations.length > 0 ? (
                  destinations.map((destination) => {
                    const PlatformIcon =
                      platformIcons[destination.platform] || Radio;
                    const platformColor =
                      platformColors[destination.platform] || "bg-gray-500";

                    return (
                      <div
                        key={destination.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-2 rounded-lg ${platformColor} text-white`}
                          >
                            <PlatformIcon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium capitalize">
                                {destination.platform}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {destination.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground font-mono">
                              {destination.rtmp_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              copyToClipboard(
                                destination.rtmp_url,
                                `${destination.platform} RTMP URL`
                              )
                            }
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy RTMP URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDestination(destination.id)
                            }
                            disabled={deleteDestinationMutation.isPending}
                            className="btn btn-outline text-sm hover:bg-destructive hover:text-destructive-foreground"
                          >
                            {deleteDestinationMutation.isPending ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                <span>Removing</span>
                              </div>
                            ) : (
                              "Remove"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                    <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {isNewUser
                        ? "Ready to start streaming?"
                        : "No destinations added yet"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {isNewUser
                        ? "Add your first streaming platform to broadcast to multiple platforms simultaneously"
                        : "Add a streaming platform to start multi-streaming"}
                    </p>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <p>
                        🎯 <strong>Popular platforms:</strong> YouTube, Twitch,
                        Facebook
                      </p>
                      <p>
                        ⚡ <strong>Quick setup:</strong> Just paste your stream
                        key
                      </p>
                      <p>
                        🔄 <strong>Real-time:</strong> Stream to all platforms
                        at once
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="card">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Getting Started</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">OBS Studio Setup</h3>
                  <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                    <li>Open OBS Studio and go to Settings → Stream</li>
                    <li>Set Service to "Custom"</li>
                    <li>Copy and paste the RTMP URL from above</li>
                    <li>Copy and paste your Stream Key</li>
                    <li>Click "Apply" and "OK"</li>
                    <li>Start streaming from OBS</li>
                  </ol>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Multi-Streaming Tips</h3>
                  <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                    <li>Add all your streaming platforms as destinations</li>
                    <li>Each platform needs its own RTMP URL and Stream Key</li>
                    <li>
                      Monitor stream status in real-time on this dashboard
                    </li>
                    <li>Use the copy buttons for quick configuration</li>
                    <li>
                      Your stream will automatically forward to all active
                      destinations
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start space-x-3">
                  <ExternalLink className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-primary mb-1">
                      Need Help?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Check our documentation or contact support if you
                      encounter any issues setting up your stream.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
