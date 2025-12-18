# Neustream Control Plane

The Control Plane is the central backend service for Neustream. It handles user authentication, stream management, payment processing, and orchestration between the frontend and the media server.

## Tech Stack

*   **Runtime**: Node.js
*   **Language**: TypeScript
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **Real-time**: Socket.IO
*   **Authentication**: Passport.js (Google, Twitch OAuth)
*   **Payments**: Razorpay
*   **Communication**: gRPC (for internal services), REST API

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   PostgreSQL
*   Redis (optional, depending on configuration)

### Installation

1.  Navigate to the control-plane directory:
    ```bash
    cd control-plane
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env` and fill in your database credentials, API keys, and other secrets.
    ```bash
    cp .env.example .env
    ```

### Database Migration

Run database migrations to set up the schema:

```bash
npm run migrate:ts
```

### Development

Start the development server with hot-reload:

```bash
npm run dev
```

Or with TypeScript execution directly:

```bash
npm run dev:ts
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Documentation

The API endpoints are organized in the `routes` directory. Key resources include:

*   `/api/auth`: Authentication endpoints
*   `/api/user`: User profile management
*   `/api/streams`: Stream key and ingestion configuration
*   `/api/destinations`: Managing downstream platforms (YouTube, Twitch, etc.)
