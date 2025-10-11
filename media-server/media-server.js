const NodeMediaServer = require("node-media-server");
const axios = require("axios");

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
  relay: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: []
  }
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
      const { destinations } = forwardingResponse.data;

      console.log(`[NodeMediaServer] Forwarding destinations:`, destinations);

      // Set up relay tasks for each destination
      destinations.forEach((destination, index) => {
        const { rtmp_url, stream_key } = destination;
        const outputUrl = `${rtmp_url}/${stream_key}`;

        const relayTask = {
          app: 'live',
          mode: 'push',
          name: `${streamKey}_${index}`,
          edge: outputUrl,
        };

        config.relay.tasks.push(relayTask);
        console.log(`[NodeMediaServer] Added relay task: ${outputUrl}`);
      });

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

  // Clean up relay tasks for this stream
  config.relay.tasks = config.relay.tasks.filter(task => !task.name.startsWith(`${streamKey}_`));
  console.log(`[NodeMediaServer] Cleaned up relay tasks for stream: ${streamKey}`);

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
