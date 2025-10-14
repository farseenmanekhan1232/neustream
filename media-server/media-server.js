const NodeMediaServer = require("node-media-server");
const axios = require("axios");
const posthogService = require('./services/posthog');

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
  posthogService.trackConnectionEvent(id, 'rtmp_client_connecting', {
    args: args
  });
});

nms.on("postConnect", (id, args) => {
  console.log("[NodeMediaServer] Client connected:", id, args);
  posthogService.trackConnectionEvent(id, 'rtmp_client_connected', {
    args: args
  });
});

nms.on("doneConnect", (id, args) => {
  console.log("[NodeMediaServer] Client disconnected:", id, args);
  posthogService.trackConnectionEvent(id, 'rtmp_client_disconnected', {
    args: args
  });
});

nms.on("prePublish", async (id, StreamPath, args) => {
  console.log("[NodeMediaServer] Stream publishing:", id, StreamPath, args);

  // Extract stream key from StreamPath (format: /live/streamKey)
  const streamKey = StreamPath.split("/").pop();

  // Track stream publishing attempt
  posthogService.trackStreamEvent(streamKey, 'stream_publishing_started', {
    connection_id: id,
    stream_path: StreamPath,
    args: args
  });

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

      // Track successful authentication
      posthogService.trackStreamEvent(streamKey, 'stream_auth_success');

      // Get forwarding configuration for this stream
      const forwardingResponse = await axios.get(
        `https://api.neustream.app/api/streams/forwarding/${streamKey}`
      );
      const { destinations } = forwardingResponse.data;

      console.log(`[NodeMediaServer] Forwarding destinations:`, destinations);

      // Track forwarding setup
      posthogService.trackStreamEvent(streamKey, 'stream_forwarding_setup', {
        destination_count: destinations.length,
        destinations: destinations.map(d => d.rtmp_url)
      });

      // Set up relay tasks for each destination
      destinations.forEach((destination, index) => {
        const { rtmp_url, stream_key } = destination;

        // For YouTube, use the correct RTMP URL format
        // YouTube expects: rtmp://a.rtmp.youtube.com/live2/STREAM_KEY
        // Other platforms may have different formats
        let outputUrl;
        if (rtmp_url.includes('youtube.com')) {
          // YouTube: stream key is part of the URL path
          outputUrl = `${rtmp_url}/${stream_key}`;
        } else {
          // Other platforms: standard format
          outputUrl = `${rtmp_url}/${stream_key}`;
        }

        console.log(`[NodeMediaServer] Setting up relay to: ${outputUrl}`);

        // Use NodeMediaServer's relay push functionality
        // This dynamically adds relay tasks at runtime
        nms.nodeEvent.on('postPublish', (_id, StreamPath, _args) => {
          if (StreamPath === `/live/${streamKey}`) {
            console.log(`[NodeMediaServer] Starting relay to: ${outputUrl}`);

            // Start relay push
            nms.relayTask.push(StreamPath, outputUrl, (err) => {
              if (err) {
                console.error(`[NodeMediaServer] Relay push failed for ${outputUrl}:`, err);

                // Track relay failure
                posthogService.trackRelayEvent(streamKey, outputUrl, 'relay_push_failed', {
                  task_index: index,
                  error: err.message
                });
              } else {
                console.log(`[NodeMediaServer] Relay push started for ${outputUrl}`);

                // Track successful relay start
                posthogService.trackRelayEvent(streamKey, outputUrl, 'relay_push_started', {
                  task_index: index,
                  destination_url: rtmp_url,
                  destination_stream_key: stream_key
                });
              }
            });
          }
        });
      });

      // Explicitly return true to allow the stream
      return true;
    } else {
      console.log(
        `[NodeMediaServer] Stream authentication failed: ${streamKey}`
      );

      // Track authentication failure
      posthogService.trackStreamEvent(streamKey, 'stream_auth_failed', {
        reason: 'control_plane_rejection',
        status_code: authResponse.status
      });

      return false; // Reject stream
    }
  } catch (error) {
    console.error(
      `[NodeMediaServer] Authentication error for ${streamKey}:`,
      error.message
    );

    // Track authentication error
    posthogService.trackErrorEvent(streamKey, 'authentication_error', error.message);

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

  // Track stream publishing ended
  posthogService.trackStreamEvent(streamKey, 'stream_publishing_ended', {
    connection_id: id,
    stream_path: StreamPath,
    args: args
  });

  // Clean up relay tasks for this stream
  const removedTasks = config.relay.tasks.filter(task => task.name.startsWith(`${streamKey}_`));
  config.relay.tasks = config.relay.tasks.filter(task => !task.name.startsWith(`${streamKey}_`));
  console.log(`[NodeMediaServer] Cleaned up relay tasks for stream: ${streamKey}`);

  // Track relay cleanup
  posthogService.trackStreamEvent(streamKey, 'relay_tasks_cleaned', {
    removed_task_count: removedTasks.length,
    removed_tasks: removedTasks.map(task => task.edge)
  });

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

    // Track successful stream end notification
    posthogService.trackStreamEvent(streamKey, 'stream_end_notified');
  } catch (error) {
    console.error(
      `[NodeMediaServer] Stream end notification error:`,
      error.message
    );

    // Track stream end notification error
    posthogService.trackErrorEvent(streamKey, 'stream_end_notification_error', error.message);
  }
});

nms.run();

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("[NodeMediaServer] Received shutdown signal, shutting down gracefully...");

  // Stop the media server
  if (globalFFmpegProcess) {
    globalFFmpegProcess.kill("SIGTERM");
  }

  nms.stop();

  // Flush PostHog events
  await posthogService.flush();
  console.log("[NodeMediaServer] PostHog events flushed");

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = nms;
