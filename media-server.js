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
  auth: {
    play: false,
    publish: true,
    secret: "qoiwerj12ojasldkfjalskej",
  },
};

const nms = new NodeMediaServer(config);

// Store active stream forwarding configurations
const activeStreams = new Map();

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
      "http://api.neustream.app/api/auth/stream",
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
        `http://api.neustream.app/api/streams/forwarding/${streamKey}`
      );
      const { destinations, pushConfig } = forwardingResponse.data;

      console.log(`[NodeMediaServer] Forwarding destinations:`, destinations);

      // Store forwarding configuration for this stream
      activeStreams.set(streamKey, {
        destinations,
        pushConfig,
        streamPath: StreamPath,
      });

      // Set up forwarding for each destination
      destinations.forEach((destination) => {
        const { platform, rtmp_url, stream_key } = destination;
        const relayUrl = `${rtmp_url}/${stream_key}`;

        console.log(`[NodeMediaServer] Setting up relay to: ${relayUrl}`);

        // Create relay session
        const session = nms.getSession(id);
        if (session) {
          session.nodeEvent.on("relayTask", (taskId, url, command) => {
            console.log(
              `[NodeMediaServer] Relay ${command}: ${taskId} -> ${url}`
            );
          });

          // Start relay
          session.startRelay(relayUrl);
        }
      });
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

  try {
    // Notify control plane that stream ended
    await axios.post(
      "http://api.neustream.app/api/auth/stream-end",
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

nms.on("relayPush", (id, relayUrl, args) => {
  console.log(`[NodeMediaServer] Relay push started: ${id} -> ${relayUrl}`);
});

nms.on("relayPushDone", (id, relayUrl, args) => {
  console.log(`[NodeMediaServer] Relay push ended: ${id} -> ${relayUrl}`);
});

module.exports = nms;
