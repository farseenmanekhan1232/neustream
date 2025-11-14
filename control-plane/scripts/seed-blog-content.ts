import * as dotenv from "dotenv";
import Database from "../lib/database";

dotenv.config();

async function seedBlogContent(): Promise<void> {
  console.log('🌱 Seeding blog content...');

  const db = new Database();

  try {
    await db.connect();

    // Get the admin user (assuming user ID 3 is admin)
    const adminUsers = await db.query<{ id: number }>('SELECT id FROM users WHERE email = $1', ['admin@neustream.app']);
    const authorId = adminUsers.length > 0 ? adminUsers[0].id : 3;

    // Get categories
    const categories = await db.query<{ id: number; slug: string }>('SELECT id, slug FROM blog_categories');
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, number>);

    // Sample blog posts
    const blogPosts = [
      {
        title: 'Complete OBS Setup Guide for Streamers in 2025',
        slug: 'complete-obs-setup-guide-2025',
        excerpt: 'Learn how to set up OBS Studio from scratch with our comprehensive guide covering settings, scenes, sources, and advanced streaming configurations.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Introduction to OBS Studio'
          },
          {
            type: 'paragraph',
            text: 'OBS Studio is the most powerful streaming software available for free. This guide will walk you through everything you need to know to set up professional streams.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Downloading and Installing OBS'
          },
          {
            type: 'paragraph',
            text: 'Start by downloading OBS Studio from the official website. The installation process is straightforward - just follow the on-screen instructions for your operating system.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Basic OBS Settings'
          },
          {
            type: 'paragraph',
            text: 'Before you start streaming, configure your basic settings in OBS Settings → Output. Set your video bitrate to 4500-6000 Kbps for 1080p streaming, and audio bitrate to 128-192 Kbps.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
        categories: ['streaming-guides', 'technical-tutorials'],
        tags: ['OBS', 'streaming setup', 'tutorial', 'broadcasting'],
        metaTitle: 'Complete OBS Setup Guide for Streamers in 2025',
        metaDescription: 'Learn how to set up OBS Studio with our comprehensive guide covering settings, scenes, sources, and advanced streaming configurations.',
        readTimeMinutes: 8
      }
    ];

    // Insert blog posts
    for (const post of blogPosts) {
      // Convert content to HTML
      const contentHtml = post.content.map(block => {
        switch (block.type) {
          case 'heading':
            return `<h${block.level}>${block.text}</h${block.level}>`;
          case 'paragraph':
            return `<p>${block.text}</p>`;
          default:
            return '';
        }
      }).join('\n');

      const result = await db.run<{ id: number }>(`
        INSERT INTO blog_posts (
          title, slug, excerpt, content, content_html, featured_image,
          author_id, status, published_at, meta_title, meta_description,
          read_time_minutes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `, [
        post.title,
        post.slug,
        post.excerpt,
        JSON.stringify(post.content),
        contentHtml,
        post.featuredImage,
        authorId,
        'published',
        new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
        post.metaTitle,
        post.metaDescription,
        post.readTimeMinutes
      ]);

      const postId = result.id;

      // Add categories
      for (const categorySlug of post.categories) {
        if (categoryMap[categorySlug]) {
          await db.run(
            'INSERT INTO blog_post_categories (post_id, category_id) VALUES ($1, $2)',
            [postId, categoryMap[categorySlug]]
          );
        }
      }

      // Add tags
      for (const tagName of post.tags) {
        const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');

        // Create tag if it doesn't exist
        let tag = await db.query<{ id: number }>('SELECT id FROM blog_tags WHERE slug = $1', [tagSlug]);

        if (tag.length === 0) {
          const newTag = await db.run<{ id: number }>(
            'INSERT INTO blog_tags (name, slug) VALUES ($1, $2) RETURNING id',
            [tagName, tagSlug]
          );
          tag = [{ id: newTag.id }];
        }

        await db.run(
          'INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)',
          [postId, tag[0].id]
        );
      }

      console.log(`✅ Created blog post: ${post.title}`);
    }

    console.log('✅ Blog content seeded successfully!');

  } catch (error: any) {
    console.error('❌ Failed to seed blog content:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedBlogContent();
