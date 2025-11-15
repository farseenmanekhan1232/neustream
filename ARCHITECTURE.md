# Neustream Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [Infrastructure](#infrastructure)
3. [Architecture Diagram](#architecture-diagram)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Core Components](#core-components)
7. [Database Schema](#database-schema)
8. [API Documentation](#api-documentation)
9. [Deployment Process](#deployment-process)
10. [Security Considerations](#security-considerations)
11. [Scaling Considerations](#scaling-considerations)
12. [Development Workflow](#development-workflow)
13. [Monitoring & Observability](#monitoring--observability)
14. [Future Roadmap](#future-roadmap)

---

## Overview

**Neustream** is a multi-destination streaming platform that enables content creators to stream to multiple platforms simultaneously. The platform supports multi-source streaming, aggregated chat from various platforms, subscription-based access control, and real-time analytics.

### Key Features
- ✅ Multi-source streaming (create multiple stream configurations)
- ✅ Multi-destination streaming (YouTube, Twitch, Facebook, Custom RTMP)
- ✅ Aggregated chat from YouTube and Twitch
- ✅ Real-time stream monitoring
- ✅ Subscription-based access control
- ✅ OAuth authentication (Google, Twitch)
- ✅ Multi-currency support (USD/INR)
- ✅ Payment processing (Razorpay)
- ✅ Global CDN deployment
- ✅ Real-time analytics

---

## Infrastructure

### Current Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│                        CLOUDFLARE CDN                       │
│  ┌─────────────────┐           ┌──────────────────────────┐ │
│  │  Frontend App   │           │     Admin Panel         │ │
│  │ (neustream.app) │           │ (admin.neustream.app)   │ │
│  │                 │           │                          │ │
│  │  React 19 SPA   │           │    React 19 SPA         │ │
│  └─────────────────┘           └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/WSS
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  ORACLE CLOUD INFRASTRUCTURE                 │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         ORACLE CLOUD - VM Instance 1               │   │
│  │  OS: Ubuntu 22.04                                 │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │        Control Plane (API Backend)           │  │   │
│  │  │  ┌────────────────────────────────────────┐  │  │   │
│  │  │  │  • Express.js Server (Port 3000)       │  │  │   │
│  │  │  │  • PostgreSQL Database (Port 5432)     │  │  │   │
│  │  │  │  • WebSocket Server (Port 3000)        │  │  │   │
│  │  │  │  • Nginx Reverse Proxy (Port 80/443)   │  │  │   │
│  │  │  │  • PM2 Process Manager                  │  │  │   │
│  │  │  └────────────────────────────────────────┘  │  │   │
│  │  │                                               │  │   │
│  │  │  Services:                                   │  │   │
│  │  │  • Authentication Service                    │  │   │
│  │  │  • Subscription Service                      │  │   │
│  │  │  • Payment Service (Razorpay)                │  │   │
│  │  │  • Chat Connector Service                    │  │   │
│  │  │  • Email Service                             │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                                                     │   │
│  │  Public Endpoint: api.neustream.app               │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │         ORACLE CLOUD - VM Instance 2               │   │
│  │  OS: Ubuntu 22.04                                 │   │
│  │                                                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │          Media Server                        │  │   │
│  │  │  ┌────────────────────────────────────────┐  │  │   │
│  │  │  │  • MediaMTX v1.8.0 (Stream Processor) │  │  │   │
│  │  │  │  │  - RTMP Ingest: Port 1935          │  │  │   │
│  │  │  │  │  - HLS Playback: Port 8888         │  │  │   │
│  │  │  │  │  - WebRTC: Port 8889               │  │  │   │
│  │  │  │  │  - API: Port 9997                  │  │  │   │
│  │  │  │  └────────────────────────────────────┘  │  │   │
│  │  │  │                                           │  │   │
│  │  │  │  • FFmpeg (Copy Mode - Zero CPU)         │  │   │
│  │  │  │  • Nginx (SSL Termination, HLS Proxy)    │  │   │
│  │  │  │  • PM2 Process Manager                   │  │   │
│  │  │  │  • Stream Lifecycle Hooks                │  │   │
│  │  │  └─────────────────────────────────────────┘  │  │   │
│  │  │                                               │  │   │
│  │  │  Public Endpoints:                           │  │   │
│  │  │  • RTMP: stream.neustream.app:1935          │  │   │
│  │  │  • HLS: stream.neustream.app:8888           │  │   │
│  │  │  • WebRTC: stream.neustream.app:8889        │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Hosting Details

| Service | Platform | Instance | Resources |
|---------|----------|----------|-----------|
| **Frontend** | Cloudflare Pages | Global CDN | Unlimited bandwidth |
| **Admin Panel** | Cloudflare Pages | Global CDN | Unlimited bandwidth |
| **Control Plane** | Oracle Cloud | VM.Standard.A1.Flex | 4 CPU, 24GB RAM, 200GB Storage |
| **Media Server** | Oracle Cloud | VM.Standard.A1.Flex | 4 CPU, 24GB RAM, 200GB Storage |
| **Database** | Oracle Cloud | Control Plane Instance | PostgreSQL 14+ |

**Note**: Both Control Plane and Media Server run on Oracle Cloud Free Tier ARM-based instances.

---

## Architecture Diagram

### High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Frontend   │  │    Admin     │  │  Stream OBS Studio   │ │
│  │  (React SPA) │  │   (React)    │  │  (RTMP Encoder)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘ │
│         │                 │                      │            │
│         └────────┬────────┴──────────────────────┘            │
│                  │                                             │
│                  │ HTTPS/WSS                                   │
└──────────────────┼─────────────────────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────────────────────┐
│                     ORACLE CLOUD (VM Instance 1)                │
│                                                                 │
│  ┌──────────────────┐                  ┌──────────────────┐   │
│  │  Nginx Reverse   │                  │  Express.js API  │   │
│  │  Proxy           │                  │  (Control Plane) │   │
│  │  • SSL Term      │◄────────────────►│  Port: 3000      │   │
│  │  • Rate Limit    │                  │                  │   │
│  └────────┬─────────┘                  └────────┬─────────┘   │
│           │                                     │             │
│           │                                     │             │
│  ┌────────▼────────┐                  ┌─────────▼──────────┐ │
│  │ PostgreSQL DB   │                  │   WebSocket Server│ │
│  │ Port: 5432      │                  │   Port: 3000      │ │
│  │ • User Data     │                  │                   │ │
│  │ • Stream Config │                  │                   │ │
│  │ • Subscriptions │                  │                   │ │
│  │ • Usage Stats   │                  │                   │ │
│  └─────────────────┘                  └───────────────────┘   │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    SERVICES                               │ │
│  │  ┌────────────────┐  ┌──────────────────────────────────┐ │ │
│  │  │ Auth Service   │  │ Chat Connector Service           │ │ │
│  │  │ • JWT Tokens   │  │ • YouTube (TMI.js)              │ │ │
│  │  │ • OAuth        │  │ • Twitch (TMI.js)               │ │ │
│  │  └────────────────┘  │ • gRPC (YouTube API)            │ │ │
│  │                      └──────────────────────────────────┘ │ │
│  │  ┌────────────────┐  ┌──────────────────────────────────┐ │ │
│  │  │ Subscription   │  │ Payment Service                  │ │ │
│  │  │ • Plan Limits  │  │ • Razorpay Integration           │ │ │
│  │  │ • Usage Track  │  │ • Webhook Handler               │ │ │
│  │  └────────────────┘  └──────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
                   │
            HTTPS API Calls
                   │
┌──────────────────▼─────────────────────────────────────────────┐
│                  ORACLE CLOUD (VM Instance 2)                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────────────────────┐   │
│  │  Nginx Media     │  │         MediaMTX                 │   │
│  │  Server          │  │      (Streaming Engine)          │   │
│  │                  │  │                                 │   │
│  │  • HLS Proxy     │◄─┤  RTMP Ingest: 1935             │   │
│  │  • SSL Term      │  │  HLS Playback: 8888             │   │
│  │  • CORS Config   │  │  WebRTC: 8889                   │   │
│  └──────────────────┘  │  Webhook: Control Plane          │   │
│                        └──────────┬───────────────────────┘   │
│                                     │                           │
│                                     │ Stream Processing        │
│                                     │ (Zero-CPU Copy Mode)     │
│                        ┌────────────▼─────────────┐           │
│                        │  FFmpeg Pipeline         │           │
│                        │  • No transcoding        │           │
│                        │  • Direct pass-through   │           │
│                        │  • Multi-destination     │           │
│                        └──────────────────────────┘           │
└────────────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
        ┌───────────▼──────────┐    │    ┌───────────▼──────────┐
        │   YouTube Live       │    │    │     Twitch Live       │
        │   • Stream Key       │    │    │   • Stream Key        │
        │   • Chat API         │    │    │   • Chat IRC          │
        └──────────────────────┘    │    └──────────────────────┘
                                     │
                        ┌───────────▼──────────┐
                        │  Facebook Live       │
                        │  • Stream Key        │
                        └──────────────────────┘
```

### Data Flow

#### Stream Start Flow
```
1. User clicks "Go Live" in Dashboard
2. Frontend → POST /api/streams/active/:sourceId
3. Control Plane → Generate stream session
4. Control Plane → Notify Media Server (webhook)
5. Media Server → Start stream processing
6. Media Server → Notify Control Plane (on_stream_ready)
7. WebSocket → Broadcast stream-status event
8. Frontend → Show live stream preview
```

#### Chat Aggregation Flow
```
YouTube/Twitch Chat
        ↓
Chat Connector Service
        ↓
Parse & Normalize Messages
        ↓
Store in PostgreSQL (chat_messages table)
        ↓
WebSocket Server (real-time)
        ↓
Frontend / Public Chat Clients
```

---

## Technology Stack

### Frontend (React 19 SPA)
```json
{
  "framework": "React 19.2.0",
  "language": "TypeScript 5.x",
  "build_tool": "Vite 7.1.2",
  "ui_library": {
    "primitives": "@radix-ui/*",
    "styling": "Tailwind CSS 4.1.14",
    "icons": "Lucide React"
  },
  "routing": "React Router DOM 7.9.4",
  "state_management": {
    "server_state": "@tanstack/react-query 5.90.2",
    "client_state": "React Context API"
  },
  "http_client": "Axios 1.4.0",
  "websocket": "socket.io-client 4.8.1",
  "payments": "Razorpay 2.9.6",
  "analytics": "PostHog JS 1.275.1",
  "video_player": "HLS.js 1.6.13"
}
```

### Admin Panel (React 19)
```json
{
  "framework": "React 19.2.0",
  "language": "JavaScript (ES2022)",
  "build_tool": "Vite 7.x",
  "styling": "Tailwind CSS",
  "state": "React Context + TanStack Query",
  "charts": "Chart.js (planned)",
  "deployment": "Cloudflare Pages"
}
```

### Control Plane (Node.js API)
```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js 4.18.2",
  "language": "TypeScript 5.x",
  "database": {
    "client": "pg 8.11.3",
    "database": "PostgreSQL 14+",
    "features": ["Connection Pooling", "UUID Extension", "Triggers"]
  },
  "authentication": {
    "strategy": "JWT + OAuth 2.0",
    "providers": ["Google", "Twitch"],
    "library": "Passport.js 0.7.0"
  },
  "websocket": "socket.io 4.8.1",
  "security": {
    "headers": "Helmet.js",
    "password_hash": "bcryptjs 2.4.3",
    "session": "express-session"
  },
  "integrations": {
    "payments": "Razorpay 2.9.6",
    "email": "Nodemailer 6.10.1",
    "youtube_api": "@grpc/grpc-js 1.14.0",
    "twitch_chat": "tmi.js 1.8.5",
    "analytics": "posthog-node 5.9.5"
  },
  "process_manager": "PM2",
  "deployment": "Oracle Cloud VM"
}
```

### Media Server
```json
{
  "streaming_engine": "MediaMTX 1.8.0",
  "transcoding": "FFmpeg (copy mode)",
  "protocols": {
    "ingest": "RTMP (Port 1935)",
    "playback": {
      "hls": "Port 8888",
      "webrtc": "Port 8889"
    }
  },
  "web_server": "Nginx",
  "process_manager": "PM2",
  "hooks": "Bash scripts",
  "deployment": "Oracle Cloud VM"
}
```

### Database Schema
```json
{
  "database": "PostgreSQL 14+",
  "features": {
    "uuid": "uuid-ossp extension",
    "jsonb": "Flexible schema storage",
    "triggers": "Automatic usage tracking",
    "functions": "Business logic"
  }
}
```

### DevOps & Deployment
```json
{
  "ci_cd": "GitHub Actions",
  "hosting": {
    "frontend": "Cloudflare Pages (Global CDN)",
    "backend": "Oracle Cloud VM (Free Tier)",
    "database": "PostgreSQL on VM"
  },
  "domains": {
    "app": "neustream.app",
    "api": "api.neustream.app",
    "media": "stream.neustream.app"
  },
  "ssl": "Let's Encrypt (Auto-renewal)",
  "monitoring": {
    "analytics": "PostHog",
    "logs": "PM2 Logs",
    "health_checks": "GitHub Actions"
  }
}
```

---

## Project Structure

```
neustream/
├── frontend/                          # React SPA (User-facing)
│   ├── src/
│   │   ├── components/                # Reusable UI components
│   │   │   ├── ui/                   # shadcn/ui primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   └── ...
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── stream-preview.tsx
│   │   │   │   ├── source-card.tsx
│   │   │   │   └── ...
│   │   │   ├── settings/             # Settings components
│   │   │   │   ├── profile.tsx
│   │   │   │   ├── subscription.tsx
│   │   │   │   └── ...
│   │   │   ├── docs/                 # Documentation UI
│   │   │   ├── fancy/                # Animated components
│   │   │   └── layout/               # Layout components
│   │   ├── contexts/                 # React Contexts
│   │   │   ├── AuthContext.tsx       # Authentication state
│   │   │   ├── CurrencyContext.tsx   # Multi-currency
│   │   │   └── ThemeContext.tsx      # Theme switching
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useSocket.ts
│   │   │   └── ...
│   │   ├── lib/                      # Utilities
│   │   │   ├── api.ts                # API service layer
│   │   │   ├── utils.ts              # Helper functions
│   │   │   └── config.ts             # App configuration
│   │   ├── pages/                    # Route pages
│   │   │   ├── index.tsx             # Landing page
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   └── register.tsx
│   │   │   └── dashboard/
│   │   │       ├── index.tsx         # Dashboard home
│   │   │       ├── streaming.tsx     # Streaming config
│   │   │       ├── destinations.tsx  # Manage destinations
│   │   │       └── settings.tsx      # User settings
│   │   ├── services/                 # External services
│   │   │   ├── apiService.ts         # HTTP client
│   │   │   ├── socketService.ts      # WebSocket client
│   │   │   └── razorpayService.ts    # Payment integration
│   │   ├── types/                    # TypeScript definitions
│   │   │   ├── auth.ts
│   │   │   ├── stream.ts
│   │   │   └── ...
│   │   ├── constants/                # App constants
│   │   │   ├── api.ts                # API endpoints
│   │   │   └── config.ts             # Environment config
│   │   ├── App.tsx                   # Main app component
│   │   └── main.tsx                  # Entry point
│   ├── public/                       # Static assets
│   ├── vite.config.ts                # Vite configuration
│   ├── tsconfig.json                 # TypeScript config
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── package.json                  # Dependencies
│
├── admin/                            # React SPA (Admin Panel)
│   ├── src/
│   │   ├── components/               # Admin components
│   │   │   ├── dashboard/            # Dashboard widgets
│   │   │   ├── users/                # User management
│   │   │   └── analytics/            # Analytics views
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx       # Admin auth
│   │   ├── pages/
│   │   │   ├── index.tsx             # Admin home
│   │   │   ├── users.tsx             # User list
│   │   │   └── subscriptions.tsx     # Subscription mgmt
│   │   ├── services/
│   │   │   └── apiService.ts         # API client
│   │   └── lib/
│   │       └── utils.ts              # Helpers
│   ├── vite.config.js                # Vite config (JS)
│   └── package.json
│
├── control-plane/                    # Node.js API Backend
│   ├── server.ts                     # Express server entry
│   ├── routes/                       # API route handlers
│   │   ├── auth.ts                   # Auth & OAuth
│   │   ├── streams.ts                # Stream management
│   │   ├── sources.ts                # Multi-source config
│   │   ├── destinations.ts           # Destination mgmt
│   │   ├── subscriptions.ts          # Subscription plans
│   │   ├── payments.ts               # Payment processing
│   │   ├── chat.ts                   # Chat connectors
│   │   ├── admin.ts                  # Admin operations
│   │   ├── blog.ts                   # Blog management
│   │   ├── contact.ts                # Contact form
│   │   └── totp.ts                   # 2FA
│   ├── services/                     # Business logic
│   │   ├── chatConnectorService.ts   # Chat aggregation
│   │   ├── youtubeGrpcService.ts     # YouTube API
│   │   ├── paymentService.ts         # Razorpay
│   │   ├── subscriptionService.ts    # Plan management
│   │   ├── currencyService.ts        # Multi-currency
│   │   ├── emailService.ts           # Email notifications
│   │   ├── posthogService.ts         # Analytics
│   │   └── ...
│   ├── middleware/                   # Express middleware
│   │   ├── auth.ts                   # JWT validation
│   │   ├── planValidation.ts         # Subscription limits
│   │   ├── currencyMiddleware.ts     # Currency detection
│   │   └── idHandler.ts              # UUID/ID conversion
│   ├── lib/                          # Core libraries
│   │   ├── database.ts               # PostgreSQL client
│   │   └── websocket.ts              # Socket.io setup
│   ├── config/                       # Configuration
│   │   └── oauth.ts                  # Passport strategies
│   ├── migrations/                   # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_subscriptions.sql
│   │   ├── 003_multi_source_support.sql
│   │   └── ...
│   ├── types/                        # TypeScript types
│   ├── dist/                         # Compiled JS (build output)
│   ├── .env.example                  # Environment template
│   ├── tsconfig.json
│   └── package.json
│
├── media-server/                     # MediaMTX Streaming Server
│   ├── mediamtx.yml                  # MediaMTX configuration
│   ├── nginx-media-server.conf       # Nginx reverse proxy
│   ├── on_stream_ready.sh            # Stream start hook
│   ├── on_stream_unpublish.sh        # Stream end hook
│   └── scripts/
│       ├── setup.sh                  # Installation script
│       └── health-check.sh           # Health monitoring
│
├── docs/                             # Documentation
│   ├── README.md
│   ├── API.md                        # API reference
│   ├── DEPLOYMENT.md                 # Deployment guide
│   └── ARCHITECTURE.md               # This file
│
├── .github/
│   └── workflows/
│       ├── deploy.yml                # Main CI/CD pipeline
│       └── health-check.yml          # Health monitoring
│
├── .gitignore
├── package.json                      # Root package (dev deps)
└── README.md
```

---

## Core Components

### Frontend Application

#### Authentication Flow
```typescript
// Frontend: AuthContext.tsx
export const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  oauthLogin: (provider: 'google' | 'twitch') => void;
}>({} as any);

// Login flow
const login = async (email: string, password: string) => {
  const response = await apiService.post('/api/auth/login', { email, password });
  const { token, user } = response.data;

  // Store JWT token
  localStorage.setItem('token', token);

  // Set auth header for future requests
  apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;

  // Update context
  setUser(user);
};
```

#### Dashboard Structure
```typescript
// Frontend: pages/dashboard/index.tsx
const Dashboard = () => {
  return (
    <DashboardLayout>
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StreamPreview />
          <QuickStats />
        </TabsContent>

        <TabsContent value="streaming">
          <SourceList />
          <AddSourceForm />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};
```

#### Real-time Stream Monitoring
```typescript
// Frontend: StreamPreview.tsx
const StreamPreview = () => {
  const [streamStatus, setStreamStatus] = useState<'offline' | 'starting' | 'live'>('offline');
  const [source, setSource] = useState<Source | null>(null);

  useEffect(() => {
    // Connect to WebSocket for real-time updates
    const socket = io('https://api.neustream.app');

    socket.on('connect', () => {
      socket.emit('join-stream', sourceId);
    });

    socket.on('stream-status', (status) => {
      setStreamStatus(status);
    });

    return () => socket.disconnect();
  }, [sourceId]);

  return (
    <div className="stream-preview">
      {streamStatus === 'live' ? (
        <HLSPlayer src={`https://stream.neustream.app:8888/${source?.stream_key}/index.m3u8`} />
      ) : (
        <Placeholder>Stream Offline</Placeholder>
      )}
    </div>
  );
};
```

### Control Plane (API Backend)

#### Server Initialization
```typescript
// control-plane/server.ts
const app = express();

// 1. Security middleware
app.use(helmet());
app.use(cors(CORS_CONFIG));
app.use(session(SESSION_CONFIG));

// 2. OAuth setup
passport.use(googleStrategy);
passport.use(twitchStrategy);

// 3. Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 4. Route registration
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamsRoutes);
app.use('/api/sources', sourcesRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// 5. WebSocket server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.FRONTEND_URL }
});

// 6. Start services
const chatService = new ChatConnectorService(io);
const subscriptionCleanup = new SubscriptionCleanupService();

// 7. Start server
httpServer.listen(PORT, () => {
  console.log(`Control Plane running on port ${PORT}`);
});
```

#### Subscription Validation Middleware
```typescript
// control-plane/middleware/planValidation.ts
export const validatePlanLimits = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User;

  try {
    const subscription = await subscriptionService.getUserSubscription(user.id);
    const limits = await subscriptionService.checkLimits(user.id);

    // Check source creation limit
    if (req.method === 'POST' && req.path.includes('/sources')) {
      if (limits.current_sources_count >= limits.max_sources) {
        return res.status(403).json({
          error: 'Source limit reached',
          current: limits.current_sources_count,
          max: limits.max_sources,
          upgrade_url: '/dashboard/subscription'
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate plan limits' });
  }
};
```

#### Chat Connector Service
```typescript
// control-plane/services/chatConnectorService.ts
export class ChatConnectorService {
  private youtubeClients: Map<string, TMI.Client> = new Map();
  private twitchClients: Map<string, TMI.Client> = new Map();

  constructor(private io: Server) {}

  async connectYouTubeChat(sourceId: string, config: YouTubeConfig) {
    const client = new TMI.Client({
      channels: [config.channelId],
      identity: {
        username: config.botUsername,
        password: config.oauthToken
      }
    });

    client.on('message', async (channel, tags, message, self) => {
      await this.storeChatMessage({
        source_id: sourceId,
        connector_id: connectorId,
        author_name: tags['display-name'],
        message_text: message,
        platform: 'youtube'
      });

      // Emit to WebSocket clients
      this.io.to(`source:${sourceId}`).emit('chat-message', {
        author: tags['display-name'],
        message: message,
        platform: 'youtube'
      });
    });

    await client.connect();
    this.youtubeClients.set(sourceId, client);
  }

  async disconnect(sourceId: string) {
    const client = this.youtubeClients.get(sourceId);
    if (client) {
      await client.disconnect();
      this.youtubeClients.delete(sourceId);
    }
  }
}
```

#### Payment Service Integration
```typescript
// control-plane/services/paymentService.ts
export class PaymentService {
  private razorpay: any;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  async createOrder(userId: string, planId: string, billingCycle: 'monthly' | 'yearly') {
    const plan = await database.query('SELECT * FROM subscription_plans WHERE id = $1', [planId]);

    const currency = userCurrency === 'INR' ? 'INR' : 'USD';
    const price = billingCycle === 'yearly' ? plan.price_yearly_inr : plan.price_monthly_inr;

    const order = await this.razorpay.orders.create({
      amount: price * 100, // Paise
      currency,
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: {
        userId,
        planId,
        billingCycle
      }
    });

    return order;
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return expectedSignature === signature;
  }
}
```

### Media Server (MediaMTX)

#### MediaMTX Configuration
```yaml
# media-server/mediamtx.yml
version: 0.0.0

api:
  # API for control plane communication
  address: 0.0.0.0:9997

paths:
  all:
    # Allow all paths (stream keys are paths)
    publish: yes
    read: yes

    # Webhook callbacks to control plane
    publishNotifier:
      type: http
      endpoint: https://api.neustream.app/api/mediamtx/on_stream_ready
      onDemand: yes

    # Webhook for stream end
    readNotifier:
      type: http
      endpoint: https://api.neustream.app/api/mediamtx/on_stream_unpublish
      onDemand: yes

rtmp:
  # RTMP ingest from OBS Studio
  address: 0.0.0.0:1935
  readTimeout: 10s
  writeTimeout: 10s

webrtc:
  # Low-latency WebRTC playback
  address: 0.0.0.0:8889

hls:
  # HTTP Live Streaming (HLS)
  address: 0.0.0.0:8888
  segmentCount: 2
  segmentDuration: 1s
  partDuration: 200ms

# FFmpeg in copy mode (zero CPU transcoding)
ffmpeg: /usr/bin/ffmpeg
  args:
    - -hide_banner
    - -nostdin
    - -fflags
    - +genpts
    - -timeout
    - '5000000'
    - -i
    - '{input}'
    - -c:v
    - copy
    - -c:a
    - copy
    - -f
    - flv
    - '{output}'
```

#### Stream Lifecycle Hooks
```bash
#!/bin/bash
# media-server/on_stream_ready.sh

# Called by MediaMTX when a stream starts
# Args: [PATH] [QUERY]

PATH="${1}"  # This is the stream key
QUERY="${2}"

# Extract source from database using stream_key
SOURCE=$(psql -t -c "SELECT id FROM stream_sources WHERE stream_key = '$PATH';")

# Notify control plane
curl -X POST "https://api.neustream.app/api/mediamtx/stream-started" \
  -H "Content-Type: application/json" \
  -d "{\"source_id\": $SOURCE, \"stream_key\": \"$PATH\"}"

# Broadcast via WebSocket (control plane handles this)
# Start forwarding to destinations (control plane handles this)
```

#### Nginx Reverse Proxy
```nginx
# media-server/nginx-media-server.conf

server {
    listen 443 ssl http2;
    server_name stream.neustream.app;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/stream.neustream.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stream.neustream.app/privkey.pem;

    # HLS Proxy
    location /hls/ {
        proxy_pass http://127.0.0.1:8888/hls/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # CORS for web playback
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range' always;
    }

    # WebRTC
    location /webrtc/ {
        proxy_pass http://127.0.0.1:8889/webrtc/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    display_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    stream_key VARCHAR(255) UNIQUE, -- Legacy single-stream
    oauth_provider VARCHAR(50), -- 'google', 'twitch', NULL
    oauth_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_uuid ON users(uuid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

### Subscription Plans
```sql
CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Free', 'Pro', 'Business'
    description TEXT,
    price_monthly DECIMAL(10, 2),
    price_yearly DECIMAL(10, 2),
    price_monthly_inr DECIMAL(10, 2),
    price_yearly_inr DECIMAL(10, 2),
    max_sources INTEGER NOT NULL, -- 1, 3, 10
    max_destinations INTEGER NOT NULL, -- 3, 10, 9999
    max_streaming_hours_monthly INTEGER NOT NULL, -- 50, 200, 1000
    features JSONB, -- Optional features array
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, price_monthly_inr, price_yearly_inr, max_sources, max_destinations, max_streaming_hours_monthly)
VALUES
    ('Free', 'Get started with streaming', 0, 0, 0, 0, 1, 3, 50),
    ('Pro', 'For regular streamers', 9.99, 99.99, 799, 7999, 3, 10, 200),
    ('Business', 'For professional streamers', 29.99, 299.99, 2499, 24999, 10, 9999, 1000);
```

### User Subscriptions
```sql
CREATE TABLE user_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL, -- 'active', 'canceled', 'past_due'
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly'
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
```

### Stream Sources (Multi-Source Architecture)
```sql
CREATE TABLE stream_sources (
    id SERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    stream_key VARCHAR(255) UNIQUE NOT NULL, -- Unique per source
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stream_sources_user_id ON stream_sources(user_id);
CREATE INDEX idx_stream_sources_key ON stream_sources(stream_key);
```

### Source Destinations
```sql
CREATE TABLE source_destinations (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'youtube', 'twitch', 'facebook', 'custom'
    rtmp_url VARCHAR(500) NOT NULL,
    stream_key VARCHAR(500) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_source_destinations_source_id ON source_destinations(source_id);
CREATE INDEX idx_source_destinations_platform ON source_destinations(platform);
```

### Chat Connectors
```sql
CREATE TABLE chat_connectors (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'youtube', 'twitch', 'facebook'
    config JSONB NOT NULL, -- OAuth tokens, API keys
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_connectors_source_id ON chat_connectors(source_id);
```

### Chat Messages
```sql
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    connector_id INTEGER REFERENCES chat_connectors(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'message', -- 'message', 'system', 'action'
    metadata JSONB, -- Additional message data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_messages_source_id ON chat_messages(source_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

### Usage Tracking
```sql
CREATE TABLE usage_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    source_id INTEGER REFERENCES stream_sources(id) ON DELETE CASCADE,
    stream_start TIMESTAMP NOT NULL,
    stream_end TIMESTAMP,
    duration_minutes INTEGER,
    month_year VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_month ON usage_tracking(month_year);
```

### Plan Limits Tracking (Updated by Triggers)
```sql
CREATE TABLE plan_limits_tracking (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_sources_count INTEGER DEFAULT 0,
    current_destinations_count INTEGER DEFAULT 0,
    current_month_streaming_hours DECIMAL(10, 2) DEFAULT 0,
    current_chat_connectors_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update limits when sources change
CREATE OR REPLACE FUNCTION update_plan_limits_sources()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO plan_limits_tracking (user_id, current_sources_count)
    SELECT user_id, COUNT(*)
    FROM stream_sources
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    GROUP BY user_id
    ON CONFLICT (user_id)
    DO UPDATE SET
        current_sources_count = EXCLUDED.current_sources_count,
        updated_at = CURRENT_TIMESTAMP;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on stream_sources table
CREATE TRIGGER trigger_update_plan_limits_sources
    AFTER INSERT OR DELETE ON stream_sources
    FOR EACH ROW EXECUTE FUNCTION update_plan_limits_sources();
```

---

## API Documentation

### Base URL
```
Production: https://api.neustream.app
Staging: https://staging-api.neustream.app (if configured)
```

### Authentication
Most endpoints require JWT authentication:
```http
Authorization: Bearer <token>
```

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

---

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "display_name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "display_name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

#### Google OAuth Callback
```http
GET /api/auth/google/callback?code=AUTH_CODE
```
Completes OAuth flow and returns JWT.

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "verification_code": "123456"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Get Stream Key (For Legacy Single Stream)
```http
POST /api/auth/stream
Authorization: Bearer <token>

{
  "stream_key": "your_stream_key"
}
```

---

### Stream Endpoints

#### Get Stream Information
```http
GET /api/streams/info
Authorization: Bearer <token>
```

**Response:**
```json
{
  "streams": [
    {
      "id": 1,
      "uuid": "source-uuid",
      "name": "Main Stream",
      "description": "My primary stream",
      "stream_key": "sk_abc123",
      "is_active": false,
      "destinations": [
        {
          "id": 1,
          "platform": "youtube",
          "rtmp_url": "rtmp://a.rtmp.youtube.com/live2/",
          "stream_key": "yt_stream_key",
          "is_active": true
        }
      ],
      "usage": {
        "hours_streamed_today": 2.5,
        "hours_streamed_month": 15.0,
        "hours_limit": 200
      }
    }
  ]
}
```

#### Get Stream Forwarding Destinations
```http
GET /api/streams/forwarding/:streamKey
Authorization: Bearer <token>
```

**Response:**
```json
{
  "destinations": [
    {
      "platform": "youtube",
      "rtmp_url": "rtmp://a.rtmp.youtube.com/live2/",
      "stream_key": "youtube_stream_key"
    },
    {
      "platform": "twitch",
      "rtmp_url": "rtmp://live.twitch.tv/live/",
      "stream_key": "twitch_stream_key"
    }
  ]
}
```

#### Mark Stream as Active
```http
POST /api/streams/active/:sourceId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "starting",
  "stream_key": "sk_abc123",
  "rtmp_url": "rtmp://stream.neustream.app:1935/live",
  "preview_url": "https://stream.neustream.app:8888/sk_abc123/index.m3u8"
}
```

#### End Active Stream
```http
DELETE /api/streams/active/:sourceId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "offline",
  "duration_minutes": 120
}
```

#### Get All Active Streams (Admin Only)
```http
GET /api/streams/active
Authorization: Bearer <admin_token>
```

---

### Sources Endpoints

#### List Sources
```http
GET /api/sources
Authorization: Bearer <token>
```

**Response:**
```json
{
  "sources": [
    {
      "id": 1,
      "uuid": "source-uuid",
      "name": "Main Stream",
      "description": "My primary stream",
      "stream_key": "sk_abc123",
      "is_active": false,
      "destinations_count": 2,
      "chat_connectors_count": 1,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

#### Create Source
```http
POST /api/sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Gaming Stream",
  "description": "My gaming content"
}
```

**Response:**
```json
{
  "source": {
    "id": 2,
    "uuid": "source-uuid-2",
    "name": "Gaming Stream",
    "description": "My gaming content",
    "stream_key": "sk_def456",
    "is_active": false,
    "created_at": "2024-01-15T11:00:00Z"
  },
  "limits": {
    "sources_remaining": 0,
    "destinations_remaining": 8,
    "streaming_hours_remaining": 185
  }
}
```

#### Update Source
```http
PUT /api/sources/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Source
```http
DELETE /api/sources/:id
Authorization: Bearer <token>
```

#### Get Source Destinations
```http
GET /api/sources/:id/destinations
Authorization: Bearer <token>
```

#### Add Destination
```http
POST /api/sources/:id/destinations
Authorization: Bearer <token>
Content-Type: application/json

{
  "platform": "youtube",
  "rtmp_url": "rtmp://a.rtmp.youtube.com/live2/",
  "stream_key": "your_youtube_stream_key"
}
```

**Response:**
```json
{
  "destination": {
    "id": 3,
    "platform": "youtube",
    "rtmp_url": "rtmp://a.rtmp.youtube.com/live2/",
    "stream_key": "your_youtube_stream_key",
    "is_active": true,
    "created_at": "2024-01-15T12:00:00Z"
  }
}
```

#### Remove Destination
```http
DELETE /api/sources/destinations/:id
Authorization: Bearer <token>
```

---

### Subscriptions Endpoints

#### Get Subscription Plans
```http
GET /api/subscriptions/plans
```

**Response:**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Free",
      "description": "Get started with streaming",
      "price_monthly": 0,
      "price_yearly": 0,
      "price_monthly_inr": 0,
      "price_yearly_inr": 0,
      "max_sources": 1,
      "max_destinations": 3,
      "max_streaming_hours_monthly": 50,
      "features": []
    },
    {
      "id": 2,
      "name": "Pro",
      "description": "For regular streamers",
      "price_monthly": 9.99,
      "price_yearly": 99.99,
      "price_monthly_inr": 799,
      "price_yearly_inr": 7999,
      "max_sources": 3,
      "max_destinations": 10,
      "max_streaming_hours_monthly": 200,
      "features": ["priority_support", "analytics"]
    }
  ]
}
```

#### Get My Subscription
```http
GET /api/subscriptions/my-subscription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "subscription": {
    "id": 1,
    "plan": {
      "name": "Pro",
      "max_sources": 3,
      "max_destinations": 10,
      "max_streaming_hours_monthly": 200
    },
    "status": "active",
    "billing_cycle": "monthly",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "cancel_at_period_end": false
  },
  "usage": {
    "sources_used": 2,
    "destinations_used": 6,
    "streaming_hours_used": 45.5
  }
}
```

#### Check Plan Limits
```http
POST /api/subscriptions/check-limits
Authorization: Bearer <token>
Content-Type: application/json

{
  "operation": "create_source"
}
```

**Response:**
```json
{
  "allowed": true,
  "limits": {
    "max_sources": 3,
    "current_sources": 2,
    "sources_remaining": 1
  }
}
```

---

### Payments Endpoints

#### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": 2,
  "billing_cycle": "monthly"
}
```

**Response:**
```json
{
  "order_id": "order_123456789",
  "amount": 79900, // In paise for INR
  "currency": "INR",
  "key_id": "rzp_test_abc123",
  "receipt": "receipt_1_123456"
}
```

#### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": "order_123456789",
  "payment_id": "pay_123456789",
  "signature": "signature_hash"
}
```

#### Razorpay Webhook
```http
POST /api/payments/webhook
X-Razorpay-Signature: signature_hash

{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_123456789",
        "order_id": "order_123456789",
        "amount": 79900,
        "status": "captured"
      }
    }
  }
}
```

---

### Chat Endpoints

#### Get Chat Connectors for Source
```http
GET /api/chat/connectors/:sourceId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "connectors": [
    {
      "id": 1,
      "platform": "youtube",
      "is_active": true,
      "config": {
        "channel_name": "My Channel",
        "connected_at": "2024-01-15T13:00:00Z"
      }
    }
  ]
}
```

#### Create Chat Connector
```http
POST /api/chat/connectors
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_id": 1,
  "platform": "youtube",
  "config": {
    "channel_id": "UC_CHANNEL_ID",
    "bot_username": "mybot",
    "oauth_token": "oauth_token_here"
  }
}
```

#### Remove Chat Connector
```http
DELETE /api/chat/connectors/:id
Authorization: Bearer <token>
```

#### Get Chat Messages
```http
GET /api/chat/messages/:sourceId?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "author_name": "Viewer1",
      "message_text": "Great stream!",
      "platform": "youtube",
      "created_at": "2024-01-15T14:00:00Z"
    }
  ]
}
```

#### Connect YouTube Chat
```http
POST /api/chat/youtube/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_id": 1,
  "channel_id": "UC_CHANNEL_ID",
  "oauth_token": "token"
}
```

#### Connect Twitch Chat
```http
POST /api/chat/twitch/connect
Authorization: Bearer <token>
Content-Type: application/json

{
  "source_id": 1,
  "channel": "mychannel",
  "oauth_token": "oauth_token"
}
```

---

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "stats": {
    "total_users": 1250,
    "active_users_today": 45,
    "total_streams": 2100,
    "active_streams": 12,
    "total_subscriptions": 340,
    "active_subscriptions": 315,
    "monthly_revenue": 25000,
    "streaming_hours_today": 125.5
  }
}
```

#### List All Users
```http
GET /api/admin/users?page=1&limit=50
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "display_name": "John Doe",
      "created_at": "2024-01-01T00:00:00Z",
      "subscription": {
        "plan_name": "Pro",
        "status": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "total_pages": 25
  }
}
```

#### Get All Sources
```http
GET /api/admin/sources
Authorization: Bearer <admin_token>
```

#### Get All Subscriptions
```http
GET /api/admin/subscriptions
Authorization: Bearer <admin_token>
```

#### Update System Settings
```http
PUT /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "maintenance_mode": false,
  "new_registrations_enabled": true
}
```

---

### MediaMTX Webhook Endpoints

#### Stream Started
```http
POST /api/mediamtx/on_stream_ready
Content-Type: application/json

{
  "path": "sk_abc123",
  "query": "param=value"
}
```

#### Stream Ended
```http
POST /api/mediamtx/on_stream_unpublish
Content-Type: application/json

{
  "path": "sk_abc123"
}
```

---

### WebSocket Events

#### Connection
```javascript
const socket = io('https://api.neustream.app', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

#### Join Chat Room
```javascript
socket.emit('join-chat', { sourceId: 1 });
```

#### Send Message to Chat
```javascript
socket.emit('send-message', {
  sourceId: 1,
  message: 'Hello chat!'
});
```

#### Receive Chat Messages
```javascript
socket.on('chat-message', (data) => {
  console.log(`${data.author} (${data.platform}): ${data.message}`);
});
```

#### Stream Status Updates
```javascript
socket.on('stream-status', (status) => {
  console.log('Stream status:', status); // 'starting', 'live', 'offline'
});
```

---

## Deployment Process

### CI/CD Pipeline (GitHub Actions)

#### Main Deployment Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  # Deploy Frontend to Cloudflare Pages
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Build
        run: npm run build
        working-directory: ./frontend
        env:
          VITE_API_URL: https://api.neustream.app

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: neustream
          directoryPath: ./frontend/dist

  # Deploy Admin Panel to Cloudflare Pages
  deploy-admin:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./admin

      - name: Build
        run: npm run build
        working-directory: ./admin

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: neustream-admin
          directoryPath: ./admin/dist

  # Deploy Control Plane to Oracle Cloud
  deploy-control-plane:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci
        working-directory: ./control-plane

      - name: Build TypeScript
        run: npm run build
        working-directory: ./control-plane

      - name: Copy files to server
        uses: appleboy/scp-action@v0.1.5
        with:
          host: ${{ secrets.HOST_CONTROL_PLANE }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_CONTROL_PLANE }}
          source: ./control-plane/dist
          target: /opt/neustream/control-plane

      - name: Run migrations
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST_CONTROL_PLANE }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_CONTROL_PLANE }}
          script: |
            cd /opt/neustream/control-plane
            npm run migrate

      - name: Restart PM2
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST_CONTROL_PLANE }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_CONTROL_PLANE }}
          script: |
            pm2 restart neustream-control-plane

  # Deploy Media Server to Oracle Cloud
  deploy-media-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Copy MediaMTX config
        uses: appleboy/scp-action@v0.1.5
        with:
          host: ${{ secrets.HOST_MEDIA_SERVER }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_MEDIA_SERVER }}
          source: ./media-server/mediamtx.yml
          target: /opt/neustream/media-server

      - name: Copy Nginx config
        uses: appleboy/scp-action@v0.1.5
        with:
          host: ${{ secrets.HOST_MEDIA_SERVER }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_MEDIA_SERVER }}
          source: ./media-server/nginx-media-server.conf
          target: /etc/nginx/sites-available/mediamtx

      - name: Copy hooks
        uses: appleboy/scp-action@v0.1.5
        with:
          host: ${{ secrets.HOST_MEDIA_SERVER }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_MEDIA_SERVER }}
          source: ./media-server/on_stream_*.sh
          target: /opt/neustream/media-server

      - name: Restart MediaMTX
        uses: appleboy/ssh-action@v0.1.5
        with:
          host: ${{ secrets.HOST_MEDIA_SERVER }}
          username: ubuntu
          key: ${{ secrets.SSH_KEY_MEDIA_SERVER }}
          script: |
            chmod +x /opt/neustream/media-server/on_stream_*.sh
            pm2 restart mediamtx
            nginx -t && systemctl reload nginx
```

### Manual Deployment Steps

#### 1. Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export VITE_API_URL=https://api.neustream.app
export VITE_WEBSOCKET_URL=https://api.neustream.app
export VITE_POSTHOG_KEY=your_posthog_key
export VITE_RAZORPAY_KEY_ID=your_razorpay_key

# Build for production
npm run build

# Deploy to Cloudflare Pages
# (Or use Wrangler CLI)
npx wrangler pages deploy dist --project-name=neustream
```

#### 2. Admin Panel Deployment
```bash
cd admin

# Install dependencies
npm install

# Build
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=neustream-admin
```

#### 3. Control Plane Deployment
```bash
# Connect to Oracle Cloud instance
ssh -i ~/.ssh/control-plane-key ubuntu@129.154.252.216

cd /opt/neustream/control-plane

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Build TypeScript
npm run build

# Run database migrations
npm run migrate

# Restart PM2 process
pm2 restart neustream-control-plane

# Check logs
pm2 logs neustream-control-plane
```

#### 4. Media Server Deployment
```bash
# Connect to Oracle Cloud instance
ssh -i ~/.ssh/media-server-key ubuntu@80.225.225.121

# Update MediaMTX binary (if needed)
wget https://github.com/bluenviron/mediamtx/releases/download/v1.8.0/mediamtx_v1.8.0_linux_arm64.tar.gz
sudo tar -xzf mediamtx_v1.8.0_linux_arm64.tar.gz -C /usr/local/bin/

# Copy configurations
sudo cp /opt/neustream/media-server/mediamtx.yml /etc/mediamtx.yml
sudo cp /opt/neustream/media-server/nginx-media-server.conf /etc/nginx/sites-available/mediamtx

# Update hooks
cp /opt/neustream/media-server/on_stream_*.sh /opt/neustream/media-server/
chmod +x /opt/neustream/media-server/on_stream_*.sh

# Restart services
pm2 restart mediamtx
sudo nginx -t && sudo systemctl reload nginx
```

### Database Migrations

#### Running Migrations
```bash
# On control-plane server
cd /opt/neustream/control-plane

# Run all pending migrations
npm run migrate

# Or run specific migration
npm run migrate -- --file 001_initial_schema.sql

# Check migration status
npm run migrate -- --status
```

#### Creating New Migration
```bash
# Generate new migration file
npm run migrate:create add_new_feature

# Edit the SQL file, then run
npm run migrate
```

---

## Security Considerations

### Authentication & Authorization

#### JWT Implementation
```typescript
// Generate JWT
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware validation
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### OAuth Security
- **Google OAuth 2.0**: Uses official Google OAuth flow
- **Twitch OAuth**: Secure token exchange
- **Token Storage**: JWT stored in httpOnly cookies (production) or localStorage (development)
- **Session Management**: express-session for OAuth state management

### Password Security
```typescript
// Hashing password
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Verification
const isValid = await bcrypt.compare(password, passwordHash);
```

### API Security

#### Helmet.js Headers
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.neustream.app", "wss://api.neustream.app"]
    }
  }
}));
```

#### CORS Configuration
```typescript
const CORS_CONFIG = {
  origin: [
    'https://neustream.app',
    'https://admin.neustream.app',
    'http://localhost:3000' // Development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
```

#### Rate Limiting (Recommended Enhancement)
```typescript
// Currently not implemented - recommended addition
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### Database Security

#### Connection Security
```typescript
// PostgreSQL connection with SSL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false // For Oracle Cloud SSL
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});
```

#### SQL Injection Prevention
- ✅ All queries use parameterized statements (`$1`, `$2`)
- ✅ Never interpolate user input directly into SQL
- ✅ Input validation on all endpoints

### Stream Security

#### Stream Key Generation
```typescript
// Generate cryptographically secure stream keys
const streamKey = crypto.randomBytes(32).toString('hex'); // 64 character hex string
```

#### MediaMTX Path Security
```yaml
# Only authenticated users can publish
paths:
  all:
    publish: yes  # Controlled by API, not MediaMTX
    read: yes
    # No anonymous access - all paths are user-specific
