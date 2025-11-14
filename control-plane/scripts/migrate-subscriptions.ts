import Database from "../lib/database";
import * as path from "path";
import * as fs from "fs";

async function migrateSubscriptions(): Promise<void> {
  const db = new Database();

  try {
    console.log('🚀 Starting subscription migration...');

    // Check if subscription tables already exist
    const existingTables = await db.query<{ table_name: string }>(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('subscription_plans', 'user_subscriptions', 'usage_tracking', 'plan_limits_tracking')
    `);

    if (existingTables.length > 0) {
      console.log('📋 Subscription tables already exist, skipping migration');
      return;
    }

    console.log('📝 Creating subscription tables...');

    // Run the subscription migration
    const migrationPath = path.join(__dirname, '../migrations/001_create_subscription_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    await db.query(sql);

    console.log('✅ Subscription tables created successfully!');

    // Initialize all existing users with free plan
    console.log('👥 Initializing existing users with free plan...');

    const freePlan = await db.query<{ id: number }>('SELECT id FROM subscription_plans WHERE name = $1', ['Free']);

    if (freePlan.length > 0) {
      const users = await db.query<{ id: number }>('SELECT id FROM users');

      for (const user of users) {
        // Check if user already has a subscription
        const existingSubscription = await db.query<{ id: number }>(
          'SELECT id FROM user_subscriptions WHERE user_id = $1',
          [user.id]
        );

        if (existingSubscription.length === 0) {
          await db.query(`
            INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle)
            VALUES ($1, $2, 'active', 'monthly')
          `, [user.id, freePlan[0].id]);

          // Initialize plan limits tracking
          await db.query(`
            INSERT INTO plan_limits_tracking (user_id)
            VALUES ($1)
          `, [user.id]);
        }
      }

      console.log(`✅ ${users.length} users initialized with free plan`);
    }

    console.log('🎉 Subscription migration completed successfully!');
  } catch (error: any) {
    console.error('💥 Subscription migration failed:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

// Run if called directly
if (require.main === module) {
  migrateSubscriptions();
}

export default migrateSubscriptions;
