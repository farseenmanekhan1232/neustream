# Neustream - Multi-Destination Streaming

[![License](https://img.shields.io/github/license/farseenmanekhan1232/neustream)](https://github.com/farseenmanekhan1232/neustream/blob/main/LICENSE)
[![CI/CD](https://github.com/farseenmanekhan1232/neustream/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/farseenmanekhan1232/neustream/actions/workflows/ci-cd.yml)
[![GitHub Issues](https://img.shields.io/github/issues/farseenmanekhan1232/neustream)](https://github.com/farseenmanekhan1232/neustream/issues)
[![GitHub Stars](https://img.shields.io/github/stars/farseenmanekhan1232/neustream?style=social)](https://github.com/farseenmanekhan1232/neustream/stargazers)

<img width="1200" height="630" alt="og" src="https://github.com/user-attachments/assets/469ef6ea-f8be-41fe-998a-a5a5887db153" />

Neustream is a comprehensive, **open-source alternative to platforms like Restream.io, StreamYard, and Castr**. It is designed to simplify broadcasting to multiple platforms simultaneously (e.g., YouTube, Twitch, Facebook) from a single ingestion point, giving you full control over your streaming infrastructure.

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
    git clone https://github.com/farseenmanekhan1232/neustream.git
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
