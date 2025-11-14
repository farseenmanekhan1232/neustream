import * as dotenv from "dotenv";
import Database from "../lib/database";

dotenv.config();

async function createBlogAnalyticsTable(): Promise<void> {
  console.log('📊 Creating blog analytics table...');

  const db = new Database();

  try {
    await db.connect();

    // Create blog analytics table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        views INTEGER DEFAULT 0,
        unique_visitors INTEGER DEFAULT 0,
        avg_time_on_page INTEGER DEFAULT 0,
        bounce_rate DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(post_id, date)
      );
    `);

    // Create index
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_analytics_date ON blog_analytics(date);');

    console.log('✅ Blog analytics table created successfully!');

  } catch (error: any) {
    console.error('❌ Failed to create blog analytics table:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createBlogAnalyticsTable();
