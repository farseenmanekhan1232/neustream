# Neustream Admin Dashboard

The Admin Dashboard provides an interface for administrators to manage users, streams, subscriptions, and system configurations.

## Tech Stack

*   **Framework**: React 19 (Vite)
*   **Language**: TypeScript
*   **UI Library**: Radix UI
*   **Styling**: Tailwind CSS
*   **State Management**: TanStack Query (React Query)
*   **Icons**: Lucide React
*   **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm or yarn

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
    Copy `.env.example` to `.env` and update the values.
    ```bash
    cp .env.example .env
    ```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

### Build

Build the application for production:

```bash
npm run build
```

The output will be in the `dist` directory.

### Deployment

This application is configured for deployment on Cloudflare Pages.

```bash
npm run deploy
```
