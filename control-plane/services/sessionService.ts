import crypto from 'crypto';
import Database from '../lib/database';

interface StreamKeyConfig {
  sourceId: number;
}

interface StreamSession {
  userId: number;
  streamKeys: Record<string, StreamKeyConfig>;
  expiresAt: Date;
  createdAt: Date;
  isActive: boolean;
}

interface UserSession {
  sessionId: string;
  createdAt: Date;
  expiresAt: Date;
  streamKeys: Record<string, StreamKeyConfig>;
}

interface DatabaseSession {
  user_id: number;
  session_token: string;
  stream_keys: Record<string, StreamKeyConfig>;
  expires_at: Date;
  is_active: boolean;
  created_at: Date;
}

/**
 * Session Service
 * Manages streaming sessions with in-memory caching and database persistence
 */
class SessionService {
  private db: Database;
  private activeSessions: Map<string, any>;

  constructor() {
    this.db = new Database();
    // In production, use Redis or similar for session storage
    this.activeSessions = new Map();
  }

  /**
   * Create a new streaming session
   */
  async createSession(userId: number, streamKeys: Record<string, StreamKeyConfig>, durationHours: number = 4): Promise<string> {
    try {
      const sessionId = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + (durationHours * 60 * 60 * 1000));

      // Store session in database
      await this.db.query(
        `INSERT INTO streaming_sessions
         (user_id, session_token, stream_keys, expires_at, is_active)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, sessionId, JSON.stringify(streamKeys), expiresAt, true]
      );

      // Also store in memory for fast access
      const sessionData: StreamSession = {
        userId,
        streamKeys,
        expiresAt,
        createdAt: new Date(),
        isActive: true
      };

      this.activeSessions.set(sessionId, sessionData);

      // Map stream keys to session for fast lookup
      for (const streamKey of Object.keys(streamKeys)) {
        this.activeSessions.set(`stream:${streamKey}`, sessionId);
      }

      console.log(`Created session ${sessionId} for user ${userId}`);
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Get session by session token
   */
  async getSession(sessionId: string): Promise<StreamSession | null> {
    // Check memory cache first
    const cachedSession = this.activeSessions.get(sessionId);
    if (cachedSession && this.isSessionValid(cachedSession)) {
      return cachedSession;
    }

    // Fall back to database
    try {
      const sessions = await this.db.query<DatabaseSession>(
        'SELECT * FROM streaming_sessions WHERE session_token = $1 AND is_active = true',
        [sessionId]
      );

      if (sessions.length === 0) {
        return null;
      }

      const session = sessions[0];

      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        await this.revokeSession(sessionId);
        return null;
      }

      // Cache in memory
      const sessionData: StreamSession = {
        userId: session.user_id,
        streamKeys: session.stream_keys,
        expiresAt: new Date(session.expires_at),
        createdAt: new Date(session.created_at),
        isActive: session.is_active
      };

      this.activeSessions.set(sessionId, sessionData);

      return this.activeSessions.get(sessionId);
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Get session by stream key
   */
  async getSessionByStreamKey(streamKey: string): Promise<StreamSession | null> {
    // Check memory cache first
    const sessionId = this.activeSessions.get(`stream:${streamKey}`);
    if (sessionId) {
      return await this.getSession(sessionId);
    }

    // Fall back to database search
    try {
      const sessions = await this.db.query<DatabaseSession>(
        `SELECT ss.* FROM streaming_sessions ss
         WHERE ss.is_active = true
         AND ss.stream_keys::jsonb ? $1
         AND ss.expires_at > NOW()`,
        [streamKey]
      );

      if (sessions.length === 0) {
        return null;
      }

      const session = sessions[0];

      // Cache in memory
      const sessionData: StreamSession = {
        userId: session.user_id,
        streamKeys: session.stream_keys,
        expiresAt: new Date(session.expires_at),
        createdAt: new Date(session.created_at),
        isActive: session.is_active
      };

      this.activeSessions.set(session.session_token, sessionData);

      // Map stream key to session
      this.activeSessions.set(`stream:${streamKey}`, session.session_token);

      return this.activeSessions.get(session.session_token);
    } catch (error) {
      console.error('Error getting session by stream key:', error);
      return null;
    }
  }

  /**
   * Revoke a session
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    try {
      // Update database
      await this.db.query(
        'UPDATE streaming_sessions SET is_active = false WHERE session_token = $1',
        [sessionId]
      );

      // Remove from memory cache
      const session = this.activeSessions.get(sessionId);
      if (session) {
        // Remove stream key mappings
        for (const streamKey of Object.keys(session.streamKeys)) {
          this.activeSessions.delete(`stream:${streamKey}`);
        }
      }
      this.activeSessions.delete(sessionId);

      console.log(`Revoked session ${sessionId}`);
      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllUserSessions(userId: number): Promise<boolean> {
    try {
      // Update database
      await this.db.query(
        'UPDATE streaming_sessions SET is_active = false WHERE user_id = $1 AND is_active = true',
        [userId]
      );

      // Remove from memory cache
      for (const [key, session] of this.activeSessions.entries()) {
        if (session.userId === userId) {
          // Remove stream key mappings
          for (const streamKey of Object.keys(session.streamKeys)) {
            this.activeSessions.delete(`stream:${streamKey}`);
          }
          this.activeSessions.delete(key);
        }
      }

      console.log(`Revoked all sessions for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error revoking user sessions:', error);
      throw error;
    }
  }

  /**
   * Check if session is valid
   */
  isSessionValid(session: StreamSession | null): boolean {
    return !!session &&
           session.isActive &&
           session.expiresAt > new Date();
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: number): Promise<UserSession[]> {
    try {
      const sessions = await this.db.query<DatabaseSession>(
        'SELECT * FROM streaming_sessions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC',
        [userId]
      );

      return sessions.map(session => ({
        sessionId: session.session_token,
        createdAt: session.created_at,
        expiresAt: session.expires_at,
        streamKeys: session.stream_keys
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      return [];
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    try {
      // Clean database
      await this.db.query(
        'UPDATE streaming_sessions SET is_active = false WHERE expires_at < NOW() AND is_active = true'
      );

      // Clean memory cache
      for (const [key, session] of this.activeSessions.entries()) {
        if (!this.isSessionValid(session)) {
          if (key.startsWith('stream:')) {
            this.activeSessions.delete(key);
          } else {
            // Remove stream key mappings
            for (const streamKey of Object.keys(session.streamKeys)) {
              this.activeSessions.delete(`stream:${streamKey}`);
            }
            this.activeSessions.delete(key);
          }
        }
      }

      console.log('Cleaned up expired sessions');
    } catch (error) {
      console.error('Error cleaning up sessions:', error);
    }
  }

  /**
   * Initialize session cleanup interval
   */
  startCleanupInterval(intervalMinutes: number = 5): NodeJS.Timeout {
    return setInterval(() => {
      this.cleanupExpiredSessions();
    }, intervalMinutes * 60 * 1000);
  }
}

export default SessionService;
