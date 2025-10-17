#!/bin/bash

set -e

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

echo "=== Stream Started ==="
echo "Stream Key: $STREAM_KEY"
echo "Stream Path: $STREAM_PATH"
echo "Timestamp: $(date)"

# Authenticate with control-plane
echo "Authenticating stream key with control-plane..."
AUTH_RESPONSE=$(curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream)

if [ "$AUTH_RESPONSE" != "OK" ]; then
  echo "❌ Authentication failed for stream key: $STREAM_KEY"
  echo "Response: $AUTH_RESPONSE"
  exit 1
fi

echo "✅ Stream authentication successful"

# Get forwarding destinations
echo "Fetching forwarding configuration..."
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY")

if [ -z "$FORWARDING_CONFIG" ] || [ "$FORWARDING_CONFIG" = "null" ]; then
  echo "❌ No forwarding destinations found for stream key: $STREAM_KEY"
  exit 0
fi

# Extract source information for better logging
SOURCE_ID=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceId // empty')
SOURCE_NAME=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceName // empty')
IS_LEGACY=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.isLegacy // false')
DESTINATIONS_COUNT=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations | length')

echo "📊 Stream Information:"
echo "  - Source ID: ${SOURCE_ID:-N/A}"
echo "  - Source Name: ${SOURCE_NAME:-Legacy Stream}"
echo "  - Architecture: $([ "$IS_LEGACY" = "true" ] && echo "Legacy" || echo "Multi-Source")"
echo "  - Destinations: $DESTINATIONS_COUNT"

# Build FFmpeg command with multiple outputs
TEMP_FILE="/tmp/ffmpeg_destinations_$STREAM_KEY.txt"
DESTINATION_COUNT=0

# Extract destinations to a temporary file
echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' > "$TEMP_FILE"

# Build FFmpeg command from destinations file
OUTPUT_ARGS=""
while read -r dest; do
  if [ -n "$dest" ] && [ "$dest" != "null" ]; then
    echo "🎯 Adding destination: $dest"

    # Build output arguments for FFmpeg (each destination needs its own output flags)
    if [ $DESTINATION_COUNT -eq 0 ]; then
      OUTPUT_ARGS="-c copy -f flv $dest"
    else
      # Add additional outputs
      OUTPUT_ARGS="$OUTPUT_ARGS -c copy -f flv $dest"
    fi

    DESTINATION_COUNT=$((DESTINATION_COUNT + 1))
  fi
done < "$TEMP_FILE"

# Clean up temp file
rm -f "$TEMP_FILE"

# Determine PID and log file naming strategy
if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  # Use source_id for multi-source streams
  pid_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.pid"
  log_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.log"
  echo "📁 Using source-based file naming (source_id: $SOURCE_ID)"
else
  # Fallback to legacy naming
  pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"
  log_file="/tmp/ffmpeg-$STREAM_KEY.log"
  echo "📁 Using legacy file naming"
fi

# Start single FFmpeg process for all destinations
if [ $DESTINATION_COUNT -gt 0 ]; then
  echo "🚀 Starting FFmpeg process for $DESTINATION_COUNT destinations"

  # Build the final FFmpeg command with additional options for better reliability
  FFMPEG_CMD="/usr/bin/ffmpeg -i rtmp://localhost:1935/$STREAM_PATH $OUTPUT_ARGS"

  echo "🔧 FFmpeg Command: $FFMPEG_CMD"
  echo "📝 Log file: $log_file"
  echo "🆔 PID file: $pid_file"

  # Start FFmpeg with all destinations
  nohup $FFMPEG_CMD > "$log_file" 2>&1 &

  # Store FFmpeg process ID for cleanup
  FFMPEG_PID=$!
  echo $FFMPEG_PID > "$pid_file"

  echo "✅ FFmpeg multi-destination forwarding started successfully"
  echo "   - PID: $FFMPEG_PID"
  echo "   - Destinations: $DESTINATION_COUNT"
  echo "   - Source: ${SOURCE_NAME:-Legacy}"

  # Log stream start to system log for monitoring
  logger -t neustream "Stream started: key=$STREAM_KEY source=${SOURCE_NAME:-legacy} pid=$FFMPEG_PID destinations=$DESTINATION_COUNT"
else
  echo "❌ No valid destinations found"
  logger -t neustream "Stream start failed: no destinations for key=$STREAM_KEY"
fi

echo "=== Stream Setup Complete ==="
