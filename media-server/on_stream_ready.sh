#!/bin/bash

set -e

# Check if yq is installed
if ! command -v yq &> /dev/null
then
    echo "yq could not be found, installing..."
    sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq && sudo chmod +x /usr/bin/yq
fi

STREAM_PATH=$1
STREAM_KEY=$(basename $STREAM_PATH)

# Authenticate with control-plane
AUTH_RESPONSE=$(curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream)

if [ "$AUTH_RESPONSE" != "OK" ]; then
  echo "Authentication failed for stream key: $STREAM_KEY"
  exit 1
fi

# Get forwarding destinations
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY")

# Atomically update mediamtx.yml
TMP_YAML=$(mktemp)
cp /etc/mediamtx.yml $TMP_YAML

echo "$FORWARDING_CONFIG" | jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' | while read -r dest; do
  # use random id for path name
  id=$(cat /proc/sys/kernel/random/uuid)
  yq e ".paths += {"$STREAM_KEY-$id": {"source": "rtmp://localhost:1935/$STREAM_PATH", "publish": "$dest"}}" -i $TMP_YAML
done

mv $TMP_YAML /etc/mediamtx.yml

# Reload mediamtx
curl -X POST http://localhost:9997/v2/config/paths/reload