```

### SSL/TLS Configuration

#### Nginx SSL (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d stream.neustream.app
sudo certbot --nginx -d api.neustream.app

# Auto-renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Environment Variables Security

#### Required Secrets
```bash
# Control Plane (.env)
JWT_SECRET=your_super_secret_jwt_key_here
DB_PASSWORD=your_database_password
RAZORPAY_KEY_SECRET=your_razorpay_secret
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWITCH_CLIENT_SECRET=your_twitch_client_secret
OAUTH_REDIRECT_URI=https://api.neustream.app/api/auth/google/callback
POSTHOG_PROJECT_API_KEY=your_posthog_key

# Media Server
# No secrets needed - stateless streaming server
```

#### Security Best Practices
1. **Never commit `.env` files** to git
2. **Use strong, unique passwords** for database
3. **Rotate secrets regularly** (quarterly recommended)
4. **Limit database permissions** to application user only
5. **Enable PostgreSQL logging** for audit trails
6. **Regular security updates** on Ubuntu servers
7. **Firewall configuration**: Only allow necessary ports
   - Control Plane: 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Media Server: 22 (SSH), 80 (HTTP), 443 (HTTPS), 1935 (RTMP), 8888 (HLS)

---

## Scaling Considerations

### Current Limitations

| Component | Current Setup | Bottleneck Risk |
|-----------|---------------|-----------------|
| **Frontend** | Cloudflare Pages (CDN) | ✅ Scalable |
| **Admin** | Cloudflare Pages (CDN) | ✅ Scalable |
| **Control Plane** | Single Oracle Cloud VM | ⚠️ CPU/Memory bound |
| **Media Server** | Single Oracle Cloud VM | ⚠️ Bandwidth bound |
| **Database** | PostgreSQL on same VM | ⚠️ I/O bound |

### Scaling Roadmap

#### Phase 1: Immediate Improvements (0-3 months)
**Control Plane Scaling**
- [ ] **Implement Caching**: Redis for session storage and API cache
  ```typescript
  // Example: Cache subscription plans
  const plans = await redis.get('subscription_plans');
  if (!plans) {
    plans = await database.query('SELECT * FROM subscription_plans');
    await redis.setex('subscription_plans', 3600, JSON.stringify(plans));
  }
  ```
- [ ] **Add Redis-backed Rate Limiting**: Prevent API abuse
- [ ] **Optimize Database Queries**: Add missing indexes
  ```sql
  CREATE INDEX CONCURRENTLY idx_usage_tracking_user_month
    ON usage_tracking(user_id, month_year);
  ```
- [ ] **Database Connection Pooling**: Already implemented (max: 20)
- [ ] **API Response Compression**: gzip/Brotli compression
  ```typescript
  app.use(compression());
  ```

#### Phase 2: Medium-term (3-6 months)
**Horizontal Scaling**
- [ ] **Load Balancer**: Distribute control plane requests
  - Use Cloudflare Load Balancer or Nginx upstream
- [ ] **Multiple Control Plane Instances**: 2-3 instances behind LB
- [ ] **Dedicated Database Server**: Separate PostgreSQL from control plane
- [ ] **Message Queue**: RabbitMQ/Kafka for async processing
  ```typescript
  // Queue chat message processing
  await queue.publish('chat-message', {
    sourceId,
    message,
    platform
  });
  ```
- [ ] **CDN for Media**: Cache HLS segments on Cloudflare

#### Phase 3: Long-term (6-12 months)
**Microservices Evolution**
- [ ] **Chat Service**: Separate chat aggregation into its own service
- [ ] **Payment Service**: Dedicated payment processing service
- [ ] **Analytics Service**: Separate analytics ingestion
- [ ] **Stream Processing**: Multi-region streaming (YouTube, Twitch locally)
- [ ] **Database Sharding**: Shard by user_id for large-scale growth

#### Phase 4: Enterprise (12+ months)
**Global Scale**
- [ ] **Multi-region Deployment**: US, EU, Asia regions
- [ ] **Database Replication**: Master-slave PostgreSQL setup
- [ ] **Stream Transcoding**: Custom transcoding for quality options
- [ ] **Advanced Monitoring**: Datadog/New Relic APM
- [ ] **Auto-scaling**: Kubernetes-based orchestration

### Performance Optimization

#### Database Optimization
```sql
-- Already indexed key columns
-- Add composite indexes for common queries
CREATE INDEX idx_messages_source_created
  ON chat_messages(source_id, created_at DESC);

