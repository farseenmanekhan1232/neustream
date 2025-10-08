const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Testing database connectivity through Cloudflare Tunnel...\n');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testConnection() {
  let client;

  try {
    console.log('1. Testing database connection...');
    console.log('Connection details:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });

    client = await pool.connect();
    console.log('✅ Database connection successful!');

    // Test a simple query
    console.log('2. Testing database query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Database query successful:', result.rows[0].current_time);

    console.log('\n🎉 Database connectivity through Cloudflare Tunnel is working!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    if (error.code === 'ENETUNREACH') {
      console.log('\n⚠️  IPv6 connectivity issue detected');
      console.log('   - Cloudflare Tunnel might not be configured properly');
      console.log('   - Check Cloudflare Tunnel token and configuration');
      console.log('   - Verify tunnel is running: sudo systemctl status cloudflared');
    }

    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

testConnection();