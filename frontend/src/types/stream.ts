// Streaming-related types

export interface Stream {
  id: string;
  name: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt?: string;
  activeStream?: ActiveStream;
  destinations_count?: number;
}

export interface ActiveStream {
  id: string;
  streamId: string;
  started_at: string;
  ended_at?: string;
  duration?: number;
  status: "starting" | "live" | "ending" | "ended";
  rtmpUrl?: string;
  streamKey?: string;
}

export interface StreamSource {
  id: string;
  name: string;
  platform: string;
  is_active: boolean;
  destinations_count?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface StreamDestination {
  id: string;
  name: string;
  platform: "youtube" | "twitch" | "facebook" | "custom";
  config: Record<string, unknown>;
  isActive: boolean;
  sourceId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StreamConfiguration {
  id: string;
  name: string;
  sources: StreamSource[];
  destinations: StreamDestination[];
  settings: StreamSettings;
}

export interface StreamSettings {
  bitrate?: number;
  resolution?: string;
  fps?: number;
  audioBitrate?: number;
  bufferSize?: number;
}

export interface StreamInfo {
  isActive: boolean;
  activeStream?: ActiveStream;
  streamKey?: string;
  rtmpUrl?: string;
}

export interface ChatMessage {
  id: string;
  sourceId: string;
  platform: string;
  username: string;
  message: string;
  timestamp: string;
  badges?: Record<string, unknown>;
  emotes?: Record<string, unknown>;
}

export interface PublicChatPage {
  sourceId: string;
  streamName: string;
  messages: ChatMessage[];
  isLive: boolean;
}
