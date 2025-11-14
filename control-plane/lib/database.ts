import { Pool, PoolClient, QueryResult } from 'pg';

/**
 * Database connection and query management class
 * Handles PostgreSQL connection pooling and query execution
 */
class Database {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Let the system choose the appropriate IP version automatically
    });
  }

  /**
   * Connect to the database
   * @returns Promise<PoolClient> - PostgreSQL client instance
   */
  async connect(): Promise<PoolClient> {
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
        user: process.env.DB_USER,
      });

      // Provide specific troubleshooting guidance for Oracle Cloud + Supabase
      if (err && typeof err === 'object' && 'code' in err) {
        const error = err as { code?: string };
        if (error.code === 'ENETUNREACH') {
          console.error('⚠️  Network unreachable - Oracle Cloud IPv6 issue detected');
          console.error('   - Oracle Cloud free instances may not have IPv6 connectivity');
          console.error('   - Supabase free plan only provides IPv6 endpoints');
          console.error('   - Consider: 1) Upgrade Supabase plan for IPv4, 2) Use different database provider');
        } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
          console.error('⚠️  DNS resolution issue detected');
          console.error('   - Check if the hostname resolves properly');
        } else if (error.code === 'ECONNREFUSED') {
          console.error('⚠️  Connection refused - check:');
          console.error('   - Database server is accessible');
          console.error('   - Firewall allows connections on port', process.env.DB_PORT || 5432);
        }
      }

      throw err;
    }
  }

  /**
   * Execute a SELECT query
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Promise<T[]> - Array of rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params) as QueryResult<T>;
      return result.rows;
    } finally {
      client.release();
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE query
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Promise<T> - First row or result metadata
   */
  async run<T = any>(sql: string, params: any[] = []): Promise<T> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(sql, params) as QueryResult<T>;
      return (result.rows[0] || { id: (result.rows[0] as any)?.id, changes: result.rowCount }) as T;
    } finally {
      client.release();
    }
  }

  /**
   * Close the database connection pool
   */
  close(): void {
    if (this.pool) {
      this.pool.end();
    }
  }
}

export default Database;
