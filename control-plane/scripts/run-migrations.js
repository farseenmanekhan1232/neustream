const Database = require('../lib/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const db = new Database();

  try {
    console.log('🚀 Starting database migrations...');

    // Create migrations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Get list of already executed migrations
    const executedMigrations = await db.query('SELECT name FROM migrations');
    const executedNames = new Set(executedMigrations.map(m => m.name));

    // Read migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration files`);

    for (const file of files) {
      if (executedNames.has(file)) {
        console.log(`✅ ${file} - already executed`);
        continue;
      }

      console.log(`📝 Executing ${file}...`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await db.query(sql);
        await db.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        console.log(`✅ ${file} - executed successfully`);
      } catch (error) {
        console.error(`❌ ${file} - failed:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;