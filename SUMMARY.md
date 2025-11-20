# neustream - Complete Architecture Summary

## 🎯 Overview

neustream is a comprehensive multi-destination streaming platform that enables content creators to broadcast their live streams simultaneously to multiple platforms. The architecture follows a microservices pattern with dedicated services for control plane operations, media streaming, user interfaces, and platform integrations.

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Admin Panel   │    │  Public Chat    │
│  (React 19)     │    │  (React 19)     │    │   Integration   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Cloudflare CDN/Proxy   │
                    │   (Global Distribution)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      Nginx Reverse        │
                    │        Proxy (SSL)        │
                    └─────────────┬─────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐
│   Control Plane    │ │    Media Server    │ │    PostgreSQL     │
│   (Node.js API)    │ │   (MediaMTX)       │ │     Database      │
│     Port 3000      │ │  RTMP/HLS/WebRTC   │ │     Port 5432     │
└────────────────────┘ └────────────────────┘ └────────────────────┘
```

## 🔧 Core Components

### 1. Control Plane (`/control-plane/`)

**Technology Stack:**
- **Runtime**: Node.js 18+ with Express.js
- **Database**: PostgreSQL with advanced migrations
- **Authentication**: Passport.js (Google OAuth, Twitch OAuth)
- **Real-time**: Socket.io for WebSocket connections
- **Analytics**: PostHog integration
- **Security**: Helmet.js, JWT tokens, session management

**Key Services:**
- `youtubeGrpcService.js` - YouTube platform integration via gRPC
- `chatConnectorService.js` - Real-time chat message routing
- `paymentService.js` - Razorpay payment processing
- `subscriptionService.js` - Subscription management
- `currencyService.js` - Multi-currency support with auto-detection
- `locationService.js` - Geolocation and IP-based services
- `posthog.js` - Analytics tracking

**API Routes:**
- `/api/auth` - Authentication and OAuth handling
- `/api/streams` - Stream management and lifecycle
- `/api/sources` - Multi-source stream management
- `/api/destinations` - Platform destination configuration
- `/api/payments` - Payment processing and webhooks
- `/api/subscriptions` - Subscription plan management
- `/api/admin` - Administrative operations
- `/api/chat` - Real-time chat message handling

**Security Features:**
- JWT-based authentication with refresh tokens
- OAuth 2.0 integration for social platforms
- CORS configuration for cross-origin requests
- Rate limiting and request validation
- Session management with secure cookies
- Environment-based secret management

### 2. Media Server (`/media-server/`)

**Technology Stack:**
- **Core Engine**: MediaMTX (formerly RTMP Simple Server)
- **Protocols**: RTMP (1935), HLS (8888), WebRTC (8889)
- **API Server**: Built-in REST API on port 9997
- **Process Management**: PM2 for production deployment

**Key Features:**
- **Multi-Protocol Support**: RTMP ingest, HLS delivery, WebRTC low-latency
- **Stream Lifecycle**: Automated hooks for stream start/end events
- **Control Plane Integration**: Real-time API communication
- **Scalable Architecture**: Horizontal scaling support
- **Monitoring**: Built-in metrics and health checks

**Configuration:**
- Custom MediaMTX configuration (`mediamtx.yml`)
- Automated stream lifecycle scripts
- Nginx reverse proxy for SSL termination
- Firewall configuration for streaming ports

### 3. Frontend Applications

#### Main Frontend (`/frontend/`)
**Technology Stack:**
- **Framework**: React 19 with Vite build system
- **UI Library**: Radix UI + Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM v7
- **Real-time**: Socket.io client integration
- **Payment**: Razorpay SDK integration

**Key Features:**
- Multi-source stream management
- Real-time stream preview and monitoring
- Subscription management and billing
- Platform destination configuration
- Analytics dashboard (planned)
- Responsive design with dark mode support

#### Admin Panel (`/admin/`)
**Technology Stack:**
- Same stack as main frontend
- Additional admin-specific components
- User management interface
- System monitoring and analytics

### 4. Database Architecture

**Database Schema:**
- **Users**: Authentication and profile management
- **Stream Sources**: Multi-source streaming support
- **Destinations**: Platform-specific streaming targets
- **Subscriptions**: Tiered pricing plans with usage tracking
- **Payments**: Transaction history and webhooks
- **Chat Messages**: Real-time chat storage and retrieval
- **Currency Support**: Multi-currency pricing and localization
- **Analytics**: Usage metrics and performance data

**Migration System:**
- Automated schema migrations with rollback support
- Plan-based feature limits with automated tracking
- Usage monitoring and quota enforcement
- Currency conversion and localization support

## 🌐 Platform Integrations

### Streaming Platforms
1. **YouTube**
   - gRPC-based API integration
   - Live stream creation and management
   - Chat message retrieval and forwarding

2. **Twitch**
   - OAuth 2.0 authentication
   - TMI.js for chat integration
   - Stream key management

3. **Instagram**
   - Facebook Graph API integration
   - Live video API for streaming
   - OAuth-based authentication

4. **Facebook**
   - RTMP streaming support
   - Live API integration
   - Page and group management

### Payment Processing
- **Razorpay**: Primary payment processor
- **Multi-currency**: USD, INR with auto-detection
- **Subscription Models**: Monthly, yearly billing cycles
- **Webhook Handling**: Secure payment event processing

### Analytics & Monitoring
- **PostHog**: Product analytics and user tracking
- **Custom Metrics**: Stream performance and usage
- **Health Checks**: Automated system monitoring
- **Error Tracking**: Comprehensive error logging

## 🚀 Deployment Architecture

### Infrastructure
- **Control Plane**: Oracle Cloud (Ubuntu 22.04)
- **Media Server**: Dedicated streaming server
- **Frontend**: Cloudflare Pages (Global CDN)
- **Database**: PostgreSQL on control plane server
- **Domain Management**: Hostinger with SSL certificates

### CI/CD Pipeline
- **GitHub Actions**: Automated deployment workflows
- **Multi-stage Deployment**: Separate deployments for each service
- **Health Checks**: Automated verification after deployment
- **Rollback Support**: Quick rollback capabilities

### Security & Performance
- **SSL/TLS**: Full encryption across all services
- **CDN**: Global content delivery via Cloudflare
- **Firewall**: Configured ports for streaming protocols
- **Process Management**: PM2 for production stability
- **Monitoring**: Real-time system and application monitoring

## 💳 Business Model

### Subscription Tiers
1. **Free Plan**
   - 1 stream source
   - 3 destinations
   - 50 hours streaming/month
   - Basic analytics

2. **Pro Plan ($19/month)**
   - 3 stream sources
   - 10 destinations
   - 200 hours streaming/month
   - Advanced analytics
   - Priority support

3. **Business Plan ($49/month)**
   - 10 stream sources
   - Unlimited destinations
   - 1000 hours streaming/month
   - Enterprise analytics
   - API access
   - Dedicated support

### Revenue Streams
- Monthly subscription fees
- Annual subscription discounts
- Pay-as-you-go overage charges
- Platform integration fees (future)

## 🔒 Security Considerations

### Authentication & Authorization
- OAuth 2.0 for third-party platform integration
- JWT-based session management
- Secure credential storage
- Role-based access control (admin/user)

### Data Protection
- Encrypted data transmission (HTTPS/WSS)
- Secure API key management
- GDPR compliance considerations
- User data privacy controls

### Infrastructure Security
- Firewall configuration
- SSL certificate management
- Secure server configurations
- Regular security updates

## 📊 Technical Specifications

### Performance Requirements
- **Concurrent Streams**: Support for 1000+ simultaneous streams
- **Latency**: Sub-2-second latency for WebRTC
- **Uptime**: 99.9% availability target
- **Scalability**: Horizontal scaling support

### Monitoring & Observability
- Real-time stream health monitoring
- Performance metrics collection
- Error tracking and alerting
- User behavior analytics

### Backup & Recovery
- Database backups and point-in-time recovery
- Configuration version control
- Disaster recovery procedures
- Service redundancy planning

## 🔮 Future Enhancements

### Planned Features
1. **Advanced Analytics**
   - Viewer engagement metrics
   - Stream performance analytics
   - Revenue tracking dashboards

2. **Platform Expansions**
   - Additional streaming platforms (TikTok, LinkedIn)
   - Social media integration
   - Custom RTMP destinations

3. **Enterprise Features**
   - White-label solutions
   - API access for developers
   - Custom integrations

4. **Mobile Applications**
   - iOS and Android apps
   - Mobile streaming capabilities
   - Push notifications

### Technical Improvements
1. **Performance Optimizations**
   - Edge computing integration
   - Adaptive bitrate streaming
   - CDN optimizations

2. **Security Enhancements**
   - Advanced fraud detection
   - Content protection (DRM)
   - Enhanced monitoring

3. **Scalability Improvements**
   - Microservices architecture
   - Container orchestration (Kubernetes)
   - Auto-scaling capabilities

## 📚 Development Guidelines

### Code Quality
- ESLint configuration for consistent code style
- TypeScript support for type safety
- Comprehensive testing strategies
- Code review processes

### Best Practices
- RESTful API design principles
- Database optimization techniques
- Security-first development approach
- Performance monitoring integration

### Documentation
- API documentation with OpenAPI/Swagger
- Developer guides and tutorials
- Deployment documentation
- Troubleshooting guides

---

## 🎯 Conclusion

neustream represents a modern, scalable approach to multi-platform streaming with a focus on reliability, performance, and user experience. The architecture is designed to handle growth while maintaining security and performance standards. The system provides a solid foundation for content creators to expand their reach across multiple streaming platforms efficiently.

The modular design allows for easy expansion and modification, while the comprehensive monitoring and analytics ensure optimal performance and user satisfaction. With a strong emphasis on security and scalability, neustream is well-positioned for future growth and feature enhancements.