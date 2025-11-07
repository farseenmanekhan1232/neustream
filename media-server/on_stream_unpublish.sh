#!/bin/bash
set -e

# MediaMTX passes the path as MTX_PATH environment variable
STREAM_PATH=${MTX_PATH}
if [ -z "$STREAM_PATH" ]; then
  echo "❌ No stream path provided (MTX_PATH is empty)"
  exit 1
fi
STREAM_KEY=$(basename "$STREAM_PATH")

echo "=== Stream Ended (MediaMTX Native Mode) ==="
echo "Stream Key: $STREAM_KEY"
echo "Stream Path: $STREAM_PATH"
echo "Timestamp: $(date)"

# Notify control-plane
echo "📢 Notifying control-plane of stream end..."
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end || true

# Get source information (for logging)
echo "📋 Fetching stream information..."
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY" 2>/dev/null || echo '{"destinations": []}')
DESTINATIONS_COUNT=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations | length' 2>/dev/null || echo "0")

echo "📊 Stream Cleanup Information:"
echo "  - Stream Key: $STREAM_KEY"
echo "  - Destinations to clean up: $DESTINATIONS_COUNT"

# Clean up MediaMTX paths that were created for this stream
# In the new approach, we created paths like: {STREAM_KEY}_dest1, {STREAM_KEY}_dest2, etc.

if [ -n "$DESTINATIONS_COUNT" ] && [ "$DESTINATIONS_COUNT" != "null" ] && [ "$DESTINATIONS_COUNT" -gt 0 ]; then
  echo "🧹 Cleaning up MediaMTX destination paths..."

  DESTINATION_INDEX=0
  while [ "$DESTINATION_INDEX" -lt "$DESTINATIONS_COUNT" ]; do
    DESTINATION_INDEX=$((DESTINATION_INDEX + 1))
    DEST_PATH="${STREAM_KEY}_dest${DESTINATION_INDEX}"

    echo "  🗑️  Removing MediaMTX path: $DEST_PATH"

    # Use MediaMTX API to remove the path
    curl -s -X DELETE "http://localhost:9997/v3/paths/delete/$DEST_PATH" > /dev/null || true

    echo "     ✅ Removed path: $DEST_PATH"
  done
else
  echo "ℹ️  No destinations to clean up"
fi

# Also clean up any orphaned paths (defensive cleanup)
echo "🔍 Checking for orphaned MediaMTX paths..."
ORPHANED_PATHS=$(curl -s http://localhost:9997/v3/paths/list | /usr/bin/jq -r ".items[] | select(.name | test(\"^${STREAM_KEY}_dest[0-9]+$\")) | .name" 2>/dev/null || echo "")

if [ -n "$ORPHANED_PATHS" ]; then
  echo "⚠️  Found orphaned paths, cleaning up..."
  echo "$ORPHANED_PATHS" | while read -r path; do
    if [ -n "$path" ]; then
      echo "  🗑️  Removing orphaned path: $path"
      curl -s -X DELETE "http://localhost:9997/v3/paths/delete/$path" > /dev/null || true
    fi
  done
else
  echo "✅ No orphaned paths found"
fi

# No FFmpeg processes to kill anymore!
echo "✅ No FFmpeg cleanup needed (using MediaMTX native routing)"

# Log stream end
logger -t neustream "Stream ended: key=$STREAM_KEY method=mediamtx-native destinations=$DESTINATIONS_COUNT"

echo "📊 Cleanup Summary:"
echo "  - Method: MediaMTX API (no FFmpeg)"
echo "  - Paths Cleaned: $DESTINATIONS_COUNT"
echo "  - Stream Key: $STREAM_KEY"

echo "=== MediaMTX Native Stream Cleanup Complete ==="
