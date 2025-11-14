import express, { Express, Request, Response, Application } from "express";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import { createServer, Server as HTTPServer } from "http";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configuration and routes
import { passport } from "./config/oauth";
// Note: Using .js extensions for imports from JavaScript modules that haven't been converted yet
import authRoutes from "./routes/auth.js";
import streamRoutes from "./routes/streams.js";
import sourceRoutes from "./routes/sources.js";
import adminRoutes from "./routes/admin.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";
import chatRoutes from "./routes/chat.js";
import contactRoutes from "./routes/contact.js";
import blogRoutes from "./routes/blog.js";
import streamingRoutes from "./routes/streaming.js";
import totpRoutes from "./routes/totp.js";
import posthogService from "./services/posthog.js";

// Import WebSocket server
import WebSocketServer from "./lib/websocket";

// Create Express application
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "3000", 10);

// ===== Middleware =====

// Security middleware
app.use(helmet());

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }),
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Configure CORS with separate handling for webhooks
// Parse allowed origins from environment variable (comma-separated)
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
    ];

const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
};

console.log("CORS Allowed Origins:", allowedOrigins);

// Apply CORS to all routes except webhooks
app.use((req: Request, res: Response, next) => {
  // Skip CORS for webhook endpoints
  if (req.path.includes("/webhook")) {
    return next();
  }
  cors(corsOptions)(req, res, next);
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== Routes =====

app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/streaming", streamingRoutes);
app.use("/api/totp", totpRoutes);

// ===== Analytics Middleware =====

app.use((req: Request, res: Response, next) => {
  const startTime = Date.now();

  // Track API request after response
  res.on("finish", () => {
    const userId = (req as any).user?.id || "anonymous";
    const responseTime = Date.now() - startTime;

    posthogService.trackApiUsage(
      userId,
      req.path,
      req.method,
      res.statusCode,
      responseTime,
    );
  });

  next();
});

// ===== Health Check =====

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ===== Server Initialization =====

const server: HTTPServer = createServer(app);

server.listen(PORT, () => {
  console.log(`Control plane server running on port ${PORT}`);
});

// ===== WebSocket Server Initialization =====

const wsServer: WebSocketServer = new WebSocketServer(server);
console.log("WebSocket server initialized");

// ===== Chat Connector Service Initialization =====

// Import and initialize Chat Connector Service
// Note: Using dynamic import for JavaScript module
const ChatConnectorService = require("./services/chatConnectorService.js");
const chatConnectorService = new (ChatConnectorService as any)(wsServer);

// Connect WebSocket server to Chat Connector Service
wsServer.setChatConnectorService(chatConnectorService);

// Make chat connector service available to routes
app.set("chatConnectorService", chatConnectorService);
console.log("Chat connector service initialized");

// ===== Subscription Cleanup Service Initialization =====

const subscriptionCleanupService = require("./services/subscriptionCleanupService.js");
subscriptionCleanupService.start();
console.log("Subscription cleanup service started");

// ===== Graceful Shutdown Handler =====

const gracefulShutdown = async (): Promise<void> => {
  console.log("Received shutdown signal, shutting down gracefully...");

  // Stop subscription cleanup service
  subscriptionCleanupService.stop();
  console.log("Subscription cleanup service stopped");

  // Close server
  server.close(() => {
    console.log("HTTP server closed");

    // Flush PostHog events
    posthogService
      .flush()
      .then(() => {
        console.log("PostHog events flushed");
        process.exit(0);
      })
      .catch((error: Error) => {
        console.error("Error flushing PostHog events:", error);
        process.exit(1);
      });
  });
};

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
