import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Settings,
  Trash2,
  Copy,
  RefreshCw,
  MoreVertical,
  Youtube,
  Twitch,
  Facebook,
  Globe,
  Check,
  AlertCircle,
  Video,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiService } from "../services/api";
import { subscriptionService } from "../services/subscription";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ChatConnectorSetup from "./ChatConnectorSetup";

// --- Platform Configuration ---

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

// --- Components ---

function SourceList({ sources, selectedId, onSelect, onAdd }: any) {
  return (
    <div className="w-full md:w-80 border-r border-border/40 bg-card/30 flex flex-col h-auto md:h-full shrink-0">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <h2 className="font-semibold">Sources</h2>
        <Button size="sm" variant="ghost" onClick={onAdd}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {sources.map((source: any) => (
            <button
              key={source.id}
              onClick={() => onSelect(source.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                selectedId === source.id
                  ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                  : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center shrink-0",
                selectedId === source.id ? "bg-primary/20" : "bg-muted"
              )}>
                <Video className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{source.name}</div>
                <div className="text-xs opacity-70 truncate">
                  {source.destinations_count} destinations
                </div>
              </div>
              {source.is_active && (
                <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
              )}
            </button>
          ))}
          {sources.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No sources found.
              <br />
              <Button variant="link" onClick={onAdd} className="mt-2">Create one to get started</Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function SourceDetails({ source, onUpdate, onDelete, onRegenerateKey }: any) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!source) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select a source to view details
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-auto md:h-full overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border/40 flex items-center justify-between bg-card/10">
        <div>
          <h2 className="text-2xl font-bold">{source.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your stream configuration and destinations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onUpdate(source)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(source.id)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 max-w-4xl">
          {/* Stream Key Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                RTMP
              </Badge>
              Stream Configuration
            </h3>
            <div className="grid gap-4 p-4 rounded-xl border border-border/40 bg-card/30">
              <div className="grid gap-2">
                <Label>RTMP URL</Label>
                <div className="flex gap-2">
                  <Input readOnly value="rtmp://stream.neustream.app/live" className="font-mono bg-muted/30" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("rtmp://stream.neustream.app/live")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Stream Key</Label>
                <div className="flex gap-2">
                  <Input readOnly value={source.stream_key} type="password" className="font-mono bg-muted/30" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(source.stream_key)}>
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onRegenerateKey(source.id)}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Keep this key secret. Anyone with this key can stream to your channel.
                </p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/40" />

          {/* Destinations Section */}
          <DestinationsList sourceId={source.id} />

          <Separator className="bg-border/40" />

          {/* Chat Connectors Section */}
          <ChatConnectorSetup sourceId={source.id} sourceName={source.name} />
        </div>
      </ScrollArea>
    </div>
  );
}

function DestinationsList({ sourceId }: { sourceId: string }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Fetch subscription data to check plan
  const { data: subscriptionData } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      return await subscriptionService.getMySubscription();
    },
    enabled: !!user,
  });

  const isFreeplan = subscriptionData?.subscription?.plan_name?.toLowerCase() === "free";

  const { data: destinations, isLoading, error } = useQuery({
    queryKey: ["destinations", sourceId],
    queryFn: async () => {
      const res = await apiService.get(`/sources/${sourceId}/destinations`);
      // Handle different possible response structures
      const destData = res?.destinations || res?.data?.destinations || res || [];
      return destData;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (destId: string) => {
      await apiService.delete(`/sources/${sourceId}/destinations/${destId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", sourceId] });
      toast.success("Destination removed");
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error?.message || "Failed to remove destination");
    }
  });

  const getPlatformIcon = (type: string) => {
    const config = getPlatformConfig(type?.toLowerCase() || 'custom');
    const Icon = config.icon;
    return <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />;
  };

  return (
    <div className="space-y-4 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Destinations</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Platforms where your stream will be broadcasted.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Destination
        </Button>
      </div>

      {/* Pro Plan Promotion Banner for Free Users */}
      {isFreeplan && (
        <div className="p-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">Pro Plan</Badge>
                Unlock Unlimited Destinations
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upgrade to Pro to stream to unlimited platforms simultaneously with unlimited hours per month
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0" asChild>
              <Link to="/dashboard/subscription">Upgrade</Link>
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Loading destinations...</div>
        ) : error ? (
          <div className="text-center py-8 border border-destructive/50 rounded-xl bg-destructive/10">
            <p className="text-destructive">Error loading destinations</p>
            <p className="text-xs text-muted-foreground mt-1">{(error as any)?.message || 'Unknown error'}</p>
          </div>
        ) : !destinations || destinations.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-border/50 rounded-xl bg-card/10">
            <p className="text-muted-foreground">No destinations configured.</p>
            <Button variant="link" onClick={() => setIsAddOpen(true)}>Add your first destination</Button>
          </div>
        ) : (
          Array.isArray(destinations) && destinations.map((dest: any) => {
            // API returns: platform, rtmp_url, stream_key, is_active
            const platform = dest.platform || dest.type || 'custom';
            const url = dest.rtmp_url || dest.stream_url || dest.url || 'N/A';
            const displayName = dest.name || `${platform.charAt(0).toUpperCase() + platform.slice(1)} Destination`;
            
            return (
              <div
                key={dest.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/30 hover:bg-card/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                    {getPlatformIcon(platform)}
                  </div>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {displayName}
                      <Badge variant="secondary" className="text-[10px] h-5 bg-muted/50">
                        {platform}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate max-w-[300px] flex items-center gap-1 mt-0.5">
                      <span className="opacity-70">Target:</span>
                      <code className="bg-muted/30 px-1 rounded">{url}</code>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Removed toggle as requested */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500" 
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMutation.mutate(dest.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Destination
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddDestinationDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        sourceId={sourceId}
      />
    </div>
  );
}

function AddDestinationDialog({ open, onOpenChange, sourceId }: any) {
  const queryClient = useQueryClient();
  const [platform, setPlatform] = useState("youtube");
  const [url, setUrl] = useState(getPlatformConfig("youtube").rtmpUrl);
  const [key, setKey] = useState("");

  // Group platforms by category
  const groupedPlatforms = useMemo(() => {
    return Object.entries(platformConfig).reduce((acc, [key, config]) => {
      const category = config.category || "Other";
      if (!acc[category]) acc[category] = [];
      acc[category].push({ key, ...config });
      return acc;
    }, {} as Record<string, any[]>);
  }, []);

  const handlePlatformChange = (newPlatform: string) => {
    setPlatform(newPlatform);
    const config = getPlatformConfig(newPlatform);
    setUrl(config.rtmpUrl);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!url || !key) throw new Error("URL and Stream Key are required");
      // Backend expects camelCase: rtmpUrl and streamKey (not rtmp_url and stream_key)
      await apiService.post(`/sources/${sourceId}/destinations`, {
        platform,
        rtmpUrl: url,  // Backend expects 'rtmpUrl' in camelCase
        streamKey: key, // Backend expects 'streamKey' in camelCase
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations", sourceId] });
      onOpenChange(false);
      toast.success("Destination added successfully");
      setUrl(getPlatformConfig("youtube").rtmpUrl);
      setKey("");
      setPlatform("youtube");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add destination");
    }
  });

  const currentConfig = getPlatformConfig(platform);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] ">
        <DialogHeader>
          <DialogTitle>Add Destination</DialogTitle>
          <DialogDescription>
            Stream to multiple platforms simultaneously.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* Platform Selection */}
          <div className="grid gap-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={handlePlatformChange}>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select a platform" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {Object.entries(groupedPlatforms).map(([category, platforms]) => (
                  <SelectGroup key={category}>
                    <SelectLabel className="sticky top-0 bg-popover z-10 px-2 py-1.5 text-sm font-semibold text-muted-foreground">
                      {category}
                    </SelectLabel>
                    {platforms.map((p: any) => {
                      const Icon = p.icon;
                      return (
                        <SelectItem key={p.key} value={p.key}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${p.color} text-white`}>
                              <Icon className="h-3 w-3" />
                            </div>
                            <span>{p.name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* RTMP URL */}
          <div className="grid gap-2">
            <Label>RTMP URL</Label>
            <Input 
              placeholder="rtmp://..." 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-muted-foreground">
                The RTMP server URL for your streaming platform
              </p>
              {currentConfig.helpUrl && (
                <a
                  href={currentConfig.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Setup Guide
                </a>
              )}
            </div>
          </div>

          {/* Stream Key */}
          <div className="grid gap-2">
            <Label>Stream Key</Label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={key} 
              onChange={(e) => setKey(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Your platform-specific stream key
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Adding..." : "Add Destination"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSourceDialog({ open, onOpenChange }: any) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Name is required");
      await apiService.post("/sources", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamSources"] });
      onOpenChange(false);
      toast.success("Source created");
      setName("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create source");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Source</DialogTitle>
          <DialogDescription>
            Create a new RTMP source to stream to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Source Name</Label>
            <Input placeholder="OBS Studio" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Create Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UpdateSourceDialog({ open, onOpenChange, source }: any) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(source?.name || "");

  // Update name when source changes
  if (source && name === "" && open) {
     // This is a bit hacky, better to use useEffect or key
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name) throw new Error("Name is required");
      await apiService.put(`/sources/${source.id}`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamSources"] });
      onOpenChange(false);
      toast.success("Source updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update source");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Source</DialogTitle>
          <DialogDescription>
            Rename your stream source.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Source Name</Label>
            <Input 
              placeholder="OBS Studio" 
              defaultValue={source?.name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update Source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Main Page Component ---

export default function StreamingConfiguration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);
  const [sourceToUpdate, setSourceToUpdate] = useState<any>(null);

  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ["streamSources", user?.id],
    queryFn: async () => {
      const response = await apiService.get("/sources");
      return response;
    },
    enabled: !!user,
  });

  const sources = sourcesData?.sources || [];

  // Auto-select first source
  if (!selectedSourceId && sources.length > 0) {
    setSelectedSourceId(sources[0].id);
  }

  const selectedSource = sources.find((s: any) => s.id === selectedSourceId);

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`/sources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamSources"] });
      toast.success("Source deleted");
      setSelectedSourceId(null);
    },
    onError: () => {
      toast.error("Failed to delete source");
    }
  });

  const regenerateKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiService.post(`/sources/${id}/regenerate-key`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streamSources"] });
      toast.success("Stream key regenerated");
    },
    onError: () => {
      toast.error("Failed to regenerate key");
    }
  });

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-y-auto md:overflow-hidden bg-background">
      <SourceList
        sources={sources}
        selectedId={selectedSourceId}
        onSelect={setSelectedSourceId}
        onAdd={() => setIsAddSourceOpen(true)}
      />
      <SourceDetails
        source={selectedSource}
        onUpdate={(source: any) => setSourceToUpdate(source)}
        onDelete={(id: string) => deleteSourceMutation.mutate(id)}
        onRegenerateKey={(id: string) => regenerateKeyMutation.mutate(id)}
      />
      <AddSourceDialog open={isAddSourceOpen} onOpenChange={setIsAddSourceOpen} />
      {sourceToUpdate && (
        <UpdateSourceDialog 
          open={!!sourceToUpdate} 
          onOpenChange={(open: boolean) => !open && setSourceToUpdate(null)} 
          source={sourceToUpdate} 
        />
      )}
    </div>
  );
}
