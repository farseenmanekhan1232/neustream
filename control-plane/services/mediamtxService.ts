// Using global fetch (Node 18+)
type FetchFunction = typeof fetch;

interface MediaMTXPath {
  name: string;
  publisher?: {
    type: string;
    id: string;
    created: string;
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
  readers?: any[];
}

interface MediaMTXResponse {
  items: MediaMTXPath[];
}

/**
 * MediaMTX Service
 * Provides integration with MediaMTX API for stream control and monitoring
 */
class MediaMTXService {
  private apiUrl: string;

  constructor() {
    const host = process.env.MEDIA_SERVER_HOST || 'localhost';
    const port = process.env.MEDIA_SERVER_API_PORT || '9997';
    this.apiUrl = `http://${host}:${port}`;
  }

  /**
   * Get list of active paths/streams
   */
  async getActivePaths(): Promise<MediaMTXPath[]> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/paths/list`);
      const data: MediaMTXResponse = await response.json();

      // Filter to only active streams (with publisher, excluding hls/webrtc paths)
      return data.items.filter(path =>
        path.publisher &&
        !path.name.startsWith('hls/') &&
        !path.name.startsWith('webrtc/') &&
        !path.name.startsWith('rtmp/')
      );
    } catch (error) {
      console.error('Error fetching active paths:', error);
      throw new Error('Failed to fetch active streams from MediaMTX');
    }
  }

  /**
   * Get details for a specific path/stream
   */
  async getPathDetails(streamName: string): Promise<MediaMTXPath | null> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/paths/get?name=${encodeURIComponent(streamName)}`);
      const data: MediaMTXPath = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching path details for ${streamName}:`, error);
      return null;
    }
  }

  /**
   * Delete/Stop a stream path
   */
  async deletePath(streamName: string): Promise<boolean> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/paths/delete?name=${encodeURIComponent(streamName)}`, {
        method: 'DELETE'
      });

      return response.ok;
    } catch (error) {
      console.error(`Error deleting path ${streamName}:`, error);
      return false;
    }
  }

  /**
   * Kill a specific writer (publisher)
   */
  async killWriter(streamName: string): Promise<boolean> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/writer/kill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: streamName })
      });

      return response.ok;
    } catch (error) {
      console.error(`Error killing writer ${streamName}:`, error);
      return false;
    }
  }

  /**
   * Get stream metrics (bitrate, resolution, etc.)
   */
  async getStreamMetrics(streamName: string): Promise<any> {
    try {
      const path = await this.getPathDetails(streamName);

      if (!path || !path.publisher) {
        return null;
      }

      // Calculate bitrate (bytes received per second)
      // Note: MediaMTX doesn't provide instant bitrate, we track bytes received
      const bytesReceived = path.publisher.bytesReceived || 0;
      const packetsReceived = path.publisher.packetsReceived || 0;

      return {
        bytesReceived,
        packetsReceived,
        isActive: !!path.publisher,
        connectedAt: path.publisher.created,
      };
    } catch (error) {
      console.error(`Error getting stream metrics for ${streamName}:`, error);
      return null;
    }
  }

  /**
   * Check if MediaMTX API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/config/global/get`);
      return response.ok;
    } catch (error) {
      console.error('MediaMTX health check failed:', error);
      return false;
    }
  }

  /**
   * Get global configuration (for testing connection)
   */
  async getGlobalConfig(): Promise<any> {
    try {
      const response = await (global as any).fetch(`${this.apiUrl}/v3/config/global/get`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching global config:', error);
      throw new Error('Failed to fetch MediaMTX configuration');
    }
  }

  /**
   * Stop a stream (delete path + kill writer)
   */
  async stopStream(streamName: string): Promise<{ success: boolean; message: string }> {
    try {
      const pathDeleted = await this.deletePath(streamName);
      const writerKilled = await this.killWriter(streamName);

      if (pathDeleted || writerKilled) {
        return {
          success: true,
          message: `Stream ${streamName} stopped successfully`
        };
      } else {
        return {
          success: false,
          message: `Failed to stop stream ${streamName}`
        };
      }
    } catch (error) {
      console.error(`Error stopping stream ${streamName}:`, error);
      return {
        success: false,
        message: `Error stopping stream: ${error}`
      };
    }
  }
}

// Export singleton instance
export default new MediaMTXService();
