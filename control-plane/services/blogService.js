const Database = require('../lib/database');

class BlogService {
  constructor() {
    this.db = new Database();
  }

  /**
   * Generate a unique slug for blog posts
   */
  async generateSlug(title, postId = null) {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim(/-+/g);

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existingPosts = await this.db.query(
        'SELECT id FROM blog_posts WHERE slug = $1 AND id != $2',
        [slug, postId || 0]
      );

      if (existingPosts.length === 0) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get all blog posts with pagination and filtering
   */
  async getPosts(options = {}) {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      categorySlug = null,
      tagSlug = null,
      authorId = null,
      search = null,
      sortBy = 'published_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereConditions = ['bp.status = $1'];
    let queryParams = [status];
    let paramIndex = 2;

    if (categorySlug) {
      whereConditions.push(`bc.slug = $${paramIndex++}`);
      queryParams.push(categorySlug);
    }

    if (tagSlug) {
      whereConditions.push(`bt.slug = $${paramIndex++}`);
      queryParams.push(tagSlug);
    }

    if (authorId) {
      whereConditions.push(`bp.author_id = $${paramIndex++}`);
      queryParams.push(authorId);
    }

    if (search) {
      whereConditions.push(`(bp.title ILIKE $${paramIndex++} OR bp.excerpt ILIKE $${paramIndex++})`);
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    const postsQuery = `
      SELECT DISTINCT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.author_id,
        bp.status,
        bp.published_at,
        bp.created_at,
        bp.updated_at,
        bp.meta_title,
        bp.meta_description,
        bp.meta_keywords,
        bp.canonical_url,
        bp.view_count,
        bp.read_time_minutes,
        bp.search_score,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id AND bc.is_active = true
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
      WHERE ${whereClause}
      ORDER BY bp.${sortBy} ${sortOrder}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    queryParams.push(limit, offset);

    const posts = await this.db.query(postsQuery, queryParams);

    // Fetch categories and tags for each post separately
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        // Get categories for this post
        const categories = await this.db.query(`
          SELECT bc.id, bc.name, bc.slug, bc.color, bc.icon
          FROM blog_categories bc
          JOIN blog_post_categories bpc ON bc.id = bpc.category_id
          WHERE bpc.post_id = $1 AND bc.is_active = true
        `, [post.id]);

        // Get tags for this post
        const tags = await this.db.query(`
          SELECT bt.id, bt.name, bt.slug
          FROM blog_tags bt
          JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
          WHERE bpt.post_id = $1
        `, [post.id]);

        return {
          ...post,
          categories: categories,
          tags: tags
        };
      })
    );

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT bp.id) as total
      FROM blog_posts bp
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_categories bc ON bpc.category_id = bc.id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
      WHERE ${whereClause}
    `;

    const countResult = await this.db.query(countQuery, queryParams.slice(0, -2));
    const totalPosts = parseInt(countResult[0].total);

    return {
      posts: enrichedPosts.map(this.transformPost),
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug) {
    const posts = await this.db.query(`
      SELECT
        bp.*,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        u.email as author_email
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = $1 AND bp.status = 'published'
    `, [slug]);

    if (posts.length === 0) {
      return null;
    }

    const post = posts[0];
    const postId = post.id;

    // Get categories for this post
    const categories = await this.db.query(`
      SELECT bc.id, bc.name, bc.slug, bc.color, bc.icon
      FROM blog_categories bc
      JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      WHERE bpc.post_id = $1 AND bc.is_active = true
    `, [postId]);

    // Get tags for this post
    const tags = await this.db.query(`
      SELECT bt.id, bt.name, bt.slug
      FROM blog_tags bt
      JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
      WHERE bpt.post_id = $1
    `, [postId]);

    // Increment view count
    await this.incrementViewCount(postId);

    const enrichedPost = {
      ...post,
      categories: categories,
      tags: tags
    };

    return this.transformPost(enrichedPost);
  }

  /**
   * Get related posts based on categories and tags
   */
  async getRelatedPosts(postId, limit = 4) {
    const posts = await this.db.query(`
      WITH post_categories AS (
        SELECT category_id FROM blog_post_categories WHERE post_id = $1
      ),
      post_tags AS (
        SELECT tag_id FROM blog_post_tags WHERE post_id = $1
      )
      SELECT DISTINCT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.published_at,
        bp.read_time_minutes,
        u.display_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      LEFT JOIN blog_post_categories bpc ON bp.id = bpc.post_id
      LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
      WHERE
        bp.id != $1
        AND bp.status = 'published'
        AND (
          bpc.category_id IN (SELECT category_id FROM post_categories)
          OR bpt.tag_id IN (SELECT tag_id FROM post_tags)
        )
      ORDER BY bp.published_at DESC
      LIMIT $2
    `, [postId, limit]);

    return posts.map(this.transformPost);
  }

  /**
   * Get all categories with post counts
   */
  async getCategories() {
    const categories = await this.db.query(`
      SELECT
        bc.*,
        COUNT(bpc.post_id) as post_count
      FROM blog_categories bc
      LEFT JOIN blog_post_categories bpc ON bc.id = bpc.category_id
      LEFT JOIN blog_posts bp ON bpc.post_id = bp.id AND bp.status = 'published'
      WHERE bc.is_active = true
      GROUP BY bc.id
      ORDER BY bc.sort_order ASC, bc.name ASC
    `);

    return categories;
  }

  /**
   * Get all tags with usage counts
   */
  async getTags(limit = 50) {
    const tags = await this.db.query(`
      SELECT bt.*
      FROM blog_tags bt
      WHERE bt.usage_count > 0
      ORDER BY bt.usage_count DESC, bt.name ASC
      LIMIT $1
    `, [limit]);

    return tags;
  }

  /**
   * Search blog posts using full-text search
   */
  async searchPosts(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const posts = await this.db.query(`
      SELECT
        bp.*,
        u.display_name as author_name,
        u.avatar_url as author_avatar,
        ts_rank(
          to_tsvector('english', bp.title || ' ' || COALESCE(bp.excerpt, '') || ' ' || COALESCE(bp.content_html, '')),
          plainto_tsquery('english', $1)
        ) as search_score
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE
        bp.status = 'published'
        AND to_tsvector('english', bp.title || ' ' || COALESCE(bp.excerpt, '') || ' ' || COALESCE(bp.content_html, '')) @@ plainto_tsquery('english', $1)
      ORDER BY search_score DESC, bp.published_at DESC
      LIMIT $2 OFFSET $3
    `, [query, limit, offset]);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM blog_posts bp
      WHERE
        bp.status = 'published'
        AND to_tsvector('english', bp.title || ' ' || COALESCE(bp.excerpt, '') || ' ' || COALESCE(bp.content_html, '')) @@ plainto_tsquery('english', $1)
    `;

    const countResult = await this.db.query(countQuery, [query]);
    const totalPosts = parseInt(countResult[0].total);

    return {
      posts: posts.map(this.transformPost),
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        hasNextPage: page * limit < totalPosts,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Create a new blog post
   */
  async createPost(postData) {
    const {
      title,
      slug,
      excerpt,
      content,
      contentHtml,
      featuredImage,
      authorId,
      status = 'draft',
      publishedAt,
      metaTitle,
      metaDescription,
      metaKeywords,
      canonicalUrl
    } = postData;

    const finalSlug = slug || await this.generateSlug(title);

    const result = await this.db.run(`
      INSERT INTO blog_posts (
        title, slug, excerpt, content, content_html, featured_image,
        author_id, status, published_at, meta_title, meta_description,
        meta_keywords, canonical_url, read_time_minutes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id
    `, [
      title, finalSlug, excerpt, JSON.stringify(content), contentHtml, featuredImage,
      authorId, status, publishedAt, metaTitle, metaDescription, metaKeywords,
      canonicalUrl, this.calculateReadTime(contentHtml)
    ]);

    return result.id;
  }

  /**
   * Update a blog post
   */
  async updatePost(postId, postData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(postData).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'categories' && key !== 'tags') {
        fields.push(`${key} = $${paramIndex++}`);

        if (key === 'content') {
          values.push(JSON.stringify(value));
        } else if (key === 'read_time_minutes' && !value) {
          values.push(this.calculateReadTime(postData.content_html));
        } else {
          values.push(value);
        }
      }
    });

    if (fields.length === 0) {
      return false;
    }

    const query = `
      UPDATE blog_posts
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
    `;

    values.push(postId);

    await this.db.run(query, values);
    return true;
  }

  /**
   * Delete a blog post
   */
  async deletePost(postId) {
    await this.db.run('DELETE FROM blog_posts WHERE id = $1', [postId]);
    return true;
  }

  /**
   * Increment view count for a post
   */
  async incrementViewCount(postId) {
    await this.db.run('UPDATE blog_posts SET view_count = view_count + 1 WHERE id = $1', [postId]);

    // Also track daily analytics
    const today = new Date().toISOString().split('T')[0];
    await this.db.run(`
      INSERT INTO blog_analytics (post_id, date, views, unique_visitors)
      VALUES ($1, $2, 1, 1)
      ON CONFLICT (post_id, date)
      DO UPDATE SET views = blog_analytics.views + 1
    `, [postId, today]);
  }

  /**
   * Get popular posts based on view count
   */
  async getPopularPosts(limit = 5, days = 30) {
    const posts = await this.db.query(`
      SELECT
        bp.id,
        bp.title,
        bp.slug,
        bp.excerpt,
        bp.featured_image,
        bp.view_count,
        bp.published_at,
        bp.read_time_minutes,
        u.display_name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE
        bp.status = 'published'
        AND bp.published_at >= NOW() - INTERVAL '${days} days'
      ORDER BY bp.view_count DESC
      LIMIT $1
    `, [limit]);

    return posts.map(this.transformPost);
  }

  /**
   * Transform post data for API response
   */
  transformPost(post) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content ? (typeof post.content === 'string' ? JSON.parse(post.content) : post.content) : [],
      contentHtml: post.content_html,
      featuredImage: post.featured_image,
      author: {
        id: post.author_id,
        name: post.author_name,
        avatar: post.author_avatar,
        email: post.author_email
      },
      status: post.status,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      readTimeMinutes: post.read_time_minutes,
      viewCount: post.view_count,
      categories: Array.isArray(post.categories) ? post.categories.filter(Boolean) : [],
      tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
      seo: {
        metaTitle: post.meta_title,
        metaDescription: post.meta_description,
        metaKeywords: post.meta_keywords,
        canonicalUrl: post.canonical_url
      }
    };
  }

  /**
   * Calculate estimated reading time in minutes
   */
  calculateReadTime(htmlContent) {
    if (!htmlContent) return 0;

    // Remove HTML tags and count words
    const text = htmlContent.replace(/<[^>]*>/g, '');
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;

    // Average reading speed: 200-250 words per minute
    const wordsPerMinute = 225;
    const readTime = Math.ceil(wordCount / wordsPerMinute);

    return Math.max(1, readTime); // Minimum 1 minute
  }

  /**
   * Generate structured data (JSON-LD) for SEO
   */
  generateStructuredData(post) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.seo?.metaDescription,
      image: post.featuredImage ? [post.featuredImage] : [],
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author?.name,
        email: post.author?.email
      },
      publisher: {
        '@type': 'Organization',
        name: 'Neustream',
        logo: {
          '@type': 'ImageObject',
          url: 'https://www.neustream.app/logo.png'
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://www.neustream.app/blog/${post.slug}`
      }
    };

    if (post.categories?.length > 0) {
      structuredData.about = post.categories.map(cat => ({
        '@type': 'Thing',
        name: cat.name
      }));
    }

    return structuredData;
  }
}

module.exports = new BlogService();