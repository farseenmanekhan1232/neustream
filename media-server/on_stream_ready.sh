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

# Extract destinations
TEMP_FILE="/tmp/ffmpeg_destinations_$STREAM_KEY.txt"
DESTINATIONS=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' 2>/dev/null || echo "")

# Count destinations
DESTINATION_COUNT=$(echo "$DESTINATIONS" | grep -c "rtmp://" 2>/dev/null || echo "0")

if [ $DESTINATION_COUNT -eq 0 ]; then
  echo "❌ No valid destinations found"
  exit 0
fi

echo "$DESTINATIONS" > "$TEMP_FILE"

# Build FFmpeg command - use copy mode for all destinations (zero CPU, minimal RAM)
OUTPUT_ARGS=""
DEST_INDEX=0
while read -r dest; do
  if [ -n "$dest" ]; then
    if [ $DEST_INDEX -eq 0 ]; then
      OUTPUT_ARGS="-c:v copy -c:a copy -f flv $dest"
    else
      OUTPUT_ARGS="$OUTPUT_ARGS -c:v copy -c:a copy -f flv $dest"
    fi
    DEST_INDEX=$((DEST_INDEX + 1))
  fi
done < "$TEMP_FILE"

# Determine PID file path
if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  pid_file="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.pid"
else
  pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"
fi

# Start FFmpeg
if [ $DESTINATION_COUNT -gt 0 ]; then
  sleep 2
  nohup /usr/bin/ffmpeg -hide_banner -loglevel error \
    -i rtmp://localhost:1935/$STREAM_PATH \
    $OUTPUT_ARGS > /dev/null 2>&1 &
  FFMPEG_PID=$!
  echo $FFMPEG_PID > "$pid_file"

  sleep 2
  if ! kill -0 $FFMPEG_PID 2>/dev/null; then
    rm -f "$pid_file"
    rm -f "$TEMP_FILE"
    exit 1
  fi

  logger -t neustream "Stream started: key=$STREAM_KEY pid=$FFMPEG_PID destinations=$DESTINATION_COUNT"
fi

rm -f "$TEMP_FILE"
echo "=== Stream Setup Complete ==="
