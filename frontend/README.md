# Neustream Frontend

The main user-facing application for Neustream. It allows streamers to sign up, configure their destinations, get their stream keys, and monitor their active streams.

## Tech Stack

*   **Framework**: React 19 (Vite)
*   **Language**: TypeScript
*   **UI Library**: Radix UI
*   **Styling**: Tailwind CSS (v4)
*   **Animation**: Motion (Framer Motion)
*   **State Management**: TanStack Query
*   **Video Player**: hls.js
*   **Analytics**: PostHog
*   **Deployment**: Cloudflare Pages

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
