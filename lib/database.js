const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Force IPv4 to avoid IPv6 connection issues
      family: 4
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('Connected to PostgreSQL database');
      return client;
    } catch (err) {
      console.error('PostgreSQL connection error:', err);
      throw err;
    }
  }

  async query(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async run(sql, params = []) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params);
      return { id: result.rows[0]?.id, changes: result.rowCount };
    } finally {
      client.release();
    }
  }

  close() {
    if (this.pool) {
      this.pool.end();
    }
  }
}

module.exports = Database;