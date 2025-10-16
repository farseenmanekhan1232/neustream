#!/bin/bash

set -e

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

echo "Stream ended: $STREAM_KEY at path: $STREAM_PATH"

# Notify control-plane
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end

# Stop FFmpeg forwarding process (single process per user)
echo "Stopping FFmpeg forwarding process for stream: $STREAM_KEY"

pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"

# Kill the single FFmpeg process for this stream
if [ -f "$pid_file" ]; then
  pid=$(cat "$pid_file")
  if kill -0 "$pid" 2>/dev/null; then
    echo "Killing FFmpeg process $pid for stream $STREAM_KEY"
    kill "$pid"
    # Wait a moment for graceful shutdown
    sleep 2
    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
      echo "Force killing FFmpeg process $pid"
      kill -9 "$pid"
    fi
  fi
  rm -f "$pid_file"
else
  echo "No PID file found for stream $STREAM_KEY"
fi

# Clean up any remaining FFmpeg processes for this stream (fallback)
pkill -f "ffmpeg.*$STREAM_KEY" 2>/dev/null || true

# Clean up temp destination files
rm -f "/tmp/ffmpeg_destinations_$STREAM_KEY.txt" 2>/dev/null || true

echo "FFmpeg forwarding process stopped"
