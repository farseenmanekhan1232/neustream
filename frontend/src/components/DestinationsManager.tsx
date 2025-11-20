import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Radio,
  Youtube,
  Twitch,
  Facebook,
  Copy,
  Check,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Loader2,
  MonitorSpeaker,
  Settings,
  ChevronDown,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DestinationsSkeleton } from "@/components/LoadingSkeletons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";
import { usePostHog } from "../hooks/usePostHog";
import { apiService } from "../services/api";
import { Link, useSearchParams } from "react-router-dom";

// Platform configuration
interface PlatformConfigItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  rtmpUrl: string;
  description: string;
  helpUrl: string | null;
}

const platformConfig: Record<string, PlatformConfigItem> = {
  // Global Major
  youtube: {
    id: "youtube",
    name: "YouTube Live",
    category: "Global Major",
    icon: Youtube,
    color: "bg-red-600",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    description: "Global video sharing giant",
    helpUrl: "https://support.google.com/youtube/answer/2907883",
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    category: "Global Major",
    icon: Twitch,
    color: "bg-purple-600",
    rtmpUrl: "rtmp://live.twitch.tv/app",
    description: "Leading live streaming platform",
    helpUrl: "https://help.twitch.tv/s/article/broadcast-guidelines",
  },
  facebook: {
    id: "facebook",
    name: "Facebook Live",
    category: "Global Major",
    icon: Facebook,
    color: "bg-blue-600",
    rtmpUrl: "rtmp://live-api-s.facebook.com:80/rtmp/",
    description: "Social media streaming",
    helpUrl: "https://www.facebook.com/business/help/1968268143233387",
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn Live",
    category: "Global Major",
    icon: Globe, // Fallback
    color: "bg-blue-700",
    rtmpUrl: "rtmps://live-api.linkedin.com:443/rtmp/",
    description: "Professional network streaming",
    helpUrl: "https://www.linkedin.com/help/linkedin/answer/a564446",
  },
  twitter: {
    id: "twitter",
    name: "X (Twitter)",
    category: "Global Major",
    icon: Globe, // Fallback
    color: "bg-black",
    rtmpUrl: "rtmps://va.pscp.tv:443/x/",
    description: "Real-time conversations",
    helpUrl: "https://help.twitter.com/en/using-twitter/twitter-live",
  },
  instagram: {
    id: "instagram",
    name: "Instagram Live",
    category: "Global Major",
    icon: Globe, // Fallback
    color: "bg-gradient-to-tr from-yellow-400 to-purple-600",
    rtmpUrl: "rtmps://live-upload.instagram.com:443/rtmp/",
    description: "Visual storytelling",
    helpUrl: "https://help.instagram.com/1696695837282384",
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok Live",
    category: "Global Major",
    icon: Globe, // Fallback
    color: "bg-black",
    rtmpUrl: "rtmp://push-rtmp-l11-us01.tiktokcdn.com/game/",
    description: "Short-form video platform",
    helpUrl: "https://www.tiktok.com/creators/creator-portal/en-us/live-on-tiktok/going-live/",
  },

  // Alternative & Gaming
  kick: {
    id: "kick",
    name: "Kick",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-green-500",
    rtmpUrl: "rtmps://fa723fc1b171.global-contribute.live-video.net/app/",
    description: "Creator-friendly streaming",
    helpUrl: "https://help.kick.com/",
  },
  rumble: {
    id: "rumble",
    name: "Rumble",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-green-600",
    rtmpUrl: "rtmp://live.rumble.com/live/",
    description: "Video platform alternative",
    helpUrl: "https://rumblefaq.groovehq.com/help",
  },
  dlive: {
    id: "dlive",
    name: "DLive",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-yellow-500",
    rtmpUrl: "rtmp://stream.dlive.tv/live/",
    description: "Blockchain-based streaming",
    helpUrl: "https://help.dlive.tv/",
  },
  trovo: {
    id: "trovo",
    name: "Trovo",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-green-500",
    rtmpUrl: "rtmp://live.trovo.live/live/",
    description: "Gaming community platform",
    helpUrl: "https://trovo.live/support",
  },
  caffeine: {
    id: "caffeine",
    name: "Caffeine",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-blue-400",
    rtmpUrl: "rtmp://ingest.caffeine.tv/app/",
    description: "Social broadcasting",
    helpUrl: "https://www.caffeine.tv/help",
  },
  nimotv: {
    id: "nimotv",
    name: "Nimo TV",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-purple-500",
    rtmpUrl: "rtmp://tx.direct.huya.com/huyalive/",
    description: "Global game streaming",
    helpUrl: "https://www.nimo.tv/",
  },
  steam: {
    id: "steam",
    name: "Steam",
    category: "Alternative & Gaming",
    icon: Globe,
    color: "bg-blue-900",
    rtmpUrl: "rtmp://upload.broadcast.steampowered.com/app/",
    description: "PC gaming platform",
    helpUrl: "https://steamcommunity.com/updates/broadcasting",
  },

  // Professional
  vimeo: {
    id: "vimeo",
    name: "Vimeo",
    category: "Professional",
    icon: Globe,
    color: "bg-blue-400",
    rtmpUrl: "rtmps://rtmp-global.cloud.vimeo.com/live",
    description: "High-quality video hosting",
    helpUrl: "https://vimeo.com/help",
  },
  dailymotion: {
    id: "dailymotion",
    name: "Dailymotion",
    category: "Professional",
    icon: Globe,
    color: "bg-gray-900",
    rtmpUrl: "rtmp://publish.dailymotion.com/publish-dm/",
    description: "Video technology platform",
    helpUrl: "https://faq.dailymotion.com/",
  },
  ibm: {
    id: "ibm",
    name: "IBM Video",
    category: "Professional",
    icon: Globe,
    color: "bg-blue-700",
    rtmpUrl: "rtmp://ws-ingest.video.ibm.com/live/",
    description: "Enterprise video streaming",
    helpUrl: "https://video.ibm.com/",
  },
  wowza: {
    id: "wowza",
    name: "Wowza",
    category: "Professional",
    icon: Globe,
    color: "bg-orange-600",
    rtmpUrl: "rtmp://entry.cloud.wowza.com/app-",
    description: "Cloud streaming services",
    helpUrl: "https://www.wowza.com/docs",
  },

  // Asian Platforms
  bilibili: {
    id: "bilibili",
    name: "Bilibili",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-pink-400",
    rtmpUrl: "rtmp://live-push.bilivideo.com/live-bvc/",
    description: "Chinese video sharing",
    helpUrl: "https://link.bilibili.com/p/center/index",
  },
  douyu: {
    id: "douyu",
    name: "Douyu",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-orange-500",
    rtmpUrl: "rtmp://sendtc3.douyu.com/live/",
    description: "Chinese live streaming",
    helpUrl: "https://www.douyu.com/",
  },
  huya: {
    id: "huya",
    name: "Huya",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-orange-400",
    rtmpUrl: "rtmp://tx.direct.huya.com/huyalive/",
    description: "Chinese game streaming",
    helpUrl: "https://www.huya.com/",
  },
  afreecatv: {
    id: "afreecatv",
    name: "AfreecaTV",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-blue-500",
    rtmpUrl: "rtmp://rtmp.afreecatv.com/app/",
    description: "South Korean streaming",
    helpUrl: "https://www.afreecatv.com/",
  },
  niconico: {
    id: "niconico",
    name: "NicoNico",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-gray-800",
    rtmpUrl: "rtmp://nl-nishitokyo.live.nicovideo.jp/live/",
    description: "Japanese video service",
    helpUrl: "https://www.nicovideo.jp/",
  },
  openrec: {
    id: "openrec",
    name: "Openrec.tv",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-red-500",
    rtmpUrl: "rtmp://auth.openrec.tv/live/",
    description: "Japanese gaming platform",
    helpUrl: "https://www.openrec.tv/",
  },
  bigo: {
    id: "bigo",
    name: "Bigo Live",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-blue-400",
    rtmpUrl: "rtmp://live-push.bigo.tv/live/",
    description: "Singaporean streaming app",
    helpUrl: "https://www.bigo.tv/",
  },
  nonolive: {
    id: "nonolive",
    name: "Nonolive",
    category: "Asian Platforms",
    icon: Globe,
    color: "bg-purple-500",
    rtmpUrl: "rtmp://publish.nonolive.com/live/",
    description: "Global game live streaming",
    helpUrl: "https://www.nonolive.com/",
  },

  // Regional
  vk: {
    id: "vk",
    name: "VK Live",
    category: "Regional",
    icon: Globe,
    color: "bg-blue-600",
    rtmpUrl: "rtmp://ovsu.mycdn.me/input/",
    description: "Russian social network",
    helpUrl: "https://vk.com/",
  },
  okru: {
    id: "okru",
    name: "OK.ru",
    category: "Regional",
    icon: Globe,
    color: "bg-orange-500",
    rtmpUrl: "rtmp://ovsu.mycdn.me/input/",
    description: "Russian social network",
    helpUrl: "https://ok.ru/",
  },
  vaughn: {
    id: "vaughn",
    name: "Vaughn Live",
    category: "Regional",
    icon: Globe,
    color: "bg-blue-800",
    rtmpUrl: "rtmp://live.vaughn.live/live/",
    description: "Live streaming community",
    helpUrl: "https://vaughn.live/",
  },
  picarto: {
    id: "picarto",
    name: "Picarto",
    category: "Regional",
    icon: Globe,
    color: "bg-green-600",
    rtmpUrl: "rtmp://live.picarto.tv/golive/",
    description: "Art streaming platform",
    helpUrl: "https://picarto.tv/",
  },
  mobcrush: {
    id: "mobcrush",
    name: "Mobcrush",
    category: "Regional",
    icon: Globe,
    color: "bg-yellow-400",
    rtmpUrl: "rtmp://live.mobcrush.com/stream/",
    description: "Mobile game streaming",
    helpUrl: "https://www.mobcrush.com/",
  },

  // Custom
  custom: {
    id: "custom",
    name: "Custom RTMP",
    category: "Custom",
    icon: Radio,
    color: "bg-gray-500",
    rtmpUrl: "",
    description: "Custom RTMP Server",
    helpUrl: null,
  },
};

