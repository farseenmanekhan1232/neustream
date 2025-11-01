require('dotenv').config();
const Database = require('../lib/database');

async function seedBlogContent() {
  console.log('🌱 Seeding blog content...');

  const db = new Database();

  try {
    await db.connect();

    // Get the admin user (assuming user ID 3 is admin)
    const adminUsers = await db.query('SELECT id FROM users WHERE email = $1', ['admin@neustream.app']);
    const authorId = adminUsers.length > 0 ? adminUsers[0].id : 3;

    // Get categories
    const categories = await db.query('SELECT id, slug FROM blog_categories');
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {});

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
          },
          {
            type: 'heading',
            level: 3,
            text: 'Setting Up Scenes'
          },
          {
            type: 'paragraph',
            text: 'Scenes are different layouts for your stream. Create at least two scenes: one for "Starting Soon" and another for "Live Content". Add overlays, alerts, and widgets to make your stream professional.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Adding Sources'
          },
          {
            type: 'paragraph',
            text: 'Sources are the elements that appear in your scenes. Add your game capture, webcam, microphone, and any overlays you want to display.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=400&fit=crop',
        categories: ['streaming-guides', 'technical-tutorials'],
        tags: ['OBS', 'streaming setup', 'tutorial', 'broadcasting'],
        metaTitle: 'Complete OBS Setup Guide for Streamers in 2025',
        metaDescription: 'Learn how to set up OBS Studio with our comprehensive guide covering settings, scenes, sources, and advanced streaming configurations.',
        readTimeMinutes: 8
      },
      {
        title: 'How to Multi-Stream to Twitch and YouTube Simultaneously',
        slug: 'multi-stream-twitch-youtube-simultaneously',
        excerpt: 'Discover how to stream to multiple platforms at once using Neustream. Reach a wider audience by broadcasting to Twitch, YouTube, and other platforms simultaneously.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Why Multi-Streaming Matters'
          },
          {
            type: 'paragraph',
            text: 'Multi-streaming allows you to reach audiences across different platforms without duplicating your work. This can significantly increase your discoverability and community growth.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Setting Up Multi-Streaming with Neustream'
          },
          {
            type: 'paragraph',
            text: 'Neustream makes multi-streaming incredibly simple. Just connect your streaming accounts, configure your stream key, and start broadcasting to multiple platforms with one click.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Best Practices for Multi-Streaming'
          },
          {
            type: 'paragraph',
            text: 'When multi-streaming, it\'s important to engage with chat across all platforms. Consider using chat aggregation tools to keep track of messages from different communities.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&h=400&fit=crop',
        categories: ['streaming-guides', 'neustream-features'],
        tags: ['multi-stream', 'Twitch', 'YouTube', 'Neustream', 'streaming tips'],
        metaTitle: 'How to Multi-Stream to Twitch and YouTube Simultaneously',
        metaDescription: 'Learn how to stream to multiple platforms at once using Neustream. Reach a wider audience by broadcasting to Twitch, YouTube, and more.',
        readTimeMinutes: 6
      },
      {
        title: 'Best Streaming Equipment Under $500',
        slug: 'best-streaming-equipment-under-500',
        excerpt: 'Looking to start streaming without breaking the bank? Here are the best budget-friendly streaming equipment options that deliver professional quality.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Introduction to Budget Streaming Setup'
          },
          {
            type: 'paragraph',
            text: 'Starting a streaming career doesn\'t require a massive investment. With under $500, you can build a professional streaming setup that rivals even the biggest creators.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Essential Equipment List'
          },
          {
            type: 'paragraph',
            text: 'Here\'s what you need to get started: a good webcam, quality microphone, proper lighting, and a reliable computer setup.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Best Budget Webcam: Logitech C920'
          },
          {
            type: 'paragraph',
            text: 'The Logitech C920 remains the best budget webcam for streaming. It offers 1080p resolution, good low-light performance, and reliable autofocus.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Best Budget Microphone: Audio-Technica AT2020'
          },
          {
            type: 'paragraph',
            text: 'The AT2020 provides studio-quality audio at an affordable price point. Your audio quality is often more important than video quality for viewer retention.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
        categories: ['equipment-reviews'],
        tags: ['equipment', 'budget', 'webcam', 'microphone', 'streaming gear'],
        metaTitle: 'Best Streaming Equipment Under $500 - Complete Guide',
        metaDescription: 'Discover the best budget-friendly streaming equipment options. Professional quality streaming setup without breaking the bank.',
        readTimeMinutes: 10
      },
      {
        title: '7 Ways to Grow Your Twitch Channel in 2025',
        slug: 'grow-twitch-channel-2025',
        excerpt: 'Learn proven strategies to grow your Twitch audience and build a thriving community. These tips will help you increase viewers, followers, and engagement.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Understanding the Twitch Algorithm'
          },
          {
            type: 'paragraph',
            text: 'The Twitch algorithm favors consistent streaming schedules and high engagement. Understanding how it works is crucial for growth.'
          },
          {
            type: 'heading',
            level: 3,
            text: '1. Maintain a Consistent Schedule'
          },
          {
            type: 'paragraph',
            text: 'Consistency is key on Twitch. Stream at the same times and days to help your audience know when to tune in.'
          },
          {
            type: 'heading',
            level: 3,
            text: '2. Engage with Your Community'
          },
          {
            type: 'paragraph',
            text: 'Read and respond to chat regularly. Make your viewers feel seen and heard - they\'re more likely to return if they feel connected to you.'
          },
          {
            type: 'heading',
            level: 3,
            text: '3. Network with Other Streamers'
          },
          {
            type: 'paragraph',
            text: 'Build relationships with other streamers in your niche. Collaborations and shoutouts can help you tap into existing communities.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=800&h=400&fit=crop',
        categories: ['growth-tips'],
        tags: ['Twitch', 'growth', 'audience', 'community', 'streaming tips'],
        metaTitle: '7 Ways to Grow Your Twitch Channel in 2025',
        metaDescription: 'Proven strategies to grow your Twitch audience and build a thriving community. Increase viewers, followers, and engagement.',
        readTimeMinutes: 12
      },
      {
        title: 'Neustream vs Restream: Complete Feature Comparison',
        slug: 'neustream-vs-restream-comparison',
        excerpt: 'Compare Neustream and Restream to find the best multi-streaming platform for your needs. We break down features, pricing, and performance.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Platform Overview'
          },
          {
            type: 'paragraph',
            text: 'Both Neustream and Restream offer multi-streaming capabilities, but they cater to different types of streamers with unique features and pricing structures.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Pricing Comparison'
          },
          {
            type: 'paragraph',
            text: 'Neustream offers a more generous free tier with essential features, while Restream\'s free plan has more limitations. Paid plans offer different value propositions.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Feature Comparison'
          },
          {
            type: 'paragraph',
            text: 'Key differences include chat integration, analytics, stream quality, and platform support. Neustream excels in ease of use and reliability.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        categories: ['neustream-features', 'industry-news'],
        tags: ['Neustream', 'Restream', 'comparison', 'multi-streaming', 'platform review'],
        metaTitle: 'Neustream vs Restream: Complete Feature Comparison 2025',
        metaDescription: 'Compare Neustream and Restream to find the best multi-streaming platform. Features, pricing, and performance comparison.',
        readTimeMinutes: 7
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

      const result = await db.run(`
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
        let tag = await db.query('SELECT id FROM blog_tags WHERE slug = $1', [tagSlug]);

        if (tag.length === 0) {
          const newTag = await db.run(
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

  } catch (error) {
    console.error('❌ Failed to seed blog content:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seedBlogContent();