// Middleware to handle both integer and UUID IDs in API endpoints
const Database = require("../lib/database");

const db = new Database();

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Check if a string is a valid UUID
function isValidUuid(str) {
  return UUID_REGEX.test(str);
}

// Check if a string is a valid integer
function isValidInteger(str) {
  return /^\d+$/.test(str);
}

// Middleware to handle user ID parameters (both integer and UUID)
const handleUserIdParam = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    return next();
  }

  try {
    let query;
    let params;

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
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const users = await db.query(query, params);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
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

// Middleware to handle generic ID parameters (for sources, subscriptions, etc.)
const handleGenericIdParam = (tableName, idField = 'id') => {
  return async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
      return next();
    }

    try {
      let query;
      let params;

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
        return res.status(400).json({ error: `Invalid ${tableName} ID format` });
      }

      const results = await db.query(query, params);

      if (results.length === 0) {
        return res.status(404).json({ error: `${tableName} not found` });
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

module.exports = {
  isValidUuid,
  isValidInteger,
  handleUserIdParam,
  handleGenericIdParam,
};