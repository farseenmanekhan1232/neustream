#!/bin/bash

set -e

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

echo "Stream ended: $STREAM_KEY at path: $STREAM_PATH"

# Notify control-plane
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end

# Remove forwarding paths using MediaMTX API
# Get all paths and find ones matching this stream key
PATHS_JSON=$(curl -s "http://localhost:9997/v3/config/paths/list")

echo "$PATHS_JSON" | /usr/bin/jq -r '.paths[] | select(.name | startswith("'"$STREAM_KEY"'-")) | .name' | while read -r path_name; do
  if [ -n "$path_name" ]; then
    echo "Removing forwarding path: $path_name"

    # Remove the path via MediaMTX API
    if curl -s -X POST "http://localhost:9997/v3/config/paths/remove/$path_name" > /dev/null; then
      echo "Successfully removed path: $path_name"
    else
      echo "Failed to remove path: $path_name"
    fi
  fi
done

# Reload paths to apply changes
curl -s -X POST http://localhost:9997/v3/config/paths/reload > /dev/null
echo "MediaMTX configuration reloaded via API"