-- Add partial indexes for active records
CREATE INDEX idx_sources_active
  ON stream_sources(user_id)
  WHERE is_active = true;

-- Optimize subscription queries
CREATE INDEX idx_user_subscriptions_active
  ON user_subscriptions(user_id, status)
  WHERE status = 'active';
```

#### Control Plane Optimization
```typescript
// Connection pooling (already implemented)
const pool = new Pool({
  max: 20, // Max 20 connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
});

// Query optimization
const getUserSources = async (userId: number) => {
  // Single query with JOIN instead of N+1
  return await pool.query(`
    SELECT s.*, COUNT(d.id) as destinations_count
    FROM stream_sources s
    LEFT JOIN source_destinations d ON s.id = d.source_id
    WHERE s.user_id = $1
    GROUP BY s.id
  `, [userId]);
};

// Implement database query caching
const getSourcesWithCache = async (userId: number) => {
  const cacheKey = `sources:${userId}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const sources = await getUserSources(userId);
  await redis.setex(cacheKey, 300, JSON.stringify(sources)); // 5 min cache

  return sources;
};
```

#### Media Server Optimization
```yaml
# MediaMTX optimization
rtmp:
  address: 0.0.0.0:1935
  readTimeout: 10s
  writeTimeout: 10s
  # Increase buffer for better quality
  readBufferCount: 1024

hls:
  address: 0.0.0.0:8888
  segmentCount: 2
  segmentDuration: 1s
  partDuration: 200ms  # Lower latency
  # Enable segment encryption for security
  encryption: yes
```

#### Frontend Optimization
```typescript
// Code splitting (already with Vite)
const StreamingPage = lazy(() => import('./pages/StreamingPage'));

// Image optimization
<img
  src={avatarUrl}
  loading="lazy"
  width={48}
  height={48}
  alt="User avatar"
/>

// API response caching with TanStack Query
const { data: sources } = useQuery({
  queryKey: ['sources', userId],
  queryFn: () => apiService.getSources(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000 // 10 minutes
});

// Prefetch critical data
const queryClient = new QueryClient();
queryClient.prefetchQuery({
  queryKey: ['sources', userId],
  queryFn: () => apiService.getSources()
});
```

### Capacity Planning

#### Current Capacity (Oracle Cloud Free Tier)
```
VM Instance: VM.Standard.A1.Flex
- CPU: 4 ARM cores
- RAM: 24GB
- Storage: 200GB Block Volume
- Network: 4 Gbps
```

#### Estimated Capacity

**Control Plane**
- **Users**: ~10,000 active users
- **Concurrent Streams**: ~500 (database + WebSocket bound)
- **Requests/sec**: ~1,000 (before CPU bound)
- **Database Connections**: Max 20 (currently sufficient)

**Media Server**
- **Concurrent Streams**: ~1,000 (bandwidth bound)
  - RTMP Ingest: ~10 Gbps total (10 Mbps per stream)
  - HLS Outbound: ~50 Gbps total (50 Mbps per stream)
- **Bandwidth**: 4 Gbps (current limit)
  - **Sustainable**: ~400 concurrent streams at 10 Mbps each

**Scaling Triggers**
- [ ] Control Plane CPU > 70% for 10+ minutes → Add second instance
- [ ] Database connections > 80% → Optimize queries or add connection pool
- [ ] Media Server bandwidth > 80% → Add edge regions or reduce bitrate
- [ ] Response time > 500ms → Add Redis cache

### Monitoring & Alerts

#### Key Metrics to Monitor
```typescript
// Application metrics
const metrics = {
  // Business metrics
  active_streams: 0,
  total_users: 0,
  revenue: 0,

  // Technical metrics
  api_response_time: 0,
  database_query_time: 0,
  websocket_connections: 0,
  cpu_usage: 0,
  memory_usage: 0,
  disk_usage: 0,
  network_io: 0
};
```

#### Recommended Monitoring Stack
1. **Application Monitoring**: PostHog (already integrated)
2. **Infrastructure Monitoring**:
   - **Option A**: Prometheus + Grafana
   - **Option B**: Oracle Cloud Monitoring (native)
   - **Option C**: Datadog (SaaS)
3. **Log Aggregation**:
   - **Option A**: ELK Stack (Elasticsearch, Logstash, Kibana)
   - **Option B**: Loki + Promtail
   - **Option C**: Cloudflare Logs
4. **Uptime Monitoring**: GitHub Actions health checks (current)
5. **Alerting**: PagerDuty or Slack webhooks

---

## Development Workflow

### Prerequisites
```bash
# Required software
- Node.js 20.x
- PostgreSQL 14+
- Git
- Oracle Cloud CLI (for deployment)
```

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/neustream.git
cd neustream
```

#### 2. Setup Database
```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or
sudo apt install postgresql  # Ubuntu

# Create database
createdb neustream

# Run migrations
cd control-plane
npm install
npm run migrate

# Seed initial data
npm run seed
```

#### 3. Setup Environment Variables
```bash
# control-plane/.env
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_NAME=neustream
DB_USER=your_user
DB_PASSWORD=your_password

JWT_SECRET=dev_jwt_secret_key_change_in_production

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/api/auth/twitch/callback

RAZORPAY_KEY_ID=test_key_id
RAZORPAY_KEY_SECRET=test_key_secret

POSTHOG_PROJECT_API_KEY=your_posthog_key
POSTHOG_HOST=https://us.i.posthog.com
```

#### 4. Run Control Plane
```bash
cd control-plane
npm run dev
# Server at http://localhost:3000
```

#### 5. Setup Media Server (Optional)
```bash
# Install MediaMTX
curl -L https://github.com/bluenviron/mediamtx/releases/download/v1.8.0/mediamtx_v1.8.0_linux_arm64.tar.gz | tar xz
sudo mv mediamtx /usr/local/bin/

# Run locally
mediamtx /path/to/mediamtx.yml
```

#### 6. Run Frontend
```bash
cd frontend
npm install
npm run dev
# App at http://localhost:5173
```

#### 7. Run Admin Panel
```bash
cd admin
npm install
npm run dev
# Admin at http://localhost:5174
```

### Development Workflow

#### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/new-feature-name

# 2. Make changes
# ... write code ...

# 3. Run tests (when implemented)
npm test

# 4. Commit changes
git add .
git commit -m "feat: add new feature"

# 5. Push and create PR
git push origin feature/new-feature-name
# Create PR on GitHub

# 6. After review, merge to main
# CI/CD will automatically deploy
```

#### Code Standards
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier
- **Commits**: Conventional Commits format
  ```
  feat: add new feature
  fix: bug fix
  docs: documentation changes
  style: formatting changes
  refactor: code refactoring
  test: adding tests
  ```

#### API Testing
```bash
# Test API with curl
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Or use Postman/Insomnia
# Import OpenAPI spec (when documented)
```

#### Database Changes
```bash
# Create migration
cd control-plane
npm run migrate:create add_new_table

# Edit migration file
# Run migration
npm run migrate

# Check status
npm run migrate -- --status
```

### Testing Strategy (Recommended)

#### Unit Tests
```bash
# Frontend
cd frontend
npm test
# or
npm run test:watch

# Control Plane
cd control-plane
npm test
```

#### Integration Tests
```typescript
// control-plane/tests/auth.test.ts
describe('Authentication', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

#### End-to-End Tests
```typescript
// frontend/e2e/streaming.spec.ts
describe('Streaming', () => {
  it('should start a stream', async () => {
    await page.goto('http://localhost:5173/dashboard');

    await page.fill('[data-testid=stream-name]', 'Test Stream');
    await page.click('[data-testid=start-stream]');

    await expect(page.locator('[data-testid=stream-status]'))
      .toHaveText('Starting');
  });
});
```

#### Load Testing
```bash
# Install Artillery
npm install -g artillery

# Create load test config
# load-test.yml
config:
  target: 'https://api.neustream.app'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'API Load Test'
    requests:
      - get:
          url: '/api/streams/info'
```

### Debugging

#### Control Plane
```bash
# View logs
pm2 logs neustream-control-plane

# Debug mode
NODE_ENV=development npm run dev

# Database queries
# Enable query logging in PostgreSQL
```

#### Frontend
```bash
# React DevTools
# Install browser extension

# Vite network issues
vite --host 0.0.0.0

# API proxy
# frontend/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

#### WebSocket Debugging
```javascript
// Frontend console
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
socket.on('error', (error) => console.error('WebSocket error', error));
```

---

## Monitoring & Observability

### Current Monitoring Setup

#### PostHog Analytics
```typescript
// Frontend - Page views and events
posthog.capture('$pageview', {
  path: window.location.pathname,
  user_id: user.id
});

// Control Plane - Business events
posthog.capture('stream_started', {
  user_id: user.id,
  source_id: source.id,
  platform: 'youtube'
});
```

#### Health Checks
```bash
# GitHub Actions - Health check workflow
curl -f https://api.neustream.app/health || exit 1
curl -f https://stream.neustream.app:8888/health || exit 1
```

#### PM2 Monitoring
```bash
# View process status
pm2 status

# Monitor resources
pm2 monit

# View logs
pm2 logs neustream-control-plane
pm2 logs mediamtx

# Restart processes
pm2 restart all

# Reload without downtime
pm2 reload neustream-control-plane
```

### Recommended Monitoring Enhancements

#### 1. Application Performance Monitoring (APM)
```typescript
// Example: Datadog integration
import tracer from 'dd-trace';

tracer.init({
  service: 'neustream-control-plane',
  env: process.env.NODE_ENV
});

app.use(tracer.expressMiddleware());
```

#### 2. Structured Logging
```typescript
// control-plane/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user.id, ip: req.ip });
logger.error('Database error', { error: error.message, query: query });
```

#### 3. Metrics Collection
```typescript
// control-plane/lib/metrics.ts
import client from 'prom-client';

// Create metrics
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const activeStreamsGauge = new client.Gauge({
  name: 'active_streams_total',
  help: 'Number of active streams'
});

// Middleware
app.use((req, res, next) => {
  const end = httpRequestsTotal.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.route?.path, status: res.statusCode });
  });
  next();
});
```

#### 4. Alerting Configuration
```yaml
# alerting.yml
groups:
  - name: neustream
    rules:
      - alert: HighAPIResponseTime
        expr: http_request_duration_seconds{quantile="0.95"} > 0.5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "API response time is high"

      - alert: HighCPUUsage
        expr: cpu_usage_percent > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU usage is above 80%"

      - alert: DatabaseDown
        expr: database_connections_active == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database appears to be down"
```

#### 5. Log Aggregation
```typescript
// Send logs to ELK stack or cloud service
import { client } from '@elastic/elasticsearch';

const es = new Client({
  node: process.env.ELASTICSEARCH_URL
});

// In request handler
app.use(async (req, res, next) => {
  await es.index({
    index: 'neustream-logs',
    document: {
      timestamp: new Date(),
      level: 'info',
      message: 'API request',
      userId: req.user?.id,
      ip: req.ip,
      method: req.method,
      path: req.path,
      status: res.statusCode
    }
  });
  next();
});
```

### Dashboard Recommendations

#### Grafana Dashboard (if using Prometheus)
```json
{
  "dashboard": {
    "title": "Neustream Monitoring",
    "panels": [
      {
        "title": "Active Streams",
        "type": "stat",
        "targets": [{ "expr": "active_streams_total" }]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [{ "expr": "http_request_duration_seconds" }]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "targets": [{ "expr": "cpu_usage_percent" }]
      },
      {
        "title": "Database Connections",
        "type": "graph",
        "targets": [{ "expr": "database_connections_active" }]
      }
    ]
  }
}
```

### SLA Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Uptime** | 99.9% | Monthly |
| **API Response Time** | < 200ms (95th percentile) | Real-time |
| **Stream Start Time** | < 3 seconds | Real-time |
| **WebSocket Latency** | < 100ms | Real-time |
| **Database Query Time** | < 50ms (average) | Real-time |
| **HLS Latency** | < 3 seconds | Real-time |

---

## Future Roadmap

### Short-term Goals (Next 3 Months)

#### 1. Infrastructure Hardening
- [ ] **Redis Cache Implementation**
  - Session storage
  - API response caching
  - Rate limiting
  - Estimated effort: 2 weeks

- [ ] **Comprehensive Testing Suite**
  - Unit tests (Jest/Vitest)
  - Integration tests
  - E2E tests (Playwright)
  - Estimated effort: 4 weeks

- [ ] **API Documentation**
  - OpenAPI/Swagger specification
  - Postman collection
  - Interactive API docs
  - Estimated effort: 1 week

- [ ] **Enhanced Monitoring**
  - Prometheus + Grafana setup
  - Log aggregation (ELK or Loki)
  - Custom dashboards
  - Estimated effort: 2 weeks

#### 2. Feature Enhancements
- [ ] **Stream Recording**
  - Save streams to cloud storage (S3/Cloudflare R2)
  - Playback functionality
  - Estimated effort: 3 weeks

- [ ] **Advanced Chat Features**
  - Chat filters/moderation
  - Emote support
  - Chat commands
  - Estimated effort: 2 weeks

- [ ] **Analytics Dashboard**
  - Viewer count tracking
  - Stream performance metrics
  - Revenue analytics
  - Estimated effort: 3 weeks

### Medium-term Goals (3-6 Months)

#### 1. Scalability Improvements
- [ ] **Load Balancer Setup**
  - Cloudflare Load Balancer or Nginx upstream
  - Multiple control plane instances
  - Estimated effort: 2 weeks

- [ ] **Dedicated Database**
  - Separate PostgreSQL instance
  - Read replicas for analytics
  - Automated backups
  - Estimated effort: 1 week

- [ ] **Message Queue Implementation**
  - RabbitMQ/Kafka for async tasks
  - Chat message queuing
  - Email queue
  - Estimated effort: 3 weeks

#### 2. New Platforms
- [ ] **Additional Streaming Destinations**
  - Kick.com
  - Rumble
  - Custom RTMP (already supported)
  - Estimated effort: 2 weeks per platform

- [ ] **Additional Chat Platforms**
  - Discord
  - Facebook Gaming
  - TikTok Live
  - Estimated effort: 3 weeks per platform

#### 3. Mobile & Desktop Apps
- [ ] **React Native Mobile App**
  - Stream monitoring
  - Chat viewing
  - Account management
  - Estimated effort: 8 weeks

- [ ] **Electron Desktop App**
  - Native stream management
  - OBS integration
  - Estimated effort: 6 weeks

### Long-term Goals (6-12 Months)

#### 1. Microservices Architecture
- [ ] **Chat Service** (Independent microservice)
  - Dedicated chat aggregation service
  - Horizontal scaling
  - Estimated effort: 4 weeks

- [ ] **Payment Service** (Independent microservice)
  - Dedicated payment processing
  - Multiple payment gateways
  - Estimated effort: 3 weeks

- [ ] **Analytics Service** (Independent microservice)
  - Real-time analytics pipeline
  - Data warehouse integration
  - Estimated effort: 4 weeks

#### 2. Advanced Streaming Features
- [ ] **Multi-region Streaming**
  - Edge locations (US, EU, Asia)
  - Geographic routing
  - Estimated effort: 6 weeks

- [ ] **Custom Transcoding**
  - Quality options (1080p, 720p, 480p)
  - Adaptive bitrate streaming
  - Estimated effort: 8 weeks

- [ ] **WebRTC Low-latency**
  - Sub-second latency for interactive streams
  - WebRTC-based chat overlay
  - Estimated effort: 6 weeks

#### 3. AI/ML Integration
- [ ] **Auto Moderation**
  - AI-powered chat moderation
  - Spam detection
  - Estimated effort: 8 weeks

- [ ] **Stream Optimization**
  - Automatic quality adjustment
  - Bandwidth optimization
  - Estimated effort: 6 weeks

- [ ] **Content Recommendations**
  - Suggest optimal streaming times
  - Platform recommendations
  - Estimated effort: 8 weeks

### Enterprise Features (12+ Months)

#### 1. White-label Solution
- [ ] **Multi-tenant Architecture**
  - Organization management
  - Custom branding
  - Estimated effort: 12 weeks

#### 2. Advanced Analytics
- [ ] **Business Intelligence**
  - Custom report builder
  - Data export (CSV, PDF)
  - Scheduled reports
  - Estimated effort: 10 weeks

#### 3. Enterprise Integrations
- [ ] **CRM Integration**
  - Salesforce
  - HubSpot
  - Estimated effort: 6 weeks

- [ ] **SSO Integration**
  - SAML 2.0
  - Active Directory
  - Okta
  - Estimated effort: 4 weeks

### Success Metrics

| Metric | Current | 3 Months | 6 Months | 12 Months |
|--------|---------|----------|----------|-----------|
| **Active Users** | ~1,000 | 5,000 | 15,000 | 50,000 |
| **Concurrent Streams** | ~50 | 200 | 500 | 1,500 |
| **Monthly Revenue** | $25K | $50K | $150K | $500K |
| **API Response Time** | 200ms | 150ms | 100ms | 100ms |
| **Uptime** | 99.5% | 99.9% | 99.95% | 99.99% |
| **Support Tickets** | ~100/mo | <50/mo | <20/mo | <10/mo |

---

## Conclusion

Neustream is a well-architected, modern streaming platform built with scalability, security, and user experience in mind. The current implementation provides:

✅ **Solid Foundation**: Multi-source streaming, real-time chat aggregation, subscription management
✅ **Production-Ready**: OAuth authentication, payment processing, global CDN deployment
✅ **Scalable Architecture**: Microservices-ready, clear separation of concerns
✅ **Modern Stack**: React 19, TypeScript, PostgreSQL, MediaMTX

### Key Strengths
1. **Clean Architecture**: Clear separation between presentation, business logic, and media processing
2. **Multi-Source Design**: Future-proof architecture for multiple stream configurations
3. **Real-time Everything**: WebSocket integration for live updates
4. **Subscription-Based**: Robust plan enforcement with database triggers
5. **Security First**: JWT, OAuth, bcrypt, HTTPS everywhere

### Next Steps
1. **Add Infrastructure Monitoring** (Prometheus + Grafana)
2. **Implement Redis Caching** for performance
3. **Create Comprehensive Test Suite** for reliability
4. **Document API** with OpenAPI/Swagger
5. **Plan Horizontal Scaling** for growth

The platform is well-positioned for rapid growth and feature expansion. The codebase quality is high, and the architecture will support scaling to thousands of concurrent users and beyond.

---

## Appendix

### A. Environment Variables Reference

#### Frontend (.env)
```bash
VITE_API_URL=https://api.neustream.app
VITE_WEBSOCKET_URL=https://api.neustream.app
VITE_POSTHOG_KEY=phc_...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

#### Admin (.env)
```bash
VITE_API_URL=https://api.neustream.app
VITE_POSTHOG_KEY=phc_...
```

#### Control Plane (.env)
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://neustream.app

DB_HOST=localhost
DB_PORT=5432
DB_NAME=neustream
DB_USER=neustream_user
DB_PASSWORD=secure_password_here

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://api.neustream.app/api/auth/google/callback

# Twitch OAuth
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_REDIRECT_URI=https://api.neustream.app/api/auth/twitch/callback

# Razorpay
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# PostHog
POSTHOG_PROJECT_API_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com

# MediaMTX Webhook
MEDIAMTX_API_URL=http://localhost:9997
MEDIAMTX_API_USER=admin
MEDIAMTX_API_PASS=secure_password

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### B. Port Reference

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Control Plane | 3000 | 443 | API + WebSocket |
| PostgreSQL | 5432 | Internal only | Database |
| MediaMTX API | 9997 | Internal only | Media server management |
| MediaMTX RTMP | 1935 | 1935 | Stream ingest |
| MediaMTX HLS | 8888 | 443 | Stream playback |
| MediaMTX WebRTC | 8889 | 443 | Low-latency playback |
| Nginx (Control) | 80, 443 | 80, 443 | Reverse proxy |
| Nginx (Media) | 80, 443 | 80, 443 | Reverse proxy |

### C. Database Connection Pool Configuration

```typescript
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20,              // Maximum number of clients
  min: 5,               // Minimum number of clients
  idleTimeoutMillis: 30000,  // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000,  // Return error after 2 seconds if connection could not be established
  maxUses: 7500,        // Close (and replace) a connection after it has been used 7500 times
});
```

### D. WebSocket Event Reference

```typescript
// Client to Server Events
interface ClientToServerEvents {
  'join-chat': (data: { sourceId: number }) => void;
  'leave-chat': (data: { sourceId: number }) => void;
  'send-message': (data: { sourceId: number; message: string }) => void;
  'join-stream': (data: { sourceId: number }) => void;
  'leave-stream': (data: { sourceId: number }) => void;
}

