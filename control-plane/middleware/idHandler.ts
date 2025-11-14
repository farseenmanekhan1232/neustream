import { Request, Response, NextFunction } from 'express';
import Database from "../lib/database";
import { User } from '../types/entities';

const db = new Database();

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Check if a string is a valid UUID
export function isValidUuid(str: string): boolean {
  return UUID_REGEX.test(str);
}

// Check if a string is a valid integer
export function isValidInteger(str: string): boolean {
  return /^\d+$/.test(str);
}

// Extend Express Request for targetUser and entity
declare global {
  namespace Express {
    interface Request {
      targetUser?: {
        id: number;
        uuid: string;
        email: string;
        displayName?: string;
        avatarUrl?: string;
        streamKey?: string;
        oauthProvider?: string;
      };
      entity?: any;
      isUuid?: boolean;
    }
  }
}

/**
 * Middleware to handle user ID parameters (both integer and UUID)
 */
export const handleUserIdParam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    return next();
  }

  try {
    let query: string;
    let params: any[];

    if (isValidUuid(userId)) {
      // UUID parameter
      query = 'SELECT id, uuid, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE uuid = $1';
      params = [userId];
      req.isUuid = true;
    } else if (isValidInteger(userId)) {
      // Integer parameter (backward compatibility)
      query = 'SELECT id, uuid, email, display_name, avatar_url, stream_key, oauth_provider FROM users WHERE id = $1';
      params = [parseInt(userId, 10)];
      req.isUuid = false;
    } else {
      res.status(400).json({ error: 'Invalid user ID format' });
      return;
    }

    const users = await db.query<User>(query, params);

    if (users.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Attach user info to request for use in route handlers
    req.targetUser = {
      id: users[0].id,
      uuid: users[0].uuid,
      email: users[0].email,
      displayName: users[0].display_name,
      avatarUrl: users[0].avatar_url,
      streamKey: users[0].stream_key,
      oauthProvider: users[0].oauth_provider,
    };

    next();
  } catch (error) {
    console.error('User ID parameter handling error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to handle generic ID parameters (for sources, subscriptions, etc.)
 */
export const handleGenericIdParam = (tableName: string, idField: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      return next();
    }

    try {
      let query: string;
      let params: any[];

      if (isValidUuid(id)) {
        // UUID parameter
        query = `SELECT * FROM ${tableName} WHERE uuid = $1`;
        params = [id];
        req.isUuid = true;
      } else if (isValidInteger(id)) {
        // Integer parameter (backward compatibility)
        query = `SELECT * FROM ${tableName} WHERE ${idField} = $1`;
        params = [parseInt(id, 10)];
        req.isUuid = false;
      } else {
        res.status(400).json({ error: `Invalid ${tableName} ID format` });
        return;
      }

      const results = await db.query(query, params);

      if (results.length === 0) {
        res.status(404).json({ error: `${tableName} not found` });
        return;
      }

      // Attach the entity to request for use in route handlers
      req.entity = results[0];

      next();
    } catch (error) {
      console.error(`${tableName} ID parameter handling error:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export default {
  isValidUuid,
  isValidInteger,
  handleUserIdParam,
  handleGenericIdParam,
};
