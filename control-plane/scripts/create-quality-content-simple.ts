import * as dotenv from "dotenv";
import Database from "../lib/database";

dotenv.config();

async function createQualityBlogContent(): Promise<void> {
  console.log('📝 Creating high-quality blog content...');

  const db = new Database();

  try {
    await db.connect();

    // Get the admin user
    const adminUsers = await db.query<{ id: number }>('SELECT id FROM users WHERE email = $1', ['admin@neustream.app']);
    const authorId = adminUsers.length > 0 ? adminUsers[0].id : 3;

    // Get categories
    const categories = await db.query<{ id: number; slug: string }>('SELECT id, slug FROM blog_categories');
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, number>);

    // High-quality blog posts with real value
    const qualityBlogPosts = [
      {
        title: 'OBS Studio Settings: Complete Optimization Guide for 2025',
        slug: 'obs-studio-complete-optimization-guide-2025',
        excerpt: 'Master OBS Studio settings for perfect stream quality. Learn about bitrate, encoder settings, output formats, and advanced configurations used by professional streamers.',
        contentHtml: `<h2>Why OBS Settings Matter for Stream Quality</h2>
        <p>Your OBS settings directly impact stream quality, viewer experience, and even discoverability on platforms like Twitch and YouTube. Poor settings can result in pixelated video, audio sync issues, or dropped frames that drive viewers away.</p>

        <h3>Understanding Key OBS Settings</h3>
        <p>Before diving into specific settings, it's crucial to understand what each setting does:</p>
        <p>• Bitrate: Determines how much data you send per second. Higher bitrate = better quality but requires more upload speed<br>
        • Encoder: How OBS compresses your video. x264 uses CPU, NVENC/AMF use GPU<br>
        • Resolution: Your stream dimensions (1920x1080 for 1080p)<br>
        • FPS: Frames per second (60 for smooth gameplay, 30 for static content)<br>
        • Keyframe Interval: How often full frames are sent (2 seconds is standard)</p>

        <h3>Recommended Settings for Different Internet Speeds</h3>
        <p>Your internet upload speed determines your optimal settings:</p>
        <p>For 6-10 Mbps upload (most common):<br>
        • 1080p 60fps: 6000 bitrate, NVENC encoder<br>
        • 1080p 30fps: 4500 bitrate, x264 medium preset<br>
        • Audio: 160 bitrate, AAC codec</p>

        <p>For 3-6 Mbps upload:<br>
        • 900p 60fps: 5000 bitrate, NVENC<br>
        • 720p 60fps: 4500 bitrate, x264 fast<br>
        • Audio: 128 bitrate</p>

        <p>For under 3 Mbps:<br>
        • 720p 30fps: 2500-3000 bitrate<br>
        • Consider 480p if consistently under 2 Mbps</p>

        <h3>Advanced Encoder Settings for Professional Quality</h3>
        <p>For NVENC (NVIDIA GPU) users:<br>
        • Preset: Quality (or Max Quality if GPU can handle it)<br>
        • Profile: High<br>
        • Look-ahead: Enabled<br>
        • Psycho Visual Tuning: Enabled<br>
        • Max B-frames: 2</p>

        <p>For x264 (CPU) users:<br>
        • CPU Usage Preset: veryfast (balance of quality and performance)<br>
        • Profile: high<br>
        • Tune: zerolatency (required for streaming)<br>
        • x264 Options: scenecut=0</p>

        <h3>Testing Your Settings Before Going Live</h3>
        <p>Always test with these steps:<br>
        1. Use the "Start Recording" feature with your stream settings<br>
        2. Record for 5-10 minutes with typical content (gaming, talking, etc.)<br>
        3. Check the video file for quality and sync issues<br>
        4. Upload the file to YouTube or similar to see how compression affects it<br>
        5. Stream to Twitch/YouTube as "test" or "private" to check stability</p>

        <h2>Troubleshooting Common OBS Issues</h2>
        <p>Dropped frames: Reduce bitrate or check network stability<br>
        Pixelated video: Increase bitrate or check encoder settings<br>
        Audio sync issues: Check audio/video sync offset in advanced audio properties<br>
        High CPU usage: Switch to GPU encoder or lower x264 preset</p>`,
        featuredImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&h=400&fit=crop',
        categories: ['technical-tutorials', 'streaming-guides'],
        tags: ['OBS Studio', 'stream settings', 'bitrate', 'encoder', 'streaming optimization', 'technical guide'],
        metaTitle: 'OBS Studio Settings: Complete Optimization Guide 2025',
        metaDescription: 'Master OBS Studio settings for perfect stream quality. Learn bitrate, encoder settings, and optimization for professional streaming.',
        readTimeMinutes: 15
      }
    ];

    // Insert high-quality blog posts
    for (const post of qualityBlogPosts) {
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
        JSON.stringify([]), // Empty content array since we're using content_html
        post.contentHtml,
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

      console.log(`✅ Created high-quality blog post: ${post.title}`);
    }

    console.log('✅ High-quality blog content created successfully!');

  } catch (error: any) {
    console.error('❌ Failed to create blog content:', error.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createQualityBlogContent();
