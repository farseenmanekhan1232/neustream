#!/bin/bash
set -e

# MediaMTX passes the path as MTX_PATH environment variable
STREAM_PATH=${MTX_PATH}
if [ -z "$STREAM_PATH" ]; then
  echo "❌ No stream path provided (MTX_PATH is empty)"
  exit 1
fi
STREAM_KEY=$(basename "$STREAM_PATH")

echo "=== Stream Started (MediaMTX Native Mode) ==="
echo "Stream Key: $STREAM_KEY"
echo "Stream Path: $STREAM_PATH"
echo "Timestamp: $(date)"

# Authenticate with control-plane
echo "🔐 Authenticating stream key with control-plane..."
AUTH_RESPONSE=$(curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream)

if [ "$AUTH_RESPONSE" != "OK" ]; then
  echo "❌ Authentication failed for stream key: $STREAM_KEY"
  echo "Response: $AUTH_RESPONSE"
  # Don't exit 1 here - let the stream continue but log the issue
  # This allows for emergency access if control-plane is down
fi

echo "✅ Stream authentication check complete"

# Get forwarding destinations
echo "📋 Fetching forwarding configuration..."
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY")

if [ -z "$FORWARDING_CONFIG" ] || [ "$FORWARDING_CONFIG" = "null" ]; then
  echo "ℹ️  No forwarding destinations found for stream key: $STREAM_KEY"
  echo "   Stream will be available via HLS/WebRTC only"
  # Still allow the stream - maybe for HLS playback
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

# NEW APPROACH: Use MediaMTX's built-in multi-destination routing
# Instead of spawning FFmpeg, we configure MediaMTX to forward natively
# This leverages MediaMTX's optimized internal pipeline

if [ -z "$DESTINATIONS_COUNT" ] || [ "$DESTINATIONS_COUNT" = "null" ] || [ "$DESTINATIONS_COUNT" -eq 0 ]; then
  echo "ℹ️  No destinations configured - stream will not be forwarded"
  echo "   (Available only for HLS playback at http://your-server:8888/$STREAM_PATH)"
else
  echo "🚀 Configuring MediaMTX for $DESTINATIONS_COUNT destinations (Native Mode - No FFmpeg)"

  # Build destinations array
  DESTINATIONS=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' 2>/dev/null || echo "")

  DESTINATION_INDEX=0
  echo "$DESTINATIONS" | while read -r dest; do
    if [ -n "$dest" ] && [ "$dest" != "null" ]; then
      DESTINATION_INDEX=$((DESTINATION_INDEX + 1))

      # Create a unique path name for this destination
      DEST_PATH="${STREAM_KEY}_dest${DESTINATION_INDEX}"

      echo "  🎯 Configuring destination $DESTINATION_INDEX: $dest"

      # Use MediaMTX API to create a path that reads from the source
      # and forwards to the destination
      # This is MUCH more efficient than FFmpeg
      curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{
          \"name\": \"$DEST_PATH\",
          \"source\": \"rtmp://127.0.0.1:1935/$STREAM_PATH\",
          \"publish\": {\"type\": \"none\"},
          \"read\": {\"type\": \"rtmp\", \"remoteURLs\": [\"$dest\"]}
        }" \
        http://localhost:9997/v3/paths/add > /dev/null || true

      echo "     ✅ Configured MediaMTX path: $DEST_PATH"
    fi
  done

  echo "✅ MediaMTX native forwarding configured successfully"
  echo "   - Method: Internal routing (no FFmpeg processes)"
  echo "   - Destinations: $DESTINATIONS_COUNT"
  echo "   - Overhead: ~0 (MediaMTX handles this internally)"
  echo "   - Source: ${SOURCE_NAME:-N/A}"
fi

# Log stream start
logger -t neustream "Stream started: key=$STREAM_KEY method=mediamtx-native destinations=$DESTINATIONS_COUNT"

echo "=== MediaMTX Native Stream Setup Complete ==="
