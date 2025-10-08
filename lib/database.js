const { Pool } = require('pg');

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      // Let the system choose the appropriate IP version automatically
    });
  }

  async connect() {
    try {
      const client = await this.pool.connect();
      console.log('✅ Connected to PostgreSQL database');
      return client;
    } catch (err) {
      console.error('❌ PostgreSQL connection error:', err);
      console.error('Connection details:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME,
        user: process.env.DB_USER
      });

      // Provide specific troubleshooting guidance for Oracle Cloud + Supabase
      if (err.code === 'ENETUNREACH') {
        console.error('⚠️  Network unreachable - Oracle Cloud IPv6 issue detected');
        console.error('   - Oracle Cloud free instances may not have IPv6 connectivity');
        console.error('   - Supabase free plan only provides IPv6 endpoints');
        console.error('   - Consider: 1) Upgrade Supabase plan for IPv4, 2) Use different database provider');
      } else if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        console.error('⚠️  DNS resolution issue detected');
        console.error('   - Check if the hostname resolves properly');
      } else if (err.code === 'ECONNREFUSED') {
        console.error('⚠️  Connection refused - check:');
        console.error('   - Database server is accessible');
        console.error('   - Firewall allows connections on port', process.env.DB_PORT || 5432);
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
      return result.rows[0] || { id: result.rows[0]?.id, changes: result.rowCount };
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