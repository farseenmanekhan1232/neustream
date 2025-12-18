# Neustream Admin Dashboard

The Admin Dashboard is a restricted access interface for platform administrators to manage the Neustream SaaS instance. It provides tools for user management, subscription oversight, and global system configuration.

## Tech Stack

*   **Framework**: React 19 (Vite)
*   **Language**: JavaScript/JSX (Migration to TypeScript in progress)
*   **UI Library**: Radix UI
*   **Styling**: Tailwind CSS (v3)
*   **State Management**: TanStack Query (React Query)
*   **Icons**: Lucide React
*   **Routing**: React Router v6

## Features

### User & Subscription Management
*   **Users**: View, edit, and ban users.
*   **Subscriptions**: Manage subscription plans (pricing, limits) and view active user subscriptions.

### Stream Operations
*   **Active Streams**: Monitor all currently active streams on the platform.
*   **Destinations**: Global view of connected destination platforms.
*   **Sources**: Manage ingest sources.

### System & Support
*   **Analytics**: System-wide performance and usage metrics.
*   **Contact Messages**: View and manage support (Contact Us) submissions.
*   **Settings**: Global platform configurations.

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn
*   A user account with `is_admin = true` in the `users` database table.

### Installation

1.  Navigate to the admin directory:
    ```bash
    cd admin
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure environment variables:
    Copy `.env.example` to `.env`.
    ```bash
    cp .env.example .env
    ```

### Development

Start the development server:

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:5174` (default Vite port for second app).

### Build

Build for production:

```bash
npm run build
```

## Security Note

This dashboard is protected by an `isAdmin` check in the `AuthProvider`. Ensure your API correctly validates admin privileges for all `/api/admin/*` endpoints to prevent unauthorized access.
