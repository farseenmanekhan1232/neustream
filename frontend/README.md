# Neustream Frontend

The main user-facing application for Neustream. It provides a comprehensive interface for streamers to manage their multi-destination broadcasts, view analytics, and configure platform settings.

## Tech Stack

*   **Framework**: React 19 (Vite)
*   **Language**: TypeScript
*   **UI Library**: Radix UI
*   **Styling**: Tailwind CSS (v4)
*   **Animation**: Motion (Framer Motion)
*   **State Management**: TanStack Query (React Query)
*   **Video Player**: hls.js (for stream preview)
*   **Analytics**: PostHog
*   **Routing**: React Router v7
*   **Deployment**: Cloudflare Pages

## Project Structure

*   `src/pages`: Public pages (Landing, Blog, Alternatives) and Guides.
*   `src/components`: Reusable UI components and Dashboard widgets.
*   `src/components/dashboard`: Dashboard specific layouts and components.
*   `src/contexts`: Global state providers (Auth, Theme).
*   `src/hooks`: Custom React hooks (e.g., `usePostHog`).

## Features

### Public Facing
*   **Landing Page**: Product overview and features.
*   **Platform Guides**: Detailed setup guides for streaming to 30+ platforms (YouTube, Twitch, Kick, etc.).
*   **Alternatives Pages**: Comparison pages for Restream, StreamYard, OBS Live, etc.
*   **Blog**: Content management and display.

### Streamer Dashboard
*   **Stream Preview**: Real-time HLS video player to monitor the active stream.
*   **Destination Management**: Add/Remove RTMP destinations (YouTube, Twitch, Custom RTMP).
*   **Streaming Configuration**: Get persistent stream keys and ingest URLs.
*   **Analytics**: View stream health and viewer stats.
*   **Subscription**: Manage billing and plan upgrades.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn

### Installation

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env` and update the values.
    ```bash
    cp .env.example .env
    ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Build

Build the application for production:

```bash
npm run build
```

### Deployment

This application is configured for deployment on Cloudflare Pages using Wrangler.

```bash
npm run deploy
```
