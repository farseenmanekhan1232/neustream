import * as dotenv from "dotenv";
import Database from "../lib/database";

dotenv.config();

async function clearBlogContent(): Promise<void> {
  console.log('🗑️ Clearing existing blog content...');

  const db = new Database();

  try {
    await db.connect();

    // Delete existing blog posts (this will cascade to post_categories and post_tags)
    await db.query('DELETE FROM blog_posts');

    // Reset tag usage counts
    await db.query('UPDATE blog_tags SET usage_count = 0');

    console.log('✅ Existing blog content cleared successfully!');

  } catch (error: any) {
    console.error('❌ Failed to clear blog content:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

clearBlogContent();
