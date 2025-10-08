const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Use SQLite for Oracle Cloud free tier compatibility
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/neustream.db');
const db = new sqlite3.Database(dbPath);

function runMigrations() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        stream_key TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create destinations table
    db.run(`
      CREATE TABLE IF NOT EXISTS destinations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        platform TEXT NOT NULL,
        rtmp_url TEXT NOT NULL,
        stream_key TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create active_streams table
    db.run(`
      CREATE TABLE IF NOT EXISTS active_streams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        stream_key TEXT NOT NULL,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME,
        destinations_count INTEGER DEFAULT 0
      )
    `, (err) => {
      if (err) {
        console.error('Migration error:', err);
      } else {
        console.log('✅ Database migrations completed successfully');
      }
      db.close();
    });
  });
}

runMigrations();