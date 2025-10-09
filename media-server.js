const NodeMediaServer = require("node-media-server");
const axios = require("axios");
const { spawn } = require("child_process");

// Global FFmpeg process for all streams
let globalFFmpegProcess = null;
const activeStreams = new Map();
const streamDestinations = new Map();

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    mediaroot: "./media",
  },
};

const nms = new NodeMediaServer(config);

nms.on("preConnect", (id, args) => {
  console.log("[NodeMediaServer] Client connecting:", id, args);
});

nms.on("postConnect", (id, args) => {
  console.log("[NodeMediaServer] Client connected:", id, args);
});

nms.on("doneConnect", (id, args) => {
  console.log("[NodeMediaServer] Client disconnected:", id, args);
});

nms.on("prePublish", async (id, StreamPath, args) => {
  console.log("[NodeMediaServer] Stream publishing:", id, StreamPath, args);

  // Extract stream key from StreamPath (format: /live/streamKey)
  const streamKey = StreamPath.split("/").pop();

  try {
    // Authenticate stream with control plane
    const authResponse = await axios.post(
      "https://api.neustream.app/api/auth/stream",
      {
        name: streamKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (authResponse.status === 200) {
      console.log(`[NodeMediaServer] Stream authenticated: ${streamKey}`);

      // Get forwarding configuration for this stream
      const forwardingResponse = await axios.get(
        `https://api.neustream.app/api/streams/forwarding/${streamKey}`
      );
      const { destinations, pushConfig } = forwardingResponse.data;

      console.log(`[NodeMediaServer] Forwarding destinations:`, destinations);

      // Store forwarding configuration for this stream
      activeStreams.set(streamKey, {
        destinations,
        pushConfig,
        streamPath: StreamPath,
      });

      // Store destinations for this stream
      streamDestinations.set(streamKey, destinations);
      console.log(
        `[NodeMediaServer] Stored destinations for stream ${streamKey}:`,
        destinations
      );

      // Start or restart global FFmpeg process with all active streams
      restartGlobalFFmpeg();

      // Explicitly return true to allow the stream
      return true;
    } else {
      console.log(
        `[NodeMediaServer] Stream authentication failed: ${streamKey}`
      );
      return false; // Reject stream
    }
  } catch (error) {
    console.error(
      `[NodeMediaServer] Authentication error for ${streamKey}:`,
      error.message
    );
    return false; // Reject stream
  }
});

nms.on("donePublish", async (id, StreamPath, args) => {
  console.log(
    "[NodeMediaServer] Stream publishing ended:",
    id,
    StreamPath,
    args
  );

  const streamKey = StreamPath.split("/").pop();

  // Clean up forwarding configuration
  activeStreams.delete(streamKey);

  // Remove stream from destinations
  streamDestinations.delete(streamKey);

  // Restart global FFmpeg process with updated configuration
  restartGlobalFFmpeg();

  try {
    // Notify control plane that stream ended
    await axios.post(
      "https://api.neustream.app/api/auth/stream-end",
      {
        name: streamKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[NodeMediaServer] Stream end notified: ${streamKey}`);
  } catch (error) {
    console.error(
      `[NodeMediaServer] Stream end notification error:`,
      error.message
    );
  }
});

// Global FFmpeg process management
function restartGlobalFFmpeg() {
  // Kill existing FFmpeg process
  if (globalFFmpegProcess) {
    globalFFmpegProcess.kill("SIGTERM");
    console.log("[NodeMediaServer] Stopped previous global FFmpeg process");
  }

  // Build FFmpeg command for all active streams
  const ffmpegArgs = [];

  // If no active streams, don't start FFmpeg
  if (streamDestinations.size === 0) {
    console.log("[NodeMediaServer] No active streams, FFmpeg not started");
    return;
  }

  let inputIndex = 0;
  let outputCount = 0;

  // Process each stream and its destinations
  for (const [streamKey, destinations] of streamDestinations) {
    // Add input for this stream
    ffmpegArgs.push("-i", `rtmp://localhost:1935/live/${streamKey}`);

    // Add outputs for this stream's destinations
    destinations.forEach((destination) => {
      const { rtmp_url, stream_key } = destination;
      const outputUrl = `${rtmp_url}/${stream_key}`;

      // Map input to output using -map
      ffmpegArgs.push("-map", `${inputIndex}:v`, "-map", `${inputIndex}:a`);
      ffmpegArgs.push("-c", "copy", "-f", "flv", outputUrl);

      outputCount++;
    });

    inputIndex++;
  }

  console.log(
    `[NodeMediaServer] Starting global FFmpeg with ${streamDestinations.size} streams and ${outputCount} destinations`
  );
  console.log(`[NodeMediaServer] FFmpeg args:`, ffmpegArgs);

  // Start global FFmpeg process
  globalFFmpegProcess = spawn("ffmpeg", ffmpegArgs);

  globalFFmpegProcess.stdout.on("data", (data) => {
    console.log(`[FFmpeg] ${data}`);
  });

  globalFFmpegProcess.stderr.on("data", (data) => {
    console.log(`[FFmpeg Error] ${data}`);
  });

  globalFFmpegProcess.on("close", (code) => {
    console.log(`[FFmpeg] Global process exited with code ${code}`);
    globalFFmpegProcess = null;
  });
}

nms.run();

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log(
    "[NodeMediaServer] Received SIGTERM, shutting down gracefully..."
  );
  if (globalFFmpegProcess) {
    globalFFmpegProcess.kill("SIGTERM");
  }
  nms.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[NodeMediaServer] Received SIGINT, shutting down gracefully...");
  if (globalFFmpegProcess) {
    globalFFmpegProcess.kill("SIGTERM");
  }

  nms.stop();
  process.exit(0);
});

module.exports = nms;