const getPlatformConfig = (platform: string): PlatformConfigItem => {
  return platformConfig[platform] || platformConfig['custom']!;
};

function DestinationsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [selectedSourceId, setSelectedSourceId] = useState(null);
  const [newDestination, setNewDestination] = useState({
    platform: "youtube",
    rtmpUrl: getPlatformConfig('youtube').rtmpUrl,
    streamKey: "",
  });
  const [searchParams] = useSearchParams();
  const { trackUIInteraction, trackDestinationEvent } = usePostHog();

  // Get source ID from URL params if provided
  const urlSourceId = searchParams.get("source");

  // Fetch stream sources
  const { data: sourcesData, isLoading: sourcesLoading } = useQuery({
    queryKey: ["streamSources", user?.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
  });

  // Fetch destinations for selected source
  const { data: sourceDestinationsData, isLoading: sourceDestinationsLoading } =
    useQuery({
      queryKey: ["sourceDestinations", selectedSourceId],
      queryFn: async () => {
        if (!selectedSourceId) return { destinations: [] };
        const response = await apiService.get(`/sources/${selectedSourceId}`);
        return response;
      },
      enabled: !!user && !!selectedSourceId,
    });

  const sources = sourcesData?.sources || [];
  const sourceDestinations = sourceDestinationsData?.destinations || [];

  // Auto-select first source if available and no source is selected
  useEffect(() => {
    if (sources.length > 0 && !selectedSourceId && !urlSourceId) {
      setSelectedSourceId(sources[0].id);
    } else if (urlSourceId) {
      setSelectedSourceId(urlSourceId);
    }
  }, [sources, selectedSourceId, urlSourceId]);

  const destinations = sourceDestinations;
  const currentSource = sources.find((s) => s.id === selectedSourceId);
  const isUsingSources = sources.length > 0;



  // Group platforms by category
  const groupedPlatforms = useMemo(() => {
    return Object.entries(platformConfig).reduce((acc, [key, config]) => {
      const category = config.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push({ key, ...config });
      return acc;
    }, {} as Record<string, any[]>);
  }, []);

  // Add destination mutation
  const addDestinationMutation = useMutation({
    mutationFn: async (destination) => {
      if (!selectedSourceId) {
        throw new Error("Please select a source first");
      }

      // Add destination to specific source
      const response = await apiService.post(
        `/sources/${selectedSourceId}/destinations`,
        destination,
      );

      return response;
    },
    onSuccess: (data) => {
      // Track destination addition
      trackDestinationEvent(data.destination.id, "destination_added", {
        platform: newDestination.platform,
        rtmp_url: newDestination.rtmpUrl,
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });
      setNewDestination({
        platform: "youtube",
        rtmpUrl: getPlatformConfig('youtube').rtmpUrl,
        streamKey: "",
      });
      setShowAddForm(false);

      // Invalidate queries
      queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);

      toast.success("Destination added successfully!");
    },
    onError: (error) => {
      // Track destination addition failure
      trackDestinationEvent(null, "destination_add_failed", {
        platform: newDestination.platform,
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(error.message);
    },
  });

  // Delete destination mutation
  const deleteDestinationMutation = useMutation({
    mutationFn: async (id) => {
      if (!selectedSourceId) {
        throw new Error("Please select a source first");
      }

      // Delete destination from specific source
      const response = await apiService.delete(
        `/sources/${selectedSourceId}/destinations/${id}`,
      );

      return response;
    },
    onSuccess: (_, id) => {
      // Track destination removal
      trackDestinationEvent(id, "destination_removed", {
        source_id: selectedSourceId,
        source_name: currentSource?.name,
      });

      // Invalidate queries
      queryClient.invalidateQueries(["sourceDestinations", selectedSourceId]);

      toast.success("Destination removed successfully!");
    },
    onError: (error, id) => {
      // Track destination removal failure
      trackDestinationEvent(id, "destination_remove_failed", {
        error: error.message,
        source_id: selectedSourceId,
      });
      toast.error(error.message);
    },
  });

  // Copy to clipboard function
  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard!`);
      // Track copy actions
      trackUIInteraction(
        `copy_${field.toLowerCase().replace(/\s+/g, "_")}`,
        "click",
        {
          field_type: field,
          content_length: text.length,
        },
      );
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Handle platform selection change
  const handlePlatformChange = (platform: string) => {
    const config = getPlatformConfig(platform);
    setNewDestination({
      ...newDestination,
      platform,
      rtmpUrl: config.rtmpUrl,
    });
    // Track platform selection
    trackUIInteraction("platform_selection", "change", {
      selected_platform: platform,
    });
  };

  const handleAddDestination = (e) => {
    e.preventDefault();
    // Track form submission
    trackUIInteraction("add_destination_form", "submit", {
      platform: newDestination.platform,
    });
    addDestinationMutation.mutate(newDestination);
  };

  // Early return if user is not available (after all hooks are called)
  if (!user) {
    return <DestinationsSkeleton />;
  }

  const isLoading = sourcesLoading || sourceDestinationsLoading;

  if (isLoading) {
    return <DestinationsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-normal">Streaming Destinations</div>
          <p className="text-muted-foreground">
            Manage destinations for {currentSource?.name || "selected source"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Source Selection */}
          {isUsingSources && (
            <Select
              value={selectedSourceId || ""}
              onValueChange={setSelectedSourceId}
            >
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  <MonitorSpeaker className="h-4 w-4" />
                  <SelectValue placeholder="Select source" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {sources.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    <div className="flex items-center gap-2">
                      <MonitorSpeaker className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {source.destinations_count} destination
                          {source.destinations_count !== 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Add Destination Button */}
          {destinations.length > 0 && !showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Destination
            </Button>
          )}
        </div>
      </div>

      {/* Source Info Card */}
      {isUsingSources && currentSource && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <MonitorSpeaker className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{currentSource.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {currentSource.description || "No description"}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">
                    {currentSource.destinations_count} destination
                    {currentSource.destinations_count !== 1 ? "s" : ""}
                  </span>
                  <span className="text-muted-foreground">
                    Created{" "}
                    {new Date(currentSource.created_at).toLocaleDateString()}
                  </span>
                  {currentSource.is_active && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Destination Form */}
      {showAddForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Add New Destination</CardTitle>
            <CardDescription>
              Connect a new streaming platform to broadcast your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDestination} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Platform Selection */}
                <div className="space-y-4">
                  <Label>Select Platform</Label>
                  <Select
                    value={newDestination.platform}
                    onValueChange={handlePlatformChange}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(groupedPlatforms).map(([category, platforms]: [string, any[]]) => (
                        <SelectGroup key={category}>
                          <SelectLabel className="sticky top-0 bg-popover z-10 px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                            {category}
                          </SelectLabel>
                          {platforms.map((platform: any) => {
                            const Icon = platform.icon;
                            return (
                              <SelectItem key={platform.key} value={platform.key}>
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded ${platform.color} text-white`}>
                                    <Icon className="h-3 w-3" />
                                  </div>
                                  <span>{platform.name}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <Label>Configuration</Label>

                  {/* RTMP URL */}
                  <div className="space-y-2">
                    <Label htmlFor="rtmpUrl" className="text-sm">
                      RTMP URL
                    </Label>
                    <div className="relative">
                      <Input
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
                        className="font-mono text-sm pr-10"
                        disabled={newDestination.platform !== "custom"}
                      />
                      {newDestination.rtmpUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(newDestination.rtmpUrl, "RTMP URL")
                          }
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    {newDestination.platform !== "custom" && (
                      <p className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full inline-block">
                        Auto-filled for{" "}
                        {getPlatformConfig(newDestination.platform).name}
                      </p>
                    )}
                  </div>

                  {/* Stream Key */}
                  <div className="space-y-2">
                    <Label htmlFor="streamKey" className="text-sm">
                      Stream Key
                    </Label>
                    <Input
                      id="streamKey"
                      type="text"
                      value={newDestination.streamKey}
                      onChange={(e) =>
                        setNewDestination({
                          ...newDestination,
                          streamKey: e.target.value,
                        })
                      }
                      placeholder="Paste your stream key here"
                      required
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Get this from your{" "}
                      {getPlatformConfig(newDestination.platform).name} streaming
                      dashboard
                      {getPlatformConfig(newDestination.platform).helpUrl && (
                        <a
                          href={getPlatformConfig(newDestination.platform).helpUrl!}
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
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    addDestinationMutation.isPending ||
                    !newDestination.streamKey
                  }
                >
                  {addDestinationMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Destination"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Destinations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {destinations.map((destination) => {
          const config = getPlatformConfig(destination.platform);
          const Icon = config.icon;

          return (
            <Card
              key={destination.id}
              className="group hover:border-primary/50 transition-colors"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${config.color} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <CardDescription>{config.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={destination.is_active ? "default" : "secondary"}
                >
                  {destination.is_active ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </>
                  )}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    RTMP URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-muted rounded-md font-mono text-xs border truncate">
                      {destination.rtmp_url}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        copyToClipboard(
                          destination.rtmp_url,
                          `${config.name} RTMP URL`,
                        )
                      }
                      className="h-8 w-8"
                    >
                      {copiedField === `${config.name} RTMP URL` ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteDestinationMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Destination</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove the {config.name}{" "}
                          destination? This action cannot be undone. You will
                          need to re-add the destination with your stream key if
                          you want to use it again.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            deleteDestinationMutation.mutate(destination.id)
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remove Destination
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {config.helpUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={config.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Help
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {destinations.length === 0 && !showAddForm && (
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isUsingSources
                ? `No destinations for ${currentSource?.name || "this source"}`
                : "No destinations configured"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {isUsingSources
                ? `Add streaming platforms to ${currentSource?.name || "this source"} to start broadcasting to multiple destinations.`
                : "Add your first streaming platform to start broadcasting to multiple destinations simultaneously."}
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {isUsingSources
                ? `Add Destination to ${currentSource?.name || "Source"}`
                : "Add Your First Destination"}
            </Button>
            {!isUsingSources && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Or create stream sources for better organization:</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link to="/dashboard/sources">
                    <MonitorSpeaker className="h-4 w-4 mr-2" />
                    Create Stream Sources
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DestinationsManager;
