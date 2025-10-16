#!/bin/bash

set -e

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

echo "Stream started: $STREAM_KEY at path: $STREAM_PATH"

# Authenticate with control-plane
AUTH_RESPONSE=$(curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream)

if [ "$AUTH_RESPONSE" != "OK" ]; then
  echo "Authentication failed for stream key: $STREAM_KEY"
  exit 1
fi

# Get forwarding destinations
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY")

if [ -z "$FORWARDING_CONFIG" ] || [ "$FORWARDING_CONFIG" = "null" ]; then
  echo "No forwarding destinations found for stream key: $STREAM_KEY"
  exit 0
fi

# Add forwarding destinations using MediaMTX API
echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' | while read -r dest; do
  if [ -n "$dest" ] && [ "$dest" != "null" ]; then
    # use random id for path name
    id=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")
    path_name="$STREAM_KEY-$id"

    echo "Adding forwarding destination: $dest to path: $path_name"

    # Create path configuration using MediaMTX API
    path_config="{
      \"source\": \"rtmp://localhost:1935/$STREAM_PATH\",
      \"rtmpPush\": \"$dest\"
    }"

    # Add the path via MediaMTX API
    if curl -s -X POST -H "Content-Type: application/json" \
      -d "$path_config" \
      "http://localhost:9997/v3/config/paths/add/$path_name" > /dev/null; then
      echo "Successfully added path: $path_name"
    else
      echo "Failed to add path: $path_name"
    fi
  fi
done

# Reload paths to apply changes
curl -s -X POST http://localhost:9997/v3/config/paths/reload > /dev/null
echo "MediaMTX configuration reloaded via API"