// Server to Client Events
interface ServerToClientEvents {
  'chat-message': (data: {
    id: number;
    author_name: string;
    message_text: string;
    platform: string;
    created_at: string;
  }) => void;
  'stream-status': (status: 'starting' | 'live' | 'offline') => void;
  'stream-ended': (data: { sourceId: number; duration_minutes: number }) => void;
  'error': (error: { message: string }) => void;
}
```

### E. MediaMTX Stream Configuration

```yaml
# per-source path configuration (dynamic)
paths:
  sk_{stream_key}:  # Example: sk_abc123
    publish: yes
    read: yes

    # Enable HLS playback
    hls: yes
    hlsAddress: :8888

    # Enable WebRTC playback
    webrtc: yes
    webrtcAddress: :8889

    # Source for forwarding (configured per stream)
    source: rtmp://{rtmp_url}/{stream_key}

    # Webhooks
    publishNotifier:
      type: http
      endpoint: https://api.neustream.app/api/mediamtx/stream-ready
    readNotifier:
      type: http
      endpoint: https://api.neustream.app/api/mediamtx/stream-ended
```

### F. Rate Limiting Recommendations

#### API Rate Limits (Recommended)
```
Authentication endpoints: 5 requests/minute per IP
General API endpoints: 100 requests/minute per user
Payment endpoints: 10 requests/minute per user
WebSocket connections: 5 connections per user
```

#### Implementation
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' }
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

---

**Document Version**: 1.0
**Last Updated**: 2024-11-15
**Maintained By**: Neustream Engineering Team
**Contact**: engineering@neustream.app