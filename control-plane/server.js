const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const streamRoutes = require('./routes/streams');
const destinationRoutes = require('./routes/destinations');
const posthogService = require('./services/posthog');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['https://www.neustream.app', 'https://neustream.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/destinations', destinationRoutes);

// Analytics middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Track API request after response
  res.on('finish', () => {
    const userId = req.user?.id || 'anonymous';
    const responseTime = Date.now() - startTime;

    posthogService.trackApiUsage(
      userId,
      req.path,
      req.method,
      res.statusCode,
      responseTime
    );
  });

  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`Control plane server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, shutting down gracefully...');

  // Close server
  server.close(() => {
    console.log('HTTP server closed');

    // Flush PostHog events
    posthogService.flush().then(() => {
      console.log('PostHog events flushed');
      process.exit(0);
    }).catch(error => {
      console.error('Error flushing PostHog events:', error);
      process.exit(1);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);