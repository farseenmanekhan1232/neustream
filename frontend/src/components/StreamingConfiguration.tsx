import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiService } from "../services/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ChatConnectorSetup from "./ChatConnectorSetup";

// --- Components ---

function SourceList({ sources, selectedId, onSelect, onAdd }: any) {
  return (
    <div className="w-full md:w-80 border-r border-border/40 bg-card/30 flex flex-col h-[calc(100vh]">
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
    <div className="flex-1 flex flex-col h-[calc(100vh)] overflow-hidden">
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
                  <Input readOnly value="rtmp://live.neustream.com/app" className="font-mono bg-muted/30" />
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard("rtmp://live.neustream.com/app")}>
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
  const [isAddOpen, setIsAddOpen] = useState(false);

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
      await apiService.delete(`/destinations/${destId}`);
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
    switch (type?.toLowerCase()) {
      case "youtube": return <Youtube className="h-5 w-5 text-red-500" />;
      case "twitch": return <Twitch className="h-5 w-5 text-purple-500" />;
      case "facebook": return <Facebook className="h-5 w-5 text-blue-500" />;
      default: return <Globe className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4">
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
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");

  // Platform-specific RTMP URLs
  const PLATFORM_RTMP_URLS: Record<string, string> = {
    youtube: "rtmp://a.rtmp.youtube.com/live2",
    twitch: "rtmp://live.twitch.tv/app",
    facebook: "rtmp://live-api-s.facebook.com:80/rtmp/",
    custom: "",
  };

  // Auto-fill RTMP URL when platform changes
  React.useEffect(() => {
    setUrl(PLATFORM_RTMP_URLS[platform] || "");
  }, [platform]);

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
      setUrl("");
      setKey("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add destination");
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Destination</DialogTitle>
          <DialogDescription>
            Stream to multiple platforms simultaneously.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitch">Twitch</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="custom">Custom RTMP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>RTMP URL</Label>
            <Input 
              placeholder="rtmp://live.twitch.tv/app" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              autoComplete="off"
            />
            <p className="text-xs text-muted-foreground">
              The RTMP server URL for your streaming platform
            </p>
          </div>
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] overflow-hidden bg-background">
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
