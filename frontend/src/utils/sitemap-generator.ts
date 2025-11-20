/**
 * Sitemap Generator for neustream
 * Generates XML sitemap with all public pages, blog posts, and documentation
 */

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const BASE_URL = 'https://neustream.app';

/**
 * Static routes configuration
 */
const staticRoutes: SitemapUrl[] = [
  // Homepage
  {
    loc: '/',
    changefreq: 'daily',
    priority: 1.0,
  },
  
  // Main pages
  {
    loc: '/features',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/blog',
    changefreq: 'daily',
    priority: 0.8,
  },
  {
    loc: '/faq',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/contact',
    changefreq: 'monthly',
    priority: 0.6,
  },
  {
    loc: '/about',
    changefreq: 'monthly',
    priority: 0.6,
  },
  
  // Legal pages
  {
    loc: '/privacy',
    changefreq: 'yearly',
    priority: 0.4,
  },
  {
    loc: '/terms',
    changefreq: 'yearly',
    priority: 0.4,
  },
  
  // Alternative/Comparison pages (high priority for SEO)
  {
    loc: '/alternatives',
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/alternatives/restream',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/alternatives/obs-live',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/alternatives/streamyard',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/alternatives/castr',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    loc: '/comparison',
    changefreq: 'monthly',
    priority: 0.8,
  },
  
  // Documentation
  {
    loc: '/docs/getting-started',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/docs/platforms',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/docs/troubleshooting',
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/docs/api',
    changefreq: 'monthly',
    priority: 0.7,
  },
];

/**
 * Fetch blog posts from API for sitemap
 */
async function fetchBlogPosts(): Promise<SitemapUrl[]> {
  try {
    // Fetch all blog posts (paginated)
    const blogUrls: SitemapUrl[] = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `http://localhost:5000/api/blog/posts?page=${page}&limit=100`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch blog posts for sitemap');
        break;
      }
      
      const data = await response.json();
      const posts = data.posts || [];
      
      posts.forEach((post: any) => {
        blogUrls.push({
          loc: `/blog/${post.slug}`,
          lastmod: post.updated_at || post.published_at,
          changefreq: 'monthly',
          priority: 0.7,
        });
      });
      
      hasMore = data.pagination?.hasNextPage || false;
      page++;
    }
    
    return blogUrls;
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

/**
 * Generate XML sitemap string
 */
function generateSitemapXML(urls: SitemapUrl[]): string {
  const urlEntries = urls.map(url => {
    const loc = `${BASE_URL}${url.loc}`;
    const lastmod = url.lastmod 
      ? `    <lastmod>${new Date(url.lastmod).toISOString()}</lastmod>`
      : '';
    const changefreq = url.changefreq 
      ? `    <changefreq>${url.changefreq}</changefreq>`
      : '';
    const priority = url.priority !== undefined
      ? `    <priority>${url.priority.toFixed(1)}</priority>`
      : '';
    
    return `  <url>
    <loc>${loc}</loc>${lastmod ? '\n' + lastmod : ''}${changefreq ? '\n' + changefreq : ''}${priority ? '\n' + priority : ''}
  </url>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Generate complete sitemap
 */
export async function generateSitemap(): Promise<string> {
  // Combine static routes with dynamic blog posts
  const blogPosts = await fetchBlogPosts();
  const allUrls = [...staticRoutes, ...blogPosts];
  
  return generateSitemapXML(allUrls);
}

/**
 * Generate sitemap and save to file (for build-time generation)
 */
export async function generateAndSaveSitemap(outputPath: string): Promise<void> {
  const sitemap = await generateSitemap();
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, sitemap, 'utf-8');
  console.log(`✓ Sitemap generated at ${outputPath}`);
}

/**
 * Express/API route handler for dynamic sitemap
 */
export async function sitemapHandler(_req: any, res: any): Promise<void> {
  try {
    const sitemap = await generateSitemap();
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
}

export default {
  generateSitemap,
  generateAndSaveSitemap,
  sitemapHandler,
};
