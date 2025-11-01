-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create blog posts table
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

  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  canonical_url VARCHAR(255),
  schema_data JSONB,

  -- Performance fields
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER,
  search_score REAL DEFAULT 0.0
);

-- Create blog categories table
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

-- Create blog tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create relationship tables
CREATE TABLE IF NOT EXISTS blog_post_categories (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create blog analytics table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search_idx ON blog_posts USING GIN (
  to_tsvector('english', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content_html, ''))
);

CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_parent_id ON blog_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_categories_is_active ON blog_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_usage_count ON blog_tags(usage_count);

CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON blog_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_date ON blog_analytics(date);

-- Create function to update updated_at timestamp for blog_posts
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at_trigger ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at();

-- Create function to generate unique slugs (simplified version)
CREATE OR REPLACE FUNCTION generate_unique_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
BEGIN
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  RETURN base_slug;
END;
$$ LANGUAGE plpgsql;

-- Create function to update tag usage count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE blog_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE blog_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tag usage count
DROP TRIGGER IF EXISTS update_tag_usage_count_trigger ON blog_post_tags;
CREATE TRIGGER update_tag_usage_count_trigger
  AFTER INSERT OR DELETE ON blog_post_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color, icon, sort_order) VALUES
('Streaming Guides', 'streaming-guides', 'Complete tutorials and guides for live streaming', '#ef4444', 'play-circle', 1),
('Platform Updates', 'platform-updates', 'Latest news and updates from streaming platforms', '#3b82f6', 'refresh-cw', 2),
('Equipment Reviews', 'equipment-reviews', 'Reviews and recommendations for streaming equipment', '#10b981', 'shopping-bag', 3),
('Growth Tips', 'growth-tips', 'Tips and strategies to grow your streaming audience', '#f59e0b', 'trending-up', 4),
('Technical Tutorials', 'technical-tutorials', 'Technical guides for OBS, overlays, and streaming software', '#8b5cf6', 'monitor', 5),
('Industry News', 'industry-news', 'Latest trends and news in the streaming industry', '#06b6d4', 'globe', 6),
('Success Stories', 'success-stories', 'Success stories and case studies from top creators', '#ec4899', 'star', 7),
('Neustream Features', 'neustream-features', 'Feature announcements and tutorials for Neustream', '#6366f1', 'zap', 8)
ON CONFLICT (slug) DO NOTHING;

-- Add table comments
COMMENT ON TABLE blog_posts IS 'Stores blog posts with SEO optimization and analytics';
COMMENT ON TABLE blog_categories IS 'Stores blog categories with hierarchical structure';
COMMENT ON TABLE blog_tags IS 'Stores blog tags with usage tracking';
COMMENT ON TABLE blog_post_categories IS 'Many-to-many relationship between posts and categories';
COMMENT ON TABLE blog_post_tags IS 'Many-to-many relationship between posts and tags';
COMMENT ON TABLE blog_analytics IS 'Stores daily analytics data for blog posts';

COMMENT ON COLUMN blog_posts.status IS 'draft, published, scheduled, archived';
COMMENT ON COLUMN blog_posts.content IS 'JSON structure for rich content blocks';
COMMENT ON COLUMN blog_posts.content_html IS 'Pre-rendered HTML for performance';
COMMENT ON COLUMN blog_posts.schema_data IS 'JSON-LD structured data for SEO';
COMMENT ON COLUMN blog_posts.search_score IS 'Full-text search relevance score';
COMMENT ON COLUMN blog_categories.parent_id IS 'Allows nested category structure';
COMMENT ON COLUMN blog_analytics.bounce_rate IS 'Percentage of visitors who leave without interaction';