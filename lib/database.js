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
      // Prefer IPv6 connections for cloud provider
      family: 6
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database via IPv6');
      return client;
    } catch (err) {
      console.error('❌ PostgreSQL connection error:', err);
      console.error('Connection details:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        ipVersion: 'IPv6 (family: 6)'
      });

      // Provide specific IPv6 troubleshooting guidance
      if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        console.error('⚠️  IPv6 DNS resolution issue detected');
        console.error('   - Check if the hostname resolves to an IPv6 address');
        console.error('   - Verify DNS configuration supports IPv6');
      } else if (err.code === 'ECONNREFUSED') {
        console.error('⚠️  Connection refused - check:');
        console.error('   - PostgreSQL server is running on IPv6 interface');
        console.error('   - Firewall allows IPv6 connections on port', process.env.DB_PORT || 5432);
      }

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