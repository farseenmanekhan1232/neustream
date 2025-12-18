# Neustream Media Server

The Media Server is the high-performance streaming engine for Neustream. It handles RTMP ingestion, authentication, and multi-destination relaying using **MediaMTX** and **FFmpeg**.

## Architecture

The media server is designed to be lightweight and stateless. It relies on the Control Plane for authentication and configuration.

### Streaming Flow

1.  **Ingest**: User streams from OBS to `rtmp://current-server-ip/live/{stream_key}`.
2.  **Trigger**: MediaMTX receives the stream and triggers `on_stream_ready.sh`.
3.  **Authentication**:
    *   Script calls `POST /api/auth/stream` on the Control Plane.
    *   If invalid, the script exits with error, and MediaMTX rejects the connection.
4.  **Configuration Fetch**:
    *   Script calls `GET /api/streams/forwarding/{stream_key}`.
    *   Control Plane returns JSON with a list of destination RTMP URLs (YouTube, Twitch, etc.).
5.  **Fan-out (Relay)**:
    *   The script spawns a detached `ffmpeg` process.
    *   FFmpeg pulls the local stream and pushes it to all target destinations simultaneously using `-c copy` (zero transcoding) for minimal CPU usage.
6.  **Cleanup**:
    *   When the stream stops, `on_stream_unpublish.sh` is triggered.
    *   It kills the specific FFmpeg process associated with that stream ID and notifies the Control Plane.

## Prerequisites

*   **OS**: Linux (Ubuntu 20.04+ / Debian 11+ recommended)
*   **Media Server**: [MediaMTX](https://github.com/bluenviron/mediamtx) (v1.0+)
*   **Utilities**:
    *   `ffmpeg` (must be in system PATH)
    *   `curl` (for API requests)
    *   `jq` (for JSON parsing)

## Installation & Setup

1.  **Install Dependencies**:
    ```bash
    apt-get update && apt-get install -y ffmpeg curl jq
    ```

2.  **Configure Environment**:
    *   Copy `.env.example` to `.env`.
    *   Ensure the `CONTROL_PLANE_URL` points to your deployed backend (e.g., `https://api.neustream.app`).

3.  **Install MediaMTX**:
    *   Download the binary from the [official releases](https://github.com/bluenviron/mediamtx/releases).
    *   Place it in `/opt/neustream/` (or your preferred directory).

4.  **Configuration**:
    *   Copy `mediamtx.yml` to the same directory as the binary.
    *   Verify the paths in `mediamtx.yml` point to the correct location of your scripts:
        ```yaml
        runOnReady: /opt/neustream/on_stream_ready.sh $MTX_PATH
        ```

5.  **Scripts**:
    *   Copy `on_stream_ready.sh` and `on_stream_unpublish.sh` to `/opt/neustream/`.
    *   Make them executable:
        ```bash
        chmod +x /opt/neustream/*.sh
        ```

6.  **Run Server**:
    ```bash
    ./mediamtx
    ```

## Scripts Overview

*   **`on_stream_ready.sh`**: Authenticates stream, fetches destinations, starts FFmpeg relay.
*   **`on_stream_unpublish.sh`**: cleans up resources and updates stream status.
