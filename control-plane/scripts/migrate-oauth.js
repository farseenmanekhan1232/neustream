const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "neustream",
  user: process.env.DB_USER || "neustream_user",
  password: process.env.DB_PASSWORD || "23k4j123k4ksdhfasiuhe",
  ssl: false,
});

async function runOAuthMigrations() {
  let client;

  try {
    console.log(
      "Attempting to connect to PostgreSQL database for OAuth migrations..."
    );

    client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");

    await client.query("BEGIN");

    // Add OAuth columns to users table
    console.log("Adding OAuth columns to users table...");

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50),
      ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS oauth_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);

    // Create unique constraint for OAuth users
    console.log("Creating OAuth unique constraint...");
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth
      ON users(oauth_provider, oauth_id)
      WHERE oauth_provider IS NOT NULL
    `);

    // Make password_hash nullable for OAuth users
    console.log("Making password_hash nullable...");
    await client.query(`
      ALTER TABLE users
      ALTER COLUMN password_hash DROP NOT NULL
    `);

    await client.query("COMMIT");
    console.log("✅ OAuth PostgreSQL migrations completed successfully");
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("OAuth migration error:", err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runOAuthMigrations();
