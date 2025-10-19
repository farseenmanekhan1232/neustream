#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * This script runs all database migrations in order.
 * It should be executed during deployment to ensure the database schema is up to date.
 */

const fs = require('fs');
const path = require('path');
const Database = require('../lib/database');

// Migration tracking table
const MIGRATION_TABLE = 'migration_history';

async function ensureMigrationTable(db) {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS ${MIGRATION_TABLE} (
      id SERIAL PRIMARY KEY,
      migration_name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await db.query(createTableSQL);
  console.log('✅ Migration tracking table ready');
}

async function getExecutedMigrations(db) {
  try {
    const result = await db.query(`SELECT migration_name FROM ${MIGRATION_TABLE}`);
    return result.map(row => row.migration_name);
  } catch (error) {
    return [];
  }
}

async function markMigrationExecuted(db, migrationName) {
  await db.query(
    `INSERT INTO ${MIGRATION_TABLE} (migration_name) VALUES ($1)`,
    [migrationName]
  );
}

async function runMigration(db, migrationPath) {
  const migrationName = path.basename(migrationPath, '.sql');
  console.log(`\n📝 Running migration: ${migrationName}`);

  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split SQL by statements and execute each
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    try {
      await db.query(statement + ';');
      console.log(`  ✅ Executed statement ${i + 1}/${statements.length}`);
    } catch (error) {
      // If table already exists, that's fine for migration
      if (error.message.includes('already exists')) {
        console.log(`  ℹ️  Statement ${i + 1}: Table already exists (skipping)`);
      } else {
        console.error(`  ❌ Error executing statement ${i + 1}:`, error.message);
        throw error;
      }
    }
  }

  await markMigrationExecuted(db, migrationName);
  console.log(`  ✅ Migration ${migrationName} completed`);
}

async function runAllMigrations() {
  console.log('🚀 Starting database migrations...');

  const db = new Database();

  try {
    // Connect to database
    await db.connect();
    console.log('✅ Connected to database');

    // Ensure migration tracking table exists
    await ensureMigrationTable(db);

    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations(db);
    console.log(`📊 Found ${executedMigrations.length} previously executed migrations`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('ℹ️  No migrations directory found, skipping migrations');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure execution order

    console.log(`📁 Found ${migrationFiles.length} migration files`);

    let migrationsRun = 0;

    for (const migrationFile of migrationFiles) {
      const migrationName = path.basename(migrationFile, '.sql');
      const migrationPath = path.join(migrationsDir, migrationFile);

      if (executedMigrations.includes(migrationName)) {
        console.log(`  ⏭️  Migration ${migrationName} already executed, skipping`);
        continue;
      }

      await runMigration(db, migrationPath);
      migrationsRun++;
    }

    if (migrationsRun === 0) {
      console.log('🎉 All migrations are up to date!');
    } else {
      console.log(`🎉 Successfully ran ${migrationsRun} new migration(s)!`);
    }

    // Verify critical tables exist
    console.log('\n🔍 Verifying critical tables...');
    const criticalTables = [
      'users',
      'stream_sources',
      'source_destinations',
      'active_streams',
      'subscription_plans',
      'user_subscriptions'
    ];

    for (const table of criticalTables) {
      try {
        await db.query(`SELECT 1 FROM ${table} LIMIT 1`);
        console.log(`  ✅ ${table} table verified`);
      } catch (error) {
        console.error(`  ❌ ${table} table verification failed:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migrations if called directly
if (require.main === module) {
  runAllMigrations().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllMigrations };