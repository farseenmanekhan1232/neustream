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

# Atomically update mediamtx.yml
TMP_YAML=$(mktemp)
cp /etc/mediamtx.yml $TMP_YAML

echo "$FORWARDING_CONFIG" | jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' | while read -r dest; do
  if [ -n "$dest" ] && [ "$dest" != "null" ]; then
    # use random id for path name
    id=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")
    path_name="$STREAM_KEY-$id"

    echo "Adding forwarding destination: $dest to path: $path_name"

    # Use correct yq syntax and MediaMTX configuration format
    yq eval ".paths += {\"$path_name\": {\"source\": \"rtmp://localhost:1935/$STREAM_PATH\", \"push\": \"$dest\"}}" -i $TMP_YAML
  fi
done

# Validate YAML before moving
if yq eval '.' $TMP_YAML > /dev/null 2>&1; then
  mv $TMP_YAML /etc/mediamtx.yml
  echo "Configuration updated successfully"

  # Reload mediamtx paths configuration
  curl -s -X POST http://localhost:9997/v2/config/paths/reload
  echo "MediaMTX configuration reloaded"
else
  echo "Invalid YAML generated, keeping original configuration"
  rm $TMP_YAML
  exit 1
fi
