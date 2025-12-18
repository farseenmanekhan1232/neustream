# Neustream Media Server

The Media Server is the core streaming engine for Neustream. It handles the ingestion of RTMP streams from OBS (or other encoders) and relays them to multiple destinations (YouTube, Twitch, Facebook, etc.).

It utilizes **MediaMTX** (formerly rtsp-simple-server) or **NGINX-RTMP** for high-performance streaming and custom shell scripts for stream lifecycle management.

## Components

*   **Media Engine**: Handles RTMP/RTMPS ingestion and fan-out.
*   **Lifecycle Scripts**:
    *   `on_stream_ready.sh`: Triggered when a new stream starts. Authenticates the stream key with the Control Plane and retrieves the list of target destinations.
    *   `on_stream_unpublish.sh`: Triggered when a stream ends. Updates the status in the Control Plane.
*   **Configuration**:
    *   `mediamtx.yml`: Configuration file for MediaMTX.
    *   `nginx-media-server.conf`: Alternative configuration for NGINX-RTMP.

## Setup & Usage

### Prerequisites

*   A Linux server (Ubuntu/Debian recommended) or Docker environment.
*   `ffmpeg` installed and available in the system PATH.
*   `curl` for API requests in scripts.

### Configuration

1.  **Environment Variables**:
    Copy `.env.example` to `.env` (or set system environment variables) to configure the callback URLs for the Control Plane.

    ```bash
    cp .env.example .env
    ```

2.  **Scripts Permission**:
    Ensure the shell scripts are executable:

    ```bash
    chmod +x on_stream_ready.sh
    chmod +x on_stream_unpublish.sh
    ```

### Running with MediaMTX

1.  Download the latest release of [MediaMTX](https://github.com/bluenviron/mediamtx).
2.  Place `mediamtx.yml` in the same directory as the binary.
3.  Run the server:
    ```bash
    ./mediamtx
    ```

### Running with NGINX-RTMP

1.  Install NGINX with the RTMP module (`libnginx-mod-rtmp` on Debian/Ubuntu).
2.  Replace the default `nginx.conf` with `nginx-media-server.conf` (or include it).
3.  Reload NGINX:
    ```bash
    sudo systemctl reload nginx
    ```

## How it Works

1.  **Ingestion**: User streams to `rtmp://your-server/live/{stream_key}`.
2.  **Authentication**: The media server triggers `on_stream_ready.sh`.
3.  **Validation**: The script calls the Control Plane API to validate the `{stream_key}`.
4.  **Fan-out**: If valid, the Control Plane returns a list of destination RTMP URLs.
5.  **Relay**: The script (or media server) spawns `ffmpeg` processes to push the stream to each destination.
