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
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Why OBS Settings Matter for Stream Quality'
          },
          {
            type: 'paragraph',
            text: 'Your OBS settings directly impact stream quality, viewer experience, and even discoverability on platforms like Twitch and YouTube. Poor settings can result in pixelated video, audio sync issues, or dropped frames that drive viewers away.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Understanding Key OBS Settings'
          },
          {
            type: 'paragraph',
            text: 'Before diving into specific settings, it\'s crucial to understand what each setting does:'
          },
          {
            type: 'paragraph',
            text: '• Bitrate: Determines how much data you send per second. Higher bitrate = better quality but requires more upload speed\n• Encoder: How OBS compresses your video. x264 uses CPU, NVENC/AMF use GPU\n• Resolution: Your stream dimensions (1920x1080 for 1080p)\n• FPS: Frames per second (60 for smooth gameplay, 30 for static content)\n• Keyframe Interval: How often full frames are sent (2 seconds is standard)'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Recommended Settings for Different Internet Speeds'
          },
          {
            type: 'paragraph',
            text: 'Your internet upload speed determines your optimal settings:'
          },
          {
            type: 'paragraph',
            text: 'For 6-10 Mbps upload (most common):\n• 1080p 60fps: 6000 bitrate, NVENC encoder\n• 1080p 30fps: 4500 bitrate, x264 medium preset\n• Audio: 160 bitrate, AAC codec\n\nFor 3-6 Mbps upload:\n• 900p 60fps: 5000 bitrate, NVENC\n• 720p 60fps: 4500 bitrate, x264 fast\n• Audio: 128 bitrate\n\nFor under 3 Mbps:\n• 720p 30fps: 2500-3000 bitrate\n• Consider 480p if consistently under 2 Mbps'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Advanced Encoder Settings for Professional Quality'
          },
          {
            type: 'paragraph',
            text: 'For NVENC (NVIDIA GPU) users:\n• Preset: Quality (or Max Quality if GPU can handle it)\n• Profile: High\n• Look-ahead: Enabled\n• Psycho Visual Tuning: Enabled\n• Max B-frames: 2'
          },
          {
            type: 'paragraph',
            text: 'For x264 (CPU) users:\n• CPU Usage Preset: veryfast (balance of quality and performance)\n• Profile: high\n• Tune: zerolatency (required for streaming)\n• x264 Options: scenecut=0'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Network Settings for Stable Streaming'
          },
          {
            type: 'paragraph',
            text: 'Stability is more important than peak quality:'
          },
          {
            type: 'paragraph',
            text: '• Network Bind to IP: Leave as default unless on multiple networks\n• Enable Dynamic Bitrate: No (set manually)\n• Low Latency Mode: Enabled\n• Duplicates of network packets: 3-4 (helps with packet loss)\n• Network Pacing: Enabled (prevents bandwidth spikes)'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Testing Your Settings Before Going Live'
          },
          {
            type: 'paragraph',
            text: 'Always test with these steps:'
          },
          {
            type: 'paragraph',
            text: '1. Use the "Start Recording" feature with your stream settings\n2. Record for 5-10 minutes with typical content (gaming, talking, etc.)\n3. Check the video file for quality and sync issues\n4. Upload the file to YouTube or similar to see how compression affects it\n5. Stream to Twitch/YouTube as "test" or "private" to check stability'
          },
          {
            type: 'heading',
            level: 2,
            text: 'Troubleshooting Common OBS Issues'
          },
          {
            type: 'paragraph',
            text: 'Dropped frames: Reduce bitrate or check network stability\nPixelated video: Increase bitrate or check encoder settings\nAudio sync issues: Check audio/video sync offset in advanced audio properties\nHigh CPU usage: Switch to GPU encoder or lower x264 preset'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&h=400&fit=crop',
        categories: ['technical-tutorials', 'streaming-guides'],
        tags: ['OBS Studio', 'stream settings', 'bitrate', 'encoder', 'streaming optimization', 'technical guide'],
        metaTitle: 'OBS Studio Settings: Complete Optimization Guide 2025',
        metaDescription: 'Master OBS Studio settings for perfect stream quality. Learn bitrate, encoder settings, and optimization for professional streaming.',
        readTimeMinutes: 15
      },
      {
        title: 'Twitch Algorithm 2025: How Discovery Actually Works',
        slug: 'twitch-algorithm-2025-discovery-guide',
        excerpt: 'Deep dive into how Twitch\'s algorithm works in 2025. Learn what factors influence discoverability, how recommendations work, and strategies to increase your visibility.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Understanding Twitch\'s Algorithm in 2025'
          },
          {
            type: 'paragraph',
            text: 'Twitch\'s algorithm has evolved significantly from simple chronological browsing to a complex recommendation system. Understanding how it works is crucial for growth on the platform.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Key Algorithm Factors That Matter'
          },
          {
            type: 'paragraph',
            text: 'Based on Twitch\'s official statements and community research, these factors most influence your discoverability:'
          },
          {
            type: 'paragraph',
            text: '1. **Viewer Retention (Most Important)**: How long viewers stay on your stream\n2. **Concurrent Viewers**: Total viewers at any given moment\n3. **Chat Activity**: Messages per viewer and engagement rate\n4. **Follow-to-Viewer Conversion**: Percentage of viewers who follow\n5. **Consistency**: Regular streaming schedule\n6. **Category Performance**: How well you perform in your chosen game/category'
          },
          {
            type: 'heading',
            level: 3,
            text: 'How the Browse Page Algorithm Works'
          },
          {
            type: 'paragraph',
            text: 'The browse page is where most new viewers discover streams. Here\'s how Twitch ranks channels:'
          },
          {
            type: 'paragraph',
            text: '• **Current Viewers**: Baseline requirement (usually need 5-10+ viewers to appear)\n• **Growth Rate**: How quickly you\'re gaining viewers\n• **Viewer Geography**: Twitch prioritizes showing local streamers\n• **Language Matching**: Stream language vs viewer language\n• **Previous Interactions**: If viewer has watched your stream before\n• **Game History**: Viewer\'s history with the game you\'re playing'
          },
          {
            type: 'heading',
            level: 3,
            text: 'The Recommendation Engine'
          },
          {
            type: 'paragraph',
            text: 'Twitch\'s recommendation system works similarly to Netflix or YouTube:'
          },
          {
            type: 'paragraph',
            text: '• **Collaborative Filtering**: "Viewers who watched X also watched Y"\n• **Content-Based Filtering**: Recommending similar content to what users watch\n• **Cold Start Problem**: New streamers need initial viewers to get recommendations\n• **Feedback Loop**: More views → more recommendations → more views'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Proven Strategies to Boost Algorithm Performance'
          },
          {
            type: 'paragraph',
            text: 'Based on analysis of successful channels:'
          },
          {
            type: 'paragraph',
            text: '1. **Stream During Peak Hours**: 7-11 PM in your target timezone\n2. **Choose Games Wisely**: Balance between popular and discoverable games\n3. **Engage Immediately**: Greet new viewers within 30 seconds\n4. **Use Keywords Effectively**: Game name, language, content type in title\n5. **Network Strategically**: Collaborate with similar-sized streamers\n6. **Create Clips**: Clipped content drives algorithm discovery\n7. **Maintain High Energy**: Algorithm favors streams with high engagement'
          },
          {
            type: 'heading',
            level: 3,
            text: 'What NOT to Do: Algorithm Penalties'
          },
          {
            type: 'paragraph',
            text: 'Avoid these common mistakes that hurt algorithm performance:'
          },
          {
            type: 'paragraph',
            text: '• Clickbait titles with unrelated content\n• Streaming in multiple categories (confuses algorithm)\n• Inconsistent schedule (hurts predictability)\n• Ignoring chat engagement\n• Using viewer bots (immediate and permanent penalties)\n• Excessive offline time (algorithm "forgets" your channel)'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Measuring Algorithm Performance'
          },
          {
            type: 'paragraph',
            text: 'Key metrics to track:'
          },
          {
            type: 'paragraph',
            text: '• Browse page placement\n• Discovery rate (% of viewers from browse vs direct)\n• Follow conversion rate\n• Average viewer duration\n• Chat engagement per viewer\n• Clip creation rate'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=400&fit=crop',
        categories: ['growth-tips', 'platform-updates'],
        tags: ['Twitch algorithm', 'discoverability', 'growth strategy', 'streaming tips', 'Twitch 2025'],
        metaTitle: 'Twitch Algorithm 2025: Complete Discovery & Growth Guide',
        metaDescription: 'How Twitch\'s algorithm actually works in 2025. Learn discoverability factors, recommendations, and proven growth strategies.',
        readTimeMinutes: 12
      },
      {
        title: 'Stream Funding: How to Monetize Beyond Twitch Subs',
        slug: 'stream-funding-monetization-beyond-subs',
        excerpt: 'Complete guide to diversifying your stream income beyond traditional subscriptions. Learn about sponsorships, donations, merchandise, and alternative revenue streams.',
        content: [
          {
            type: 'heading',
            level: 2,
            text: 'Why Diversifying Your Income Matters'
          },
          {
            type: 'paragraph',
            text: 'Relying solely on Twitch subscriptions is risky. Successful streamers typically have 4-7 different income streams. Here\'s how to build a sustainable monetization strategy.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Direct Donations & Tips'
          },
          {
            type: 'paragraph',
            text: 'Setup multiple donation platforms:'
          },
          {
            type: 'paragraph',
            text: '• **Twitch Bits**: Integrated, but Twitch takes 30%\n• **Streamlabs**: Multiple platforms, 5% fee\n• **PayPal Direct**: No fees (except PayPal\'s ~3%)\n• **Patreon**: Monthly support, 5-12% fee\n• **Ko-fi**: Simple donations, no monthly fees'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Brand Sponsorships: The Real Money'
          },
          {
            type: 'paragraph',
            text: 'Where the money really is for mid-sized and large streamers:'
          },
          {
            type: 'paragraph',
            text: '**Getting Started**: You don\'t need thousands of viewers. Brands look for:\n• 50+ concurrent viewers minimum\n• Engaged community\n• Professional content quality\n• Niche audience alignment\n• Professional communication'
          },
          {
            type: 'paragraph',
            text: '**Sponsorship Types**:\n• **Product Placement**: $50-500/stream (depending on size)\n• **Sponsored Streams**: $200-2000 per stream\n• **Brand Ambassadorship**: $500-5000/month\n• **Affiliate Codes**: 5-20% commission on sales'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Merchandise: Physical Products'
          },
          {
            type: 'paragraph',
            text: 'When and how to launch merchandise:'
          },
          {
            type: 'paragraph',
            text: '**Start When**: 100+ consistent viewers\n• **Platforms**: Streamlabs Merch, Teespring, Custom print-on-demand\n• **Products**: T-shirts, hoodies, mugs, mousepads\n• **Margins**: 30-50% profit on most items\n• **Success Rate**: 1-5% of viewers typically buy merch'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Digital Products: High Margin Revenue'
          },
          {
            type: 'paragraph',
            text: 'Create once, sell infinitely:'
          },
          {
            type: 'paragraph',
            text: '• **Emote Packs**: $5-20 per pack\n• **Stream Overlays**: $10-100 per design\n• **Alert Packages**: $15-50\n• **Guides/Tutorials**: $20-100\n• **Presets**: $5-30 for OBS, audio, etc.'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Services & Consulting'
          },
          {
            type: 'paragraph',
            text: 'Leverage your expertise:'
          },
          {
            type: 'paragraph',
            text: '• **Channel Reviews**: $50-200 per review\n• **Coaching Sessions**: $50-200/hour\n• **Setup Consulting**: $100-500 for complete setup\n• **Content Creation**: Video editing, thumbnail design\n• **Moderation Services**: $50-200/month per channel'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Alternative Platforms & Opportunities'
          },
          {
            type: 'paragraph',
            text: 'Don\'t limit yourself to streaming platforms:'
          },
          {
            type: 'paragraph',
            text: '• **YouTube**: Ad revenue from stream highlights\n• **TikTok**: Short-form content drives new viewers\n• **Discord**: Community management, exclusive content\n• **Patreon**: Exclusive behind-the-scenes content\n• **OnlyFans**: Adult content (if appropriate for your brand)'
          },
          {
            type: 'heading',
            level: 3,
            text: 'Realistic Income Breakdown'
          },
          {
            type: 'paragraph',
            text: 'For a streamer with 100 average viewers:\n• Twitch Subs: ~$250/month (after splits)\n• Donations: $100-500/month\n• Sponsorships: $200-1000/month\n• Merchandise: $50-300/month\n• Digital Products: $100-400/month\n• **Total**: $700-2450/month potential'
          },
          {
            type: 'heading',
            level: 2,
            text: 'Building Your Monetization Strategy'
          },
          {
            type: 'paragraph',
            text: 'Start small and scale up. Focus on 1-2 revenue streams initially, then expand as you grow. Always prioritize community trust over short-term profits.'
          }
        ],
        featuredImage: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
        categories: ['growth-tips', 'industry-news'],
        tags: ['monetization', 'sponsorship', 'donations', 'merchandise', 'stream income', 'business'],
        metaTitle: 'Stream Funding Guide: Monetize Beyond Twitch Subscriptions',
        metaDescription: 'Complete guide to diversifying stream income. Learn sponsorships, donations, merchandise, and alternative revenue streams.',
        readTimeMinutes: 18
      }
    ];

    // Insert high-quality blog posts
    for (const post of qualityBlogPosts) {
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
