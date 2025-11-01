require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Database = require('../lib/database');

async function runBlogMigration() {
  console.log('🚀 Running blog migration...');

  const db = new Database();

  try {
    await db.connect();

    // Read and execute the blog migration
    const migrationPath = path.join(__dirname, '../migrations/012_create_blog_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Executing blog migration...');
    await db.query(migrationSQL);

    console.log('✅ Blog migration completed successfully!');

  } catch (error) {
    console.error('❌ Blog migration failed:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

runBlogMigration();