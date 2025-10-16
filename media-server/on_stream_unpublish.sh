#!/bin/bash

set -e

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

echo "Stream ended: $STREAM_KEY at path: $STREAM_PATH"

# Notify control-plane
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end

# Atomically update mediamtx.yml
TMP_YAML=$(mktemp)
cp /etc/mediamtx.yml $TMP_YAML

# Remove all paths that match this stream key pattern
# Use proper yq syntax to delete paths by pattern
yq eval "del(.paths[\"$STREAM_KEY-\*\"])" -i $TMP_YAML

# Validate YAML before moving
if yq eval '.' $TMP_YAML > /dev/null 2>&1; then
  sudo mv $TMP_YAML /etc/mediamtx.yml
  echo "Stream paths removed successfully"

  # Reload mediamtx paths configuration
  curl -s -X POST http://localhost:9997/v3/config/paths/reload
  echo "MediaMTX configuration reloaded"
else
  echo "Invalid YAML generated, keeping original configuration"
  rm $TMP_YAML
  exit 1
fi
