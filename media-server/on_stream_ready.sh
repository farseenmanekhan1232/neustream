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

# Build FFmpeg command with multiple outputs (1 process per user)
TEMP_FILE="/tmp/ffmpeg_destinations_$STREAM_KEY.txt"
DESTINATION_COUNT=0

# Extract destinations to a temporary file
echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.destinations[] | .rtmp_url + "/" + .stream_key' > "$TEMP_FILE"

# Build FFmpeg command from destinations file
OUTPUT_ARGS=""
while read -r dest; do
  if [ -n "$dest" ] && [ "$dest" != "null" ]; then
    echo "Adding destination: $dest"

    # Build output arguments for FFmpeg (each destination needs its own output flags)
    if [ $DESTINATION_COUNT -eq 0 ]; then
      OUTPUT_ARGS="-c copy -f flv $dest"
    else
      # Add additional outputs
      OUTPUT_ARGS="$OUTPUT_ARGS -c copy -f flv $dest"
    fi

    DESTINATION_COUNT=$((DESTINATION_COUNT + 1))
  fi
done < "$TEMP_FILE"

# Clean up temp file
rm -f "$TEMP_FILE"

# Start single FFmpeg process for all destinations
if [ $DESTINATION_COUNT -gt 0 ]; then
  pid_file="/tmp/ffmpeg-$STREAM_KEY.pid"
  log_file="/tmp/ffmpeg-$STREAM_KEY.log"

  echo "Starting single FFmpeg process for $DESTINATION_COUNT destinations"
  echo "Command: ffmpeg -i rtmp://localhost:1935/$STREAM_PATH $OUTPUT_ARGS"

  # Build the final FFmpeg command
  FFMPEG_CMD="/usr/bin/ffmpeg -i rtmp://localhost:1935/$STREAM_PATH $OUTPUT_ARGS"

  # Start FFmpeg with all destinations
  nohup $FFMPEG_CMD > "$log_file" 2>&1 &

  # Store FFmpeg process ID for cleanup
  echo $! > "$pid_file"
  echo "FFmpeg multi-destination forwarding started with PID: $(cat $pid_file)"
else
  echo "No valid destinations found"
fi
