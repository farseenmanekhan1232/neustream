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

# Notify control-plane
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end

# Atomically update mediamtx.yml
TMP_YAML=$(mktemp)
cp /etc/mediamtx.yml $TMP_YAML

yq e "del(.paths[] | select(key == \"$STREAM_KEY- E*\"))" -i $TMP_YAML

mv $TMP_YAML /etc/mediamtx.yml

# Reload mediamtx
curl -X POST http://localhost:9997/v2/config/paths/reload
