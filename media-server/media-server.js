const NodeMediaServer = require("node-media-server");
const axios = require("axios");
const { spawn } = require("child_process");
const posthogService = require("./services/posthog");

// Store active FFmpeg processes for stream forwarding
const activeFFmpegProcesses = new Map();

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
  // Disable built-in relay server - we'll handle forwarding with FFmpeg
  relay: {
    ffmpeg: "/usr/bin/ffmpeg",
    tasks: [], // Keep empty - we'll handle this manually
  },
};

const nms = new NodeMediaServer(config);

nms.on("preConnect", (id, args) => {
  console.log("[NodeMediaServer] Client connecting:", id, args);
  posthogService.trackConnectionEvent(id, "rtmp_client_connecting", {
    args: args,
  });
});

nms.on("postConnect", (id, args) => {
  console.log("[NodeMediaServer] Client connected:", id, args);
  posthogService.trackConnectionEvent(id, "rtmp_client_connected", {
    args: args,
  });
});

nms.on("doneConnect", (id, args) => {
  console.log("[NodeMediaServer] Client disconnected:", id, args);
  posthogService.trackConnectionEvent(id, "rtmp_client_disconnected", {
    args: args,
  });
});

nms.on("prePublish", async (id, StreamPath, args) => {
  console.log("[NodeMediaServer] Stream publishing:", id, StreamPath, args);

  // Extract stream key from StreamPath (format: /live/streamKey)
  const streamKey = StreamPath.split("/").pop();

  // Create unique stream identifier using connection ID and stream key
  // This prevents overlap between multiple users with the same stream key
  const uniqueStreamId = `${streamKey}_${id}`;

  // Track stream publishing attempt
  posthogService.trackStreamEvent(streamKey, "stream_publishing_started", {
    connection_id: id,
    stream_path: StreamPath,
    args: args,
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
      posthogService.trackStreamEvent(streamKey, "stream_auth_success");

      // Get forwarding configuration for this stream
      const forwardingResponse = await axios.get(
        `https://api.neustream.app/api/streams/forwarding/${streamKey}`
      );
      const { destinations } = forwardingResponse.data;

      console.log(`[NodeMediaServer] Forwarding destinations:`, destinations);

      // Track forwarding setup
      posthogService.trackStreamEvent(streamKey, "stream_forwarding_setup", {
        destination_count: destinations.length,
        destinations: destinations.map((d) => d.rtmp_url),
      });

      // Configure relay tasks for each destination
      const relayTasks = [];
      destinations.forEach((destination, index) => {
        const { rtmp_url, stream_key } = destination;
        const outputUrl = `${rtmp_url}/${stream_key}`;

        // Create relay task for node-media-server
        const relayTask = {
          app: "live",
          mode: "push",
          edge: outputUrl,
          name: `${streamKey}_dest_${index}`,
        };

        relayTasks.push(relayTask);
        console.log(`[NodeMediaServer] Configured relay task: ${outputUrl}`);

        // Track individual relay setup
        posthogService.trackRelayEvent(
          streamKey,
          outputUrl,
          "relay_task_configured",
          {
            task_index: index,
            destination_url: rtmp_url,
            destination_stream_key: stream_key,
          }
        );
      });

      // Start FFmpeg processes for stream forwarding
      const ffmpegProcesses = [];
      destinations.forEach((destination) => {
        const { rtmp_url, stream_key } = destination;
        const outputUrl = `${rtmp_url}/${stream_key}`;

        console.log(`[NodeMediaServer] Starting FFmpeg forwarding to: ${outputUrl}`);

        // Start FFmpeg process to forward the stream
        // Use the connection-specific stream path to avoid overlap
        const ffmpegProcess = spawn('ffmpeg', [
          '-i', `rtmp://localhost:1935${StreamPath}`,
          '-c', 'copy',
          '-f', 'flv',
          outputUrl
        ]);

        ffmpegProcesses.push(ffmpegProcess);

        // Handle FFmpeg process events
        ffmpegProcess.stdout.on('data', (data) => {
          console.log(`[FFmpeg ${streamKey}] stdout: ${data}`);
        });

        ffmpegProcess.stderr.on('data', (data) => {
          console.log(`[FFmpeg ${streamKey}] stderr: ${data}`);
        });

        ffmpegProcess.on('close', (code) => {
          console.log(`[FFmpeg ${streamKey}] process exited with code ${code}`);

          // Track relay failure
          posthogService.trackStreamEvent(
            streamKey,
            'ffmpeg_process_exited',
            {
              exit_code: code,
              destination_url: rtmp_url,
              destination_stream_key: stream_key
            }
          );
        });

        ffmpegProcess.on('error', (error) => {
          console.error(`[FFmpeg ${streamKey}] error:`, error);

          // Track relay failure
          posthogService.trackStreamEvent(
            streamKey,
            'ffmpeg_process_error',
            {
              error: error.message,
              destination_url: rtmp_url,
              destination_stream_key: stream_key
            }
          );
        });

        console.log(`[NodeMediaServer] Started FFmpeg forwarding to: ${outputUrl}`);

        // Track successful FFmpeg start
        posthogService.trackStreamEvent(
          streamKey,
          'ffmpeg_forwarding_started',
          {
            destination_url: rtmp_url,
            destination_stream_key: stream_key,
          }
        );
      });

      // Store FFmpeg processes for cleanup
      activeFFmpegProcesses.set(streamKey, ffmpegProcesses);

      // Explicitly return true to allow the stream
      return true;
    } else {
      console.log(
        `[NodeMediaServer] Stream authentication failed: ${streamKey}`
      );

      // Track authentication failure
      posthogService.trackStreamEvent(streamKey, "stream_auth_failed", {
        reason: "control_plane_rejection",
        status_code: authResponse.status,
      });

      return false; // Reject stream
    }
  } catch (error) {
    console.error(
      `[NodeMediaServer] Authentication error for ${streamKey}:`,
      error.message
    );

    // Track authentication error
    posthogService.trackErrorEvent(
      streamKey,
      "authentication_error",
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

  // Track stream publishing ended
  posthogService.trackStreamEvent(streamKey, "stream_publishing_ended", {
    connection_id: id,
    stream_path: StreamPath,
    args: args,
  });

  // Clean up FFmpeg processes for this stream
  const ffmpegProcesses = activeFFmpegProcesses.get(streamKey);
  if (ffmpegProcesses) {
    console.log(`[NodeMediaServer] Cleaning up FFmpeg processes for stream: ${streamKey}`);

    ffmpegProcesses.forEach((process, index) => {
      if (!process.killed) {
        process.kill('SIGTERM');
        console.log(`[NodeMediaServer] Terminated FFmpeg process ${index} for stream: ${streamKey}`);
      }
    });

    activeFFmpegProcesses.delete(streamKey);
  }

  // Track FFmpeg cleanup
  posthogService.trackStreamEvent(streamKey, "ffmpeg_processes_cleaned", {
    cleaned_process_count: ffmpegProcesses ? ffmpegProcesses.length : 0,
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
    posthogService.trackStreamEvent(streamKey, "stream_end_notified");
  } catch (error) {
    console.error(
      `[NodeMediaServer] Stream end notification error:`,
      error.message
    );

    // Track stream end notification error
    posthogService.trackErrorEvent(
      streamKey,
      "stream_end_notification_error",
      error.message
    );
  }
});

nms.run();

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log(
    "[NodeMediaServer] Received shutdown signal, shutting down gracefully..."
  );

  // Stop the media server
  nms.stop();

  // Flush PostHog events
  await posthogService.flush();
  console.log("[NodeMediaServer] PostHog events flushed");

  process.exit(0);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

module.exports = nms;
