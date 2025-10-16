#!/bin/bash

set -e

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
