const fs = require('fs');
const path = require('path');
const Database = require('../lib/database');

async function runMigration() {
  console.log('🚀 Starting subscription database migration...');

  const db = new Database();

  try {
    // Connect to database
    await db.connect();
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, '../migrations/001_create_subscription_tables.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📝 Running subscription migration...');

    // Split SQL by statements and execute each
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) {
        continue;
      }

      try {
        await db.query(statement + ';');
        console.log(`✅ Executed statement ${i + 1}/${statements.length}`);
      } catch (error) {
        // If table already exists, that's fine for migration
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Statement ${i + 1}: Table already exists (skipping)`);
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    console.log('🎉 Subscription migration completed successfully!');

    // Verify the migration by checking if tables exist
    console.log('🔍 Verifying migration...');

    const tables = [
      'subscription_plans',
      'user_subscriptions',
      'payment_transactions',
      'usage_tracking',
      'subscription_events'
    ];

    for (const table of tables) {
      try {
        const result = await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`✅ ${table} table verified`);
      } catch (error) {
        console.error(`❌ ${table} table verification failed:`, error.message);
        throw error;
      }
    }

    // Check if default plans were inserted
    const plans = await db.query('SELECT COUNT(*) as count FROM subscription_plans');
    console.log(`📊 Found ${plans[0].count} subscription plans`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };