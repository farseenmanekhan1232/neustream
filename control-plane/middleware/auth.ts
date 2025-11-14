import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Database from '../lib/database';
import { User } from '../types/entities';

// Get JWT_SECRET directly from environment variables to ensure consistency
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production';

console.log('=== AUTH MIDDLEWARE INIT ===');
console.log('JWT_SECRET loaded:', !!JWT_SECRET);
console.log('JWT_SECRET length:', JWT_SECRET.length);

const db = new Database();

/**
 * JWT Authentication Middleware
 * Validates JWT token and attaches user info to request object
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  console.log("=== JWT AUTHENTICATION MIDDLEWARE ===");
  console.log("Request path:", req.path);
  console.log("Request method:", req.method);
  console.log("Headers:", req.headers);

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  console.log("Authorization header found:", !!authHeader);
  console.log("Token extracted:", !!token);

  if (!token) {
    console.log("No token provided, returning 401");
    res.status(401).json({ error: "Access token required" });
    return;
  }

  try {
    console.log("Verifying JWT token...");
    console.log("Token length:", token.length);
    console.log("Token first 50 chars:", token.substring(0, 50) + "...");
    console.log("JWT_SECRET available:", !!JWT_SECRET);
    console.log("JWT_SECRET length:", JWT_SECRET.length);

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    console.log("Token decoded successfully:", decoded);

    // Verify user still exists in database
    const users = await db.query<User>(
      "SELECT id, uuid, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (users.length === 0) {
      console.log("User not found in database:", decoded.userId);
      res.status(401).json({ error: "User not found" });
      return;
    }

    const user = users[0];
    console.log("User authenticated:", { id: user.id, email: user.email });

    // Attach user info to request object
    (req as any).user = {
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      streamKey: user.stream_key,
      oauthProvider: user.oauth_provider,
    };

    console.log("Authentication successful, proceeding to next handler");
    next();
  } catch (error) {
    console.error("JWT verification failed:", error);

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: "Token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid token" });
    } else {
      res.status(500).json({ error: "Authentication error" });
    }
  }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(); // No token, but proceed without authentication
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const users = await db.query<User>(
      "SELECT id, uuid, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (users.length > 0) {
      const user = users[0];
      (req as any).user = {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        streamKey: user.stream_key,
        oauthProvider: user.oauth_provider,
      };
    }
  } catch (error) {
    console.error("Optional auth token verification failed:", error);
    // Don't fail the request, just proceed without user info
  }

  next();
};

export default {
  authenticateToken,
  optionalAuth,
};
