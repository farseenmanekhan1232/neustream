import * as dotenv from "dotenv";
import Database from "../lib/database";

dotenv.config();

async function createBlogTables(): Promise<void> {
  console.log('🚀 Creating blog tables...');

  const db = new Database();

  try {
    await db.connect();

    // Create blog_posts table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        excerpt TEXT,
        content JSONB NOT NULL,
        content_html TEXT,
        featured_image VARCHAR(255),
        author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'archived')),
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        meta_title VARCHAR(255),
        meta_description TEXT,
        meta_keywords TEXT,
        canonical_url VARCHAR(255),
        schema_data JSONB,
        view_count INTEGER DEFAULT 0,
        read_time_minutes INTEGER,
        search_score REAL DEFAULT 0.0
      );
    `);

    // Create blog_categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(7) DEFAULT '#6366f1',
        icon VARCHAR(50),
        parent_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create blog_tags table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_tags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        usage_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create relationship tables
    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_post_categories (
        post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
        category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, category_id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS blog_post_tags (
        post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
        tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
    `);

    // Create indexes
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);');
    await db.query('CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);');

    // Insert default categories
    await db.query(`
      INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
      ('Streaming Guides', 'streaming-guides', 'Complete tutorials and guides for live streaming', '#ef4444', 'play-circle', 1),
      ('Platform Updates', 'platform-updates', 'Latest news and updates from streaming platforms', '#3b82f6', 'refresh-cw', 2),
      ('Equipment Reviews', 'equipment-reviews', 'Reviews and recommendations for streaming equipment', '#10b981', 'shopping-bag', 3),
      ('Growth Tips', 'growth-tips', 'Tips and strategies to grow your streaming audience', '#f59e0b', 'trending-up', 4)
      ON CONFLICT (slug) DO NOTHING;
    `);

    console.log('✅ Blog tables created successfully!');

  } catch (error: any) {
    console.error('❌ Failed to create blog tables:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createBlogTables();
