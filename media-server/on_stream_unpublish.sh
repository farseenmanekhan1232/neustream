#!/bin/bash
set -e

STREAM_PATH=${MTX_PATH}
if [ -z "$STREAM_PATH" ]; then
  echo "❌ No stream path provided (MTX_PATH is empty)"
  exit 1
fi
STREAM_KEY=$(basename "$STREAM_PATH")

echo "=== Stream Ended ==="
echo "Stream Key: $STREAM_KEY"

# Notify control-plane
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end || true

# Get source info for PID file name
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY" 2>/dev/null || echo '{"sourceId": null}')
SOURCE_ID=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceId // empty' 2>/dev/null || echo "")

# Determine PID file path (must match on_stream_ready.sh)
if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  pid_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.pid"
else
  pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"
fi

# Kill FFmpeg process
if [ -f "$pid_file" ]; then
  FFMPEG_PID=$(cat "$pid_file")
  if kill -0 "$FFMPEG_PID" 2>/dev/null; then
    kill "$FFMPEG_PID" 2>/dev/null || true
    sleep 2
    # Force kill if still running
    if kill -0 "$FFMPEG_PID" 2>/dev/null; then
      kill -9 "$FFMPEG_PID" 2>/dev/null || true
    fi
  fi
  rm -f "$pid_file"
fi

# Clean up temp files
rm -f "/tmp/ffmpeg_destinations_$STREAM_KEY.txt"

# Log stream end
logger -t neustream "Stream ended: key=$STREAM_KEY"

echo "=== Stream Cleanup Complete ==="
