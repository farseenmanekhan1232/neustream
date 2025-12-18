# Neustream Control Plane

The Control Plane is the brain of the Neustream architecture. It manages user authentication, stream configuration, payment processing, and real-time chat aggregation.

## Tech Stack

*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **Real-time Communication**: Socket.IO & WebSocket
*   **Authentication**: Passport.js (JWT, Google OAuth, Twitch OAuth)
*   **Payments**: Razorpay
*   **Analytics**: PostHog
*   **External APIs**: YouTube Data API, Twitch API (for chat & stats)

## Core Services

### 1. Stream Management
*   **Ingest Auth**: Authenticates incoming streams from the Media Server (`/api/auth/stream`).
*   **Orchestration**: Directs the Media Server where to forward streams based on active configurations (`/api/streams/forwarding/:streamKey`).

### 2. Multi-Platform Chat
*   **Aggregation**: Connects to YouTube Live Chat and Twitch Chat APIs.
*   **Unified Interface**: Merges messages from all platforms into a single WebSocket stream for the Frontend.

### 3. User & Subscription
*   **Management**: Handles user profiles, stream keys, and plan quotas.
*   **Billing**: Manages subscription lifecycles via Razorpay webhooks.

## API Structure

| Route Prefix | Purpose |
|Data|Description|
| `api/auth` | User login/signup (Google, Twitch) |
| `api/streams` | Stream key management & active stream status |
| `api/destinations` | CRUD for destination platforms (YouTube, Twitch, etc.) |
| `api/chat` | Chat history and WebSocket connection details |
| `api/payments` | Razorpay checkout and webhooks |
| `api/admin` | Administrative endpoints (restricted) |

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL (local or cloud)
*   Redis (optional, for session store if configured)

### Installation

1.  Navigate to the directory:
    ```bash
    cd control-plane
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Database Setup**:
    *   Create a Postgres database (e.g., `neustream`).
    *   Copy `.env.example` to `.env` and update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, etc.

4.  **Run Migrations**:
    ```bash
    npm run migrate:ts
    ```

### Development

Start the server in development mode (hot-reload):

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

See `.env.example` for the full list of required variables, including OAuth credentials (Google/Twitch) and Payment keys.
