#!/bin/bash
set -e

# MediaMTX passes the path as MTX_PATH environment variable
STREAM_PATH=${MTX_PATH}
if [ -z "$STREAM_PATH" ]; then
  echo "❌ No stream path provided (MTX_PATH is empty)"
  exit 1
fi
STREAM_KEY=$(basename "$STREAM_PATH")

echo "=== Stream Started ==="
echo "Stream Key: $STREAM_KEY"
echo "Stream Path: $STREAM_PATH"
echo "Timestamp: $(date)"

# Authenticate with control-plane
echo "🔐 Authenticating stream key with control-plane..."
AUTH_RESPONSE=$(curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream)

if [ "$AUTH_RESPONSE" != "OK" ]; then
  echo "❌ Authentication failed for stream key: $STREAM_KEY"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Stream authentication successful"

# Get forwarding destinations
echo "📋 Fetching forwarding configuration..."
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY")

if [ -z "$FORWARDING_CONFIG" ] || [ "$FORWARDING_CONFIG" = "null" ]; then
  echo "❌ No forwarding destinations found for stream key: $STREAM_KEY"
  exit 0
fi

# Extract stream information
SOURCE_ID=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceId // empty' 2>/dev/null || echo "")
SOURCE_NAME=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceName // empty' 2>/dev/null || echo "Legacy Stream")
IS_LEGACY=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.isLegacy // false' 2>/dev/null || echo "false")
DESTINATIONS_COUNT=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations | length' 2>/dev/null || echo "0")

echo "📊 Stream Information:"
echo "  - Source ID: ${SOURCE_ID:-N/A}"
echo "  - Source Name: ${SOURCE_NAME:-N/A}"
echo "  - Architecture: $([ "$IS_LEGACY" = "true" ] && echo "Legacy" || echo "Multi-Source")"
echo "  - Destinations: $DESTINATIONS_COUNT"

# Build FFmpeg command with PROPER encoding to fix frame order issues
# Use re-encoding instead of copy mode
TEMP_FILE="/tmp/ffmpeg_destinations_$STREAM_KEY.txt"
DESTINATION_COUNT=0

# Extract destinations to a temporary file
echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' > "$TEMP_FILE"

# Build FFmpeg command
# Key change: Use proper encoding instead of -c copy
# -c:v libx264: Re-encode video (fixes frame order)
# -preset veryfast: Fast encoding (good for low-spec systems)
# -crf 23: Good quality vs size balance
# -c:a aac: Re-encode audio to AAC
# -g 60: GOP size for stability
# -keyint_min 60: Minimum keyframe interval
OUTPUT_ARGS=""
while read -r dest; do
  if [ -n "$dest" ] && [ "$dest" != "null" ]; then
    echo "🎯 Adding destination: $dest"

    if [ $DESTINATION_COUNT -eq 0 ]; then
      # First destination
      OUTPUT_ARGS="-c:v libx264 -preset veryfast -crf 23 -g 60 -keyint_min 60 -c:a aac -b:a 128k -f flv $dest"
    else
      # Additional destinations (reuse video, re-encode audio)
      OUTPUT_ARGS="$OUTPUT_ARGS -c:v copy -c:a aac -b:a 128k -f flv $dest"
    fi

    DESTINATION_COUNT=$((DESTINATION_COUNT + 1))
  fi
done < "$TEMP_FILE"

# Clean up temp file
rm -f "$TEMP_FILE"

# Determine PID and log file naming
if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  pid_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.pid"
  log_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.log"
  echo "📁 Using source-based file naming (source_id: $SOURCE_ID)"
else
  pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"
  log_file="/tmp/ffmpeg-$STREAM_KEY.log"
  echo "📁 Using legacy file naming"
fi

# Start single FFmpeg process for all destinations
if [ $DESTINATION_COUNT -gt 0 ]; then
  echo "🚀 Starting FFmpeg process for $DESTINATION_COUNT destinations"
  echo "   (Using re-encoding to fix frame order issues)"

  # Build the final FFmpeg command
  # Note: We re-encode to fix B-frame issues but keep quality reasonable
  FFMPEG_CMD="/usr/bin/ffmpeg -hide_banner -loglevel error \
    -i rtmp://localhost:1935/$STREAM_PATH \
    $OUTPUT_ARGS"

  echo "🔧 FFmpeg Command: $FFMPEG_CMD"
  echo "📝 Log file: $log_file"
  echo "🆔 PID file: $pid_file"

  # Add delay to ensure stream is fully established
  echo "⏳ Waiting for stream to stabilize..."
  sleep 3

  # Start FFmpeg with all destinations
  echo "🚀 Starting FFmpeg process..."
  nohup $FFMPEG_CMD > "$log_file" 2>&1 &

  # Store FFmpeg process ID for cleanup
  FFMPEG_PID=$!
  echo $FFMPEG_PID > "$pid_file"

  # Give FFmpeg a moment to start and check if it's running
  sleep 3
  if ! kill -0 $FFMPEG_PID 2>/dev/null; then
    echo "❌ FFmpeg process died immediately"
    echo "📋 FFmpeg log contents:"
    tail -20 "$log_file"
    exit 1
  fi

  echo "✅ FFmpeg multi-destination forwarding started successfully"
  echo "   - PID: $FFMPEG_PID"
  echo "   - Destinations: $DESTINATION_COUNT"
  echo "   - Source: ${SOURCE_NAME:-Legacy}"
  echo "   - Method: Re-encoding (fixes frame order)"

  # Log stream start
  logger -t neustream "Stream started: key=$STREAM_KEY source=${SOURCE_NAME:-legacy} pid=$FFMPEG_PID destinations=$DESTINATION_COUNT method=ffmpeg-reencode"
else
  echo "❌ No valid destinations found"
  logger -t neustream "Stream start failed: no destinations for key=$STREAM_KEY"
fi

echo "=== Stream Setup Complete ==="
