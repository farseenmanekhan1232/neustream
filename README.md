# Neustream - Multi-Destination Streaming

[![License](https://img.shields.io/github/license/farseenmanekhan1232/neustream)](https://github.com/farseenmanekhan1232/neustream/blob/main/LICENSE)
[![CI/CD](https://github.com/farseenmanekhan1232/neustream/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/farseenmanekhan1232/neustream/actions/workflows/ci-cd.yml)
[![GitHub Issues](https://img.shields.io/github/issues/farseenmanekhan1232/neustream)](https://github.com/farseenmanekhan1232/neustream/issues)
[![GitHub Stars](https://img.shields.io/github/stars/farseenmanekhan1232/neustream?style=social)](https://github.com/farseenmanekhan1232/neustream/stargazers)

<img width="1200" height="630" alt="og" src="https://github.com/user-attachments/assets/469ef6ea-f8be-41fe-998a-a5a5887db153" />

Neustream is a comprehensive, **open-source alternative to platforms like Restream.io, StreamYard, and Castr**. It is designed to simplify broadcasting to multiple platforms simultaneously (e.g., YouTube, Twitch, Facebook) from a single ingestion point, giving you full control over your streaming infrastructure.

## Project Structure

This repository is organized into several components:

*   **[admin](./admin)**: Internal dashboard for platform administration.
    *   *Stack*: React 19, Vite, Tailwind CSS, TanStack Query.
*   **[control-plane](./control-plane)**: The central API backend and orchestration service.
    *   *Stack*: Node.js, Express, PostgreSQL, Redis, Socket.IO, Passport.js.
*   **[frontend](./frontend)**: The public-facing dashboard for streamers.
    *   *Stack*: React 19, Vite, Tailwind CSS v4, Radix UI, Motion.
*   **[media-server](./media-server)**: The high-performance RTMP ingestion and relay engine.
    *   *Stack*: MediaMTX (or NGINX-RTMP), FFmpeg, Shell Scripts.

## Features

*   **Multi-Platform Relay**: Stream to YouTube, Twitch, Facebook, and more from a single OBS connection.
*   **Real-time Monitoring**: Monitor ingestion health and destination delivery status.
*   **User Management**: Dashboard for configuring stream keys and destinations.
*   **Scalable Architecture**: Designed for growth with separation of concerns between control plane and media handling.

## Architecture

Neustream operates on a decoupled architecture to ensure stability and scalability:

1.  **Ingestion**: Streamers send video via OBS/vMix to the **Media Server** (RTMP).
2.  **Authentication**: The Media Server validates the stream key against the **Control Plane** API.
3.  **Forwarding**: Upon successful auth, the Media Server fetches the user's destination config (YouTube, Twitch, etc.) and spawns **FFmpeg** processes to relay the stream.
4.  **Monitoring**: The Frontend connects to the Control Plane via **WebSockets** for real-time status updates and chat aggregation.

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
