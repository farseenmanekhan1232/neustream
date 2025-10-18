#!/bin/bash

set -e

# MediaMTX passes the path as MTX_PATH environment variable, not as argument
STREAM_PATH=${MTX_PATH:-$1}
if [ -z "$STREAM_PATH" ]; then
  echo "❌ No stream path provided (MTX_PATH is empty and no argument given)"
  exit 1
fi
STREAM_KEY=$(basename "$STREAM_PATH")

echo "=== Stream Ended ==="
echo "Stream Key: $STREAM_KEY"
echo "Stream Path: $STREAM_PATH"
echo "Timestamp: $(date)"

# Notify control-plane
echo "Notifying control-plane of stream end..."
curl -s -X POST -d "name=$STREAM_KEY" https://api.neustream.app/api/auth/stream-end

# Get source information to determine correct PID file
echo "Fetching stream information for cleanup..."
FORWARDING_CONFIG=$(curl -s "https://api.neustream.app/api/streams/forwarding/$STREAM_KEY" 2>/dev/null || echo '{"sourceId":null}')

SOURCE_ID=$(echo "$FORWARDING_CONFIG" | /usr/bin/jq -r '.sourceId // empty' 2>/dev/null || echo)

echo "📊 Stream Cleanup Information:"
echo "  - Stream Key: $STREAM_KEY"
echo "  - Source ID: ${SOURCE_ID:-N/A}"

# Determine potential PID files to clean up
PID_FILES_TO_CLEAN=()

if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  # Multi-source naming convention
  SOURCE_PID_FILE="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.pid"
  SOURCE_LOG_FILE="/tmp/ffmpeg-source-${SOURCE_ID}-${STREAM_KEY}.log"
  PID_FILES_TO_CLEAN+=("$SOURCE_PID_FILE")
  echo "📁 Looking for source-based PID file: $SOURCE_PID_FILE"
else
  echo "📁 No source ID found, will try legacy naming"
fi

# Always try legacy naming as fallback
LEGACY_PID_FILE="/tmp/ffmpeg-$STREAM_KEY.pid"
LEGACY_LOG_FILE="/tmp/ffmpeg-$STREAM_KEY.log"
PID_FILES_TO_CLEAN+=("$LEGACY_PID_FILE")
echo "📁 Looking for legacy PID file: $LEGACY_PID_FILE"

# Stop FFmpeg forwarding process(es)
echo "🛑 Stopping FFmpeg forwarding processes..."

PROCESSES_KILLED=0

for pid_file in "${PID_FILES_TO_CLEAN[@]}"; do
  if [ -f "$pid_file" ]; then
    pid=$(cat "$pid_file")
    echo "📋 Found PID file: $pid_file with PID: $pid"

    if kill -0 "$pid" 2>/dev/null; then
      echo "🔪 Terminating FFmpeg process $pid"
      kill "$pid"
      PROCESSES_KILLED=$((PROCESSES_KILLED + 1))

      # Wait a moment for graceful shutdown
      sleep 3

      # Check if process is still running and force kill if needed
      if kill -0 "$pid" 2>/dev/null; then
        echo "⚡ Force killing FFmpeg process $pid"
        kill -9 "$pid"
      else
        echo "✅ FFmpeg process $pid terminated gracefully"
      fi
    else
      echo "⚠️  PID $pid from $pid_file is not running"
    fi

    # Clean up PID file
    rm -f "$pid_file"
    echo "🗑️  Removed PID file: $pid_file"
  else
    echo "📭 PID file not found: $pid_file"
  fi
done

# Clean up any remaining FFmpeg processes for this stream (fallback)
echo "🧹 Performing fallback cleanup for any remaining FFmpeg processes..."
REMAINING_PROCESSES=$(pgrep -f "ffmpeg.*$STREAM_KEY" 2>/dev/null || true)

if [ -n "$REMAINING_PROCESSES" ]; then
  echo "⚠️  Found remaining FFmpeg processes: $REMAINING_PROCESSES"
  echo "$REMAINING_PROCESSES" | xargs -r kill -TERM
  sleep 2
  echo "$REMAINING_PROCESSES" | xargs -r kill -9 2>/dev/null || true
  echo "🧹 Forced cleanup completed"
else
  echo "✅ No remaining FFmpeg processes found"
fi

# Clean up temporary files
echo "🗑️  Cleaning up temporary files..."

# Clean up destination temp files
rm -f "/tmp/ffmpeg_destinations_$STREAM_KEY.txt" 2>/dev/null || true

# Clean up log files (optional - keep for debugging)
# rm -f "$SOURCE_LOG_FILE" "$LEGACY_LOG_FILE" 2>/dev/null || true

# Clean up any other temp files
rm -f "/tmp/ffmpeg_${STREAM_KEY}_*.tmp" 2>/dev/null || true

echo "✅ Temporary files cleaned up"

# Log stream end to system log for monitoring
if [ -n "$SOURCE_ID" ] && [ "$SOURCE_ID" != "null" ]; then
  logger -t neustream "Stream ended: key=$STREAM_KEY source_id=$SOURCE_ID processes_killed=$PROCESSES_KILLED"
else
  logger -t neustream "Stream ended: key=$STREAM_KEY legacy=true processes_killed=$PROCESSES_KILLED"
fi

echo "📊 Cleanup Summary:"
echo "  - Processes Killed: $PROCESSES_KILLED"
echo "  - Source ID: ${SOURCE_ID:-Legacy}"
echo "  - Stream Key: $STREAM_KEY"

echo "=== Stream Cleanup Complete ==="
