import express, { Request, Response, NextFunction } from "express";
import Database from "../lib/database";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import posthogService from "../services/posthog";
import subscriptionService from "../services/subscriptionService";
import EmailService from "../services/emailService";
import { authenticateToken } from "../middleware/auth";
import { passport, generateToken, JWT_SECRET } from "../config/oauth";
import { User } from "../types/entities";

const router = express.Router();

// Create a shared database instance for all routes
const db = new Database();

// Create email service instance
const emailService = new EmailService();

// Helper function to resend verification email
async function resendVerificationEmail(email: string): Promise<void> {
  try {
    // Check if user exists
    const users = await db.query<User>(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (users.length === 0) {
      return;
    }

    // Generate new verification token
    const { token, expires } = emailService.generateVerificationToken();

    // Update user with new token
    await db.run(
      "UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3",
      [token, expires, email],
    );

    // Send verification email
    await emailService.sendVerificationEmail(email, token);

    console.log(`Verification email resent to ${email}`);
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
}

// Pre-connect to database when the module loads
db.connect().catch((err) => {
  console.error("Failed to pre-connect to database:", err);
});

// Stream authentication endpoint (called by nginx-rtmp)
router.post("/stream", async (req: Request, res: Response): Promise<void> => {
  // nginx-rtmp sends stream key as URL-encoded form data, not JSON
  const streamKey = (req.body.name || req.query.name) as string;

  try {
    let sourceInfo: any = null;
    let userId: number | null = null;

    // Find the stream key in stream_sources table
    const sources = await db.query<any>(
      "SELECT s.*, u.email FROM stream_sources s JOIN users u ON s.user_id = u.id WHERE s.stream_key = $1 AND s.is_active = true",
      [streamKey],
    );

    if (sources.length === 0) {
      // Stream key not found
      posthogService.trackStreamEvent(
        "anonymous",
        streamKey,
        "stream_auth_failed",
        {
          reason: "invalid_stream_key",
          attempted_table: "stream_sources",
        },
      );
      res.status(401).send("Invalid stream key");
      return;
    }

    // Found the source
    sourceInfo = sources[0];
    userId = sourceInfo.user_id;

    console.log(
      `Stream authenticated via stream_sources: user=${sourceInfo.email}, source=${sourceInfo.name}`,
    );

    // Check if there's already an active stream with this key
    const existingActiveStream = await db.query<{ id: number }>(
      "SELECT id FROM active_streams WHERE stream_key = $1 AND ended_at IS NULL",
      [streamKey],
    );

    if (existingActiveStream.length > 0) {
      console.log(
        `Stream ${streamKey} is already active, updating existing record`,
      );

      // Update the last activity timestamp for the existing stream
      if (sourceInfo) {
        await db.run(
          "UPDATE stream_sources SET last_used_at = NOW() WHERE id = $1",
          [sourceInfo.id],
        );
      }

      // Track duplicate stream attempt
      posthogService.trackStreamEvent(
        userId!,
        streamKey,
        "duplicate_stream_attempt",
        {
          source_id: sourceInfo?.id,
          source_name: sourceInfo?.name,
        },
      );

      res.status(200).send("OK");
      return;
    }

    // Check subscription limits for streaming
    if (sourceInfo) {
      const canStream = await subscriptionService.canStream(userId!);
      if (!canStream.allowed) {
        console.log(
          `Stream denied for user ${userId}: streaming hour limit exceeded (${canStream.current}/${canStream.max} hours)`,
        );

        // Track subscription limit exceeded
        posthogService.trackStreamEvent(
          userId!,
          streamKey,
          "stream_denied_subscription_limit",
          {
            source_id: sourceInfo.id,
            source_name: sourceInfo.name,
            current_hours: canStream.current,
            max_hours: canStream.max,
          },
        );

        res.status(403).send("Streaming hour limit exceeded");
        return;
      }
    }

    // Start tracking the active stream with source_id if available
    const insertQuery = sourceInfo
      ? "INSERT INTO active_streams (source_id, user_id, stream_key) VALUES ($1, $2, $3) RETURNING id"
      : "INSERT INTO active_streams (user_id, stream_key) VALUES ($1, $2) RETURNING id";

    const insertParams = sourceInfo
      ? [sourceInfo.id, userId, streamKey]
      : [userId, streamKey];

    const result = await db.run<{ id: number }>(insertQuery, insertParams);

    // Update last_used_at timestamp for the source
    if (sourceInfo) {
      await db.run(
        "UPDATE stream_sources SET last_used_at = NOW() WHERE id = $1",
        [sourceInfo.id],
      );
    }

    // Track stream start in usage tracking (only for new architecture with source_id)
    if (sourceInfo) {
      await subscriptionService.trackStreamStart(userId!, sourceInfo.id);
    }

    // Track successful stream authentication
    posthogService.trackStreamEvent(userId!, streamKey, "stream_auth_success", {
      source_id: sourceInfo?.id,
      source_name: sourceInfo?.name,
      authentication_method: "stream_sources_table",
      active_stream_id: result.id,
    });

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("Stream auth error:", error);
    posthogService.trackStreamEvent(
      "anonymous",
      streamKey,
      "stream_auth_error",
      {
        error_message: error.message,
        error_code: error.code,
      },
    );
    res.status(500).send("Internal server error");
  }
});

// Stream end callback (called by nginx-rtmp when stream stops)
router.post("/stream-end", async (req: Request, res: Response): Promise<void> => {
  // nginx-rtmp sends stream key as URL-encoded form data, not JSON
  const streamKey = (req.body.name || req.query.name) as string;

  try {
    // Get active stream details for tracking
    const activeStreams = await db.query<any>(
      `SELECT
        as_.*,
        ss.name as source_name,
        ss.id as source_id,
        u.email
      FROM active_streams as_
      LEFT JOIN stream_sources ss ON as_.source_id = ss.id
      LEFT JOIN users u ON as_.user_id = u.id
      WHERE as_.stream_key = $1 AND as_.ended_at IS NULL`,
      [streamKey],
    );

    if (activeStreams.length === 0) {
      console.log(`No active stream found for key: ${streamKey}`);
      res.status(200).send("OK"); // Still return OK to prevent media server retries
      return;
    }

    const activeStream = activeStreams[0];

    // Calculate stream duration
    const startTime = new Date(activeStream.started_at);
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000); // Duration in seconds

    // Mark the stream as ended with duration
    await db.run(
      `UPDATE active_streams
       SET ended_at = NOW(),
           destinations_count = COALESCE(
             (SELECT COUNT(*) FROM source_destinations sd
              WHERE sd.source_id = $1 AND sd.is_active = true),
             0
           )
       WHERE stream_key = $2 AND ended_at IS NULL`,
      [activeStream.source_id, streamKey],
    );

    // Track stream end in usage tracking (only for new architecture with source_id)
    if (activeStream.source_id) {
      await subscriptionService.trackStreamEnd(
        activeStream.user_id,
        activeStream.source_id,
      );
    }

    // Track stream end with detailed information
    posthogService.trackStreamEvent(
      activeStream.user_id,
      streamKey,
      "stream_ended",
      {
        source_id: activeStream.source_id,
        source_name: activeStream.source_name,
        duration_seconds: duration,
        stream_type: "multi_source",
        active_stream_id: activeStream.id,
        user_email: activeStream.email,
      },
    );

    console.log(
      `Stream ended: key=${streamKey}, user=${activeStream.email}, source=${activeStream.source_name}, duration=${duration}s`,
    );

    res.status(200).send("OK");
  } catch (error: any) {
    console.error("Stream end error:", error);
    posthogService.trackStreamEvent(
      "anonymous",
      streamKey,
      "stream_end_error",
      {
        error_message: error.message,
        error_code: error.code,
      },
    );
    res.status(500).send("Internal server error");
  }
});

// User registration
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    // Check if user already exists
    const existingUsers = await db.query<User & { email_verified: boolean }>(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email],
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email_verified) {
        res.status(400).json({ error: "Email already exists" });
        return;
      } else {
        // User exists but hasn't verified - send a new verification email
        await resendVerificationEmail(email);
        res.status(200).json({
          message: "Registration received. Please check your email to verify your account.",
          requiresVerification: true,
        });
        return;
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const streamKey = crypto.randomBytes(24).toString("hex");
    const { token: emailVerificationToken, expires: emailVerificationExpires } =
      emailService.generateVerificationToken();

    const result = await db.run<{ id: number; uuid: string; email: string; stream_key: string }>(
      `INSERT INTO users (email, password_hash, stream_key, email_verification_token, email_verification_expires)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, uuid, email, stream_key`,
      [email, passwordHash, streamKey, emailVerificationToken, emailVerificationExpires],
    );

    const userId = result.id;
    const userUuid = result.uuid;

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, emailVerificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue with registration even if email fails
    }

    // Assign free plan to new user
    try {
      const freePlan = await db.query<{ id: number }>(
        "SELECT id FROM subscription_plans WHERE name = $1 ORDER BY id LIMIT 1",
        ["Free"],
      );

      if (freePlan.length > 0) {
        const freePlanId = freePlan[0].id;

        await db.run(
          `INSERT INTO user_subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '30 days')`,
          [userId, freePlanId],
        );

        console.log(`Assigned free plan to new user: ${email} (ID: ${userId})`);
      } else {
        console.warn(
          "Free plan not found in database, user created without subscription",
        );
      }
    } catch (subscriptionError) {
      console.error(
        "Failed to assign free plan to new user:",
        subscriptionError,
      );
    }

    // Track registration attempt
    posthogService.trackAuthEvent(userId, "user_registered_unverified");
    posthogService.identifyUser(userId, {
      email: email,
      registered_at: new Date().toISOString(),
      email_verified: false,
    });

    res.status(200).json({
      message: "Registration successful. Please check your email to verify your account.",
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error("Registration error:", error);

    if (error.code === "23505") {
      // Unique constraint violation
      res.status(400).json({ error: "Email already exists" });
    } else if (error.code === "23502") {
      // Not null violation
      res.status(400).json({ error: "Email and password are required" });
    } else {
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// User login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };

  try {
    const users = await db.query<User & { password_hash: string; display_name: string; avatar_url: string; oauth_provider: string; email_verified: boolean }>(
      "SELECT id, uuid, email, password_hash, stream_key, display_name, avatar_url, oauth_provider, email_verified FROM users WHERE email = $1",
      [email],
    );

    if (users.length === 0) {
      posthogService.trackAuthEvent("anonymous", "login_failed", {
        reason: "user_not_found",
        email: email,
      });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const user = users[0];

    // Check if email is verified
    if (!user.email_verified) {
      posthogService.trackAuthEvent(user.id, "login_failed", {
        reason: "email_not_verified",
        email: email,
      });
      res.status(403).json({
        error: "Email not verified",
        requiresVerification: true,
        message: "Please verify your email address before logging in.",
      });
      return;
    }

    // Check if password is provided (OAuth users may not have password)
    if (!user.password_hash) {
      res.status(400).json({
        error: "Password not set",
        message: "This account uses OAuth. Please log in with Google/Twitch.",
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      posthogService.trackAuthEvent(user.id, "login_failed", {
        reason: "invalid_password",
        email: email,
      });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Track successful login
    posthogService.trackAuthEvent(user.id, "login_success");
    posthogService.identifyUser(user.id, {
      email: user.email,
      last_login: new Date().toISOString(),
      email_verified: true,
    });

    // Generate JWT token for API authentication
    const token = generateToken({
      id: user.id,
      uuid: user.uuid,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      streamKey: user.stream_key,
      oauthProvider: user.oauth_provider,
    });

    res.json({
      token,
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        streamKey: user.stream_key,
        oauthProvider: user.oauth_provider,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Google OAuth endpoints
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("=== GOOGLE OAUTH CALLBACK START ===");
    console.log("Callback URL:", req.url);
    console.log("Callback Query:", req.query);
    console.log("Callback Code:", req.query.code);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate("google", { session: false }),
  (req: Request, res: Response) => {
    try {
      console.log("=== GOOGLE OAUTH CALLBACK PROCESSING ===");
      console.log("Authenticated user:", req.user);

      if (!req.user) {
        console.error("No user found in OAuth callback");
        res.status(400).json({ error: "Authentication failed" });
        return;
      }

      // Generate JWT token for the authenticated user
      const token = generateToken(req.user);
      console.log("Generated JWT token:", token.substring(0, 20) + "...");

      // Redirect to frontend auth page with token
      const frontendUrl = process.env.FRONTEND_URL || "https://neustream.app";
      const userData = encodeURIComponent(JSON.stringify(req.user));
      const redirectUrl = `${frontendUrl}/auth?token=${token}&user=${userData}`;

      console.log("Redirect URL:", redirectUrl);
      console.log("Redirect URL length:", redirectUrl.length);
      console.log("Token length:", token.length);
      console.log("User data length:", userData.length);

      // Check if URL is too long (browser limit is ~2000 chars)
      if (redirectUrl.length > 2000) {
        console.warn("Redirect URL is very long, might cause issues");
      }

      res.redirect(redirectUrl);
      console.log("=== GOOGLE OAUTH CALLBACK COMPLETE ===");
    } catch (error: any) {
      console.error("Google OAuth callback error:", error);
      res
        .status(500)
        .json({ error: "OAuth callback failed", details: error.message });
    }
  },
);

// Google OAuth for API-based authentication (for frontend popup flow)
router.post(
  "/google/token",
  passport.authenticate("google-token", { session: false }),
  (req: Request, res: Response) => {
    try {
      const token = generateToken(req.user);
      res.json({
        token,
        user: req.user,
      });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Token generation failed" });
    }
  },
);

// Twitch OAuth endpoints
router.get("/twitch", passport.authenticate("twitch"));

router.get(
  "/twitch/callback",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("=== TWITCH OAUTH CALLBACK START ===");
    console.log("Callback URL:", req.url);
    console.log("Callback Query:", req.query);
    console.log("Callback Code:", req.query.code);
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    next();
  },
  passport.authenticate("twitch", { session: false }),
  (req: Request, res: Response) => {
    console.log("=== TWITCH OAUTH CALLBACK PROCESSING ===");
    console.log("Authenticated user:", req.user);

    if (!req.user) {
      console.error("No user found in Twitch OAuth callback");
      res.status(400).json({ error: "Authentication failed" });
      return;
    }

    // Generate JWT token for the authenticated user
    const token = generateToken(req.user);
    console.log("Generated JWT token:", token.substring(0, 20) + "...");

    // Redirect to frontend auth page with token
    const frontendUrl = process.env.FRONTEND_URL || "https://neustream.app";
    const userData = encodeURIComponent(JSON.stringify(req.user));
    const redirectUrl = `${frontendUrl}/auth?token=${token}&user=${userData}`;

    console.log("Redirect URL:", redirectUrl);
    console.log("Redirect URL length:", redirectUrl.length);
    console.log("Token length:", token.length);
    console.log("User data length:", userData.length);

    // Check if URL is too long (browser limit is ~2000 chars)
    if (redirectUrl.length > 2000) {
      console.warn("Redirect URL is very long, might cause issues");
    }

    res.redirect(redirectUrl);
    console.log("=== TWITCH OAUTH CALLBACK COMPLETE ===");
  },
);

// Email verification endpoint
router.get("/verify-email/:token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.params;

  try {
    // Find user with this verification token
    const users = await db.query<User & { email: string; email_verification_expires: Date }>(
      "SELECT id, email, email_verification_expires FROM users WHERE email_verification_token = $1",
      [token],
    );

    if (users.length === 0) {
      res.status(400).json({ error: "Invalid verification token" });
      return;
    }

    const user = users[0];

    // Check if token has expired
    const now = new Date();
    if (user.email_verification_expires && now > new Date(user.email_verification_expires)) {
      res.status(400).json({ error: "Verification token has expired" });
      return;
    }

    // Mark email as verified and clear verification token
    await db.run(
      "UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = $1",
      [user.id],
    );

    // Track email verification
    posthogService.trackAuthEvent(user.id, "email_verified");
    posthogService.identifyUser(user.id, {
      email: user.email,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
    });

    console.log(`Email verified for user: ${user.email}`);

    // Return success response instead of redirecting
    res.status(200).json({
      message: "Your email has been verified successfully! You can now log in.",
      email_verified: true,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ error: "Email verification failed" });
  }
});

// Resend verification email
router.post("/resend-verification", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const users = await db.query<User & { email_verified: boolean }>(
      "SELECT id, email_verified FROM users WHERE email = $1",
      [email],
    );

    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = users[0];

    if (user.email_verified) {
      res.status(400).json({ error: "Email already verified" });
      return;
    }

    // Generate new verification token
    const { token, expires } = emailService.generateVerificationToken();

    // Update user with new token
    await db.run(
      "UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE email = $3",
      [token, expires, email],
    );

    // Send verification email
    await emailService.sendVerificationEmail(email, token);

    res.json({
      message: "Verification email sent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
});

// Forgot password - send reset email
router.post("/forgot-password", async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    // Check if user exists
    const users = await db.query<User & { id: number }>(
      "SELECT id, email FROM users WHERE email = $1",
      [email],
    );

    // Always return success to prevent email enumeration
    if (users.length === 0) {
      res.json({
        message: "If an account with that email exists, we've sent a password reset link.",
      });
      return;
    }

    const user = users[0];

    // Generate password reset token
    const { token, expires } = emailService.generatePasswordResetToken();

    // Store reset token
    await db.run(
      "UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3",
      [token, expires, user.id],
    );

    // Send password reset email
    await emailService.sendPasswordResetEmail(email, token);

    res.json({
      message: "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
});

// Reset password with token
router.post("/reset-password", async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body as { token: string; newPassword: string };

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token and new password are required" });
    return;
  }

  try {
    // Find user with this reset token
    const users = await db.query<User & { email: string; password_reset_expires: Date }>(
      "SELECT id, email, password_reset_expires FROM users WHERE password_reset_token = $1",
      [token],
    );

    if (users.length === 0) {
      res.status(400).json({ error: "Invalid reset token" });
      return;
    }

    const user = users[0];

    // Check if token has expired
    const now = new Date();
    if (user.password_reset_expires && now > new Date(user.password_reset_expires)) {
      res.status(400).json({ error: "Reset token has expired" });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await db.run(
      "UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2",
      [passwordHash, user.id],
    );

    // Track password reset
    posthogService.trackAuthEvent(user.id, "password_reset");

    console.log(`Password reset successful for user: ${user.email}`);

    res.json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
});

// Change password (for logged-in users)
router.put("/change-password", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  const userId = (req as any).user.id;

  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current password and new password are required" });
    return;
  }

  try {
    // Get user with password hash
    const users = await db.query<User & { password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE id = $1",
      [userId],
    );

    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = users[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await db.run(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, userId],
    );

    // Track password change
    posthogService.trackAuthEvent(userId, "password_changed");

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// JWT token validation endpoint
router.post("/validate-token", async (req: Request, res: Response): Promise<void> => {
  const { token } = req.body as { token: string };

  if (!token) {
    res.status(401).json({ error: "Token required" });
    return;
  }

  try {
    console.log("Validating token...");
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log("Token decoded:", decoded);

    // Verify user still exists
    const users = await db.query<User>(
      "SELECT id, uuid, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (users.length === 0) {
      console.log("User not found for userId:", decoded.userId);
      res.status(401).json({ error: "User not found" });
      return;
    }

    const user = users[0];
    console.log("User found:", user);

    res.json({
      user: {
        id: user.id,
        uuid: user.uuid,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        streamKey: user.stream_key,
        oauthProvider: user.oauth_provider,
      },
    });
  } catch (error) {
    console.error("Token validation error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
