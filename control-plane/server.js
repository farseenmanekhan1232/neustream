const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
require("dotenv").config();

const { passport } = require("./config/oauth");
const authRoutes = require("./routes/auth");
const streamRoutes = require("./routes/streams");
const destinationRoutes = require("./routes/destinations");
const sourceRoutes = require("./routes/sources");
const adminRoutes = require("./routes/admin");
const subscriptionRoutes = require("./routes/subscriptions");
const paymentRoutes = require("./routes/payments");
const chatRoutes = require("./routes/chat");
const contactRoutes = require("./routes/contact");
const blogRoutes = require("./routes/blog");
const posthogService = require("./services/posthog");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
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
const corsOptions = {
  origin: [
    "https://neustream.app",
    "https://neustream.app",
    "https://admin.neustream.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-razorpay-signature"],
};

// Apply CORS to all routes except webhooks
app.use((req, res, next) => {
  // Skip CORS for webhook endpoints
  if (req.path.includes("/webhook")) {
    return next();
  }
  cors(corsOptions)(req, res, next);
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/streams", streamRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/sources", sourceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blog", blogRoutes);

// Analytics middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Track API request after response
  res.on("finish", () => {
    const userId = req.user?.id || "anonymous";
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

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`Control plane server running on port ${PORT}`);
});

// Initialize WebSocket server
const WebSocketServer = require("./lib/websocket");
const wsServer = new WebSocketServer(server);
console.log("WebSocket server initialized");

// Initialize Chat Connector Service
const ChatConnectorService = require("./services/chatConnectorService");
const chatConnectorService = new ChatConnectorService(wsServer);

// Connect WebSocket server to Chat Connector Service
wsServer.setChatConnectorService(chatConnectorService);

// Make chat connector service available to routes
app.set("chatConnectorService", chatConnectorService);
console.log("Chat connector service initialized");

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Received shutdown signal, shutting down gracefully...");

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
      .catch((error) => {
        console.error("Error flushing PostHog events:", error);
        process.exit(1);
      });
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
