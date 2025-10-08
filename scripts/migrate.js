const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Prefer IPv6 connections for cloud provider
  family: 6
});

async function runMigrations() {
  let client;

  try {
    console.log('Attempting to connect to PostgreSQL database...');
    console.log('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database');

    await client.query('BEGIN');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        stream_key VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create destinations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS destinations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        platform VARCHAR(100) NOT NULL,
        rtmp_url TEXT NOT NULL,
        stream_key TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create active_streams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS active_streams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        stream_key VARCHAR(255) NOT NULL,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP,
        destinations_count INTEGER DEFAULT 0
      )
    `);

    await client.query('COMMIT');
    console.log('✅ PostgreSQL migrations completed successfully');
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Migration error:', err);
    throw err;
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runMigrations();