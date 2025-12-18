# Neustream - Multi-Destination Streaming SaaS

Neustream is a comprehensive multi-destination streaming service designed to simplify broadcasting to multiple platforms simultaneously (e.g., YouTube, Twitch, Facebook) from a single ingestion point.

## Project Structure

This repository is organized into several components:

*   **[admin](./admin)**: The administrative dashboard for managing users, streams, and system configuration. Built with React/Vite.
*   **[control-plane](./control-plane)**: The core backend service managing authentication, stream orchestration, and API endpoints. Built with Node.js/TypeScript.
*   **[frontend](./frontend)**: The main user-facing application for streamers to configure their destinations and monitor streams. Built with React/Vite.
*   **[media-server](./media-server)**: The streaming engine handling RTMP ingest and relay logic. Powered by NGINX-RTMP and custom scripts.

## Features

*   **Multi-Platform Relay**: Stream to YouTube, Twitch, Facebook, and more from a single OBS connection.
*   **Real-time Monitoring**: Monitor ingestion health and destination delivery status.
*   **User Management**: Dashboard for configuring stream keys and destinations.
*   **Scalable Architecture**: Designed for growth with separation of concerns between control plane and media handling.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Docker (optional, for media server)
*   PostgreSQL
*   Redis

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/neustream.git
    cd neustream
    ```

2.  **Setup Environment Variables:**
    Each service has its own `.env.example`. Copy them to `.env` and configure accordingly.
    
    *   `control-plane/.env`
    *   `media-server/.env`
    *   `frontend/.env`
    *   `admin/.env`

3.  **Run Services:**
    Follow the `README.md` in each subdirectory for specific startup instructions.

    *   [Control Plane Instructions](./control-plane/README.md)
    *   [Frontend Instructions](./frontend/README.md)
    *   [Media Server Instructions](./media-server/README.md)

## Documentation

For a detailed technical analysis and architecture overview, please refer to the [Documentation](./docs/documentation.md).

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
