import Database from "../lib/database";
import * as path from "path";
import * as fs from "fs";

async function migratePayments(): Promise<void> {
  const db = new Database();

  try {
    console.log('🚀 Starting payment migration...');

    // Check if payment tables already exist
    const existingTables = await db.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('payment_orders', 'payments')
    `);

    if (existingTables.length > 0) {
      console.log('📋 Payment tables already exist, skipping migration');
      return;
    }

    console.log('📝 Creating payment tables...');

    // Run the payment migration
    const migrationPath = path.join(__dirname, '../migrations/002_create_payment_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await db.query(sql);

    console.log('✅ Payment tables created successfully!');
    console.log('🎉 Payment migration completed successfully!');
  } catch (error: any) {
    console.error('💥 Payment migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  migratePayments();
}

export default migratePayments;
