import express, { Request, Response } from "express";
import blogService from "../services/blogService";
import { authenticateToken } from "../middleware/auth";
import Database from "../lib/database";

const router = express.Router();
const db = new Database();

// Pre-connect to database when the module loads
db.connect().catch((err) => {
  console.error("Failed to pre-connect to database:", err);
});

// Public routes

/**
 * GET /api/blog/posts
 * Get all published blog posts with pagination and filtering
 * Query params: page, limit, category, tag, author, search, sortBy, sortOrder
 */
router.get("/posts", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      author,
      search,
      sortBy = "published_at",
      sortOrder = "DESC",
    } = req.query as any;

    const options = {
      page: parseInt(page.toString()),
      limit: Math.min(parseInt(limit.toString()), 50), // Max 50 posts per page
      categorySlug: category,
      tagSlug: tag,
      authorId: author ? parseInt(author.toString()) : null,
      search,
      sortBy,
      sortOrder: sortOrder.toString().toUpperCase(),
    };

    const result = await blogService.getPosts(options);
    res.json(result);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

/**
 * GET /api/blog/posts/:slug
 * Get a single blog post by slug
 */
router.get("/posts/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await blogService.getPostBySlug(slug);

    if (!post) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    // Add structured data for SEO
    (post as any).structuredData = blogService.generateStructuredData(post);

    res.json(post);
  } catch (error) {
    console.error("Error fetching blog post:", error);
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

/**
 * GET /api/blog/posts/:slug/related
 * Get related blog posts
 */
router.get("/posts/:slug/related", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query as any;

    // First get the post to find its ID
    const post = await blogService.getPostBySlug(slug);
    if (!post) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    const relatedPosts = await blogService.getRelatedPosts(
      post.id,
      parseInt(limit.toString()),
    );
    res.json({ posts: relatedPosts });
  } catch (error) {
    console.error("Error fetching related posts:", error);
    res.status(500).json({ error: "Failed to fetch related posts" });
  }
});

/**
 * GET /api/blog/categories
 * Get all blog categories with post counts
 */
router.get("/categories", async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await blogService.getCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * GET /api/blog/categories/:slug
 * Get posts in a specific category
 */
router.get("/categories/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query as any;

    const options = {
      page: parseInt(page.toString()),
      limit: Math.min(parseInt(limit.toString()), 50),
      categorySlug: slug,
    };

    const result = await blogService.getPosts(options);

    // Get category info
    const categories = await blogService.getCategories();
    const category = categories.find((cat) => cat.slug === slug);

    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      category,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching category posts:", error);
    res.status(500).json({ error: "Failed to fetch category posts" });
  }
});

/**
 * GET /api/blog/tags
 * Get all blog tags with usage counts
 */
router.get("/tags", async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 50 } = req.query as any;
    const tags = await blogService.getTags(parseInt(limit.toString()));
    res.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

/**
 * GET /api/blog/tags/:slug
 * Get posts with a specific tag
 */
router.get("/tags/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 10 } = req.query as any;

    const options = {
      page: parseInt(page.toString()),
      limit: Math.min(parseInt(limit.toString()), 50),
      tagSlug: slug,
    };

    const result = await blogService.getPosts(options);

    // Get tag info
    const tags = await blogService.getTags();
    const tag = tags.find((t) => t.slug === slug);

    if (!tag) {
      res.status(404).json({ error: "Tag not found" });
      return;
    }

    res.json({
      tag,
      ...result,
    });
  } catch (error) {
    console.error("Error fetching tag posts:", error);
    res.status(500).json({ error: "Failed to fetch tag posts" });
  }
});

/**
 * GET /api/blog/search
 * Search blog posts
 */
router.get("/search", async (req: Request, res: Response): Promise<void> => {
  try {
    const { q: query, page = 1, limit = 10 } = req.query as any;

    if (!query || query.toString().trim().length < 2) {
      res
        .status(400)
        .json({ error: "Search query must be at least 2 characters long" });
      return;
    }

    const options = {
      page: parseInt(page.toString()),
      limit: Math.min(parseInt(limit.toString()), 50),
    };

    const result = await blogService.searchPosts(query.toString().trim(), options);
    res.json({
      query: query.toString().trim(),
      ...result,
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ error: "Failed to search posts" });
  }
});

/**
 * GET /api/blog/popular
 * Get popular blog posts
 */
router.get("/popular", async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 5, days = 30 } = req.query as any;
    const posts = await blogService.getPopularPosts(
      Math.min(parseInt(limit.toString()), 20),
      Math.min(parseInt(days.toString()), 365),
    );
    res.json({ posts });
  } catch (error) {
    console.error("Error fetching popular posts:", error);
    res.status(500).json({ error: "Failed to fetch popular posts" });
  }
});

/**
 * GET /api/blog/sitemap.xml
 * Generate XML sitemap for blog posts
 */
router.get("/sitemap.xml", async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await blogService.getPosts({
      limit: 1000,
      status: "published",
    });
    const categories = await blogService.getCategories();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add blog main page
    xml += `
  <url>
    <loc>https://neustream.app/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    // Add category pages
    categories.forEach((category) => {
      xml += `
  <url>
    <loc>https://neustream.app/blog/category/${category.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Add blog posts
    posts.posts.forEach((post) => {
      const lastmod = post.updatedAt || post.publishedAt || post.createdAt;
      xml += `
  <url>
    <loc>https://neustream.app/blog/${post.slug}</loc>
    <lastmod>${new Date(lastmod!).toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`;
    });

    xml += "\n</urlset>";

    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).json({ error: "Failed to generate sitemap" });
  }
});

/**
 * GET /api/blog/author/:username
 * Get posts by a specific author
 */
router.get("/author/:username", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 10 } = req.query as any;

    // Find user by email (assuming username is email prefix or display name)
    const users = await db.query<any>(
      "SELECT id, display_name, email, avatar_url FROM users WHERE display_name ILIKE $1 OR email ILIKE $2",
      [`%${username}%`, `%${username}%`],
    );

    if (users.length === 0) {
      res.status(404).json({ error: "Author not found" });
      return;
    }

    const author = users[0];

    const options = {
      page: parseInt(page.toString()),
      limit: Math.min(parseInt(limit.toString()), 50),
      authorId: author.id,
    };

    const result = await blogService.getPosts(options);

    res.json({
      author: {
        id: author.id,
        name: author.display_name,
        email: author.email,
        avatar: author.avatar_url,
      },
      ...result,
    });
  } catch (error) {
    console.error("Error fetching author posts:", error);
    res.status(500).json({ error: "Failed to fetch author posts" });
  }
});

// Admin routes (require authentication)

/**
 * POST /api/blog/posts
 * Create a new blog post (Admin only)
 */
router.post("/posts", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const postData = {
      ...req.body,
      authorId: (req as any).user.id, // Set author from authenticated user
    };

    const postId = await blogService.createPost(postData);

    // Handle categories and tags if provided
    if (req.body.categories && req.body.categories.length > 0) {
      for (const categoryId of req.body.categories) {
        await db.run(
          "INSERT INTO blog_post_categories (post_id, category_id) VALUES ($1, $2)",
          [postId, categoryId],
        );
      }
    }

    if (req.body.tags && req.body.tags.length > 0) {
      for (const tagName of req.body.tags) {
        // Create tag if it doesn't exist
        const tagSlug = tagName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-");
        let tag = await db.query<{ id: number }>("SELECT id FROM blog_tags WHERE slug = $1", [
          tagSlug,
        ]);

        if (tag.length === 0) {
          const newTag = await db.run<{ id: number }>(
            "INSERT INTO blog_tags (name, slug) VALUES ($1, $2) RETURNING id",
            [tagName, tagSlug],
          );
          tag = [{ id: newTag.id }];
        }

        await db.run(
          "INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)",
          [postId, tag[0].id],
        );
      }
    }

    const post = await blogService.getPostBySlug(postData.slug);
    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({ error: "Failed to create blog post" });
  }
});

/**
 * PUT /api/blog/posts/:id
 * Update a blog post (Admin only)
 */
router.put("/posts/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = id; // Keep as UUID string

    // Check if post exists and user has permission
    const existingPosts = await db.query<{ author_id: number }>(
      "SELECT author_id FROM blog_posts WHERE id = $1",
      [postId],
    );

    if (existingPosts.length === 0) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    const post = existingPosts[0];

    // Allow update if user is author or admin (you might want to add admin role check)
    if (post.author_id !== (req as any).user.id) {
      res
        .status(403)
        .json({ error: "Not authorized to update this post" });
      return;
    }

    await blogService.updatePost(postId, req.body);

    // Update categories if provided
    if (req.body.categories !== undefined) {
      await db.run("DELETE FROM blog_post_categories WHERE post_id = $1", [
        postId,
      ]);

      if (req.body.categories.length > 0) {
        for (const categoryId of req.body.categories) {
          await db.run(
            "INSERT INTO blog_post_categories (post_id, category_id) VALUES ($1, $2)",
            [postId, categoryId],
          );
        }
      }
    }

    // Update tags if provided
    if (req.body.tags !== undefined) {
      // Remove existing tags
      await db.run("DELETE FROM blog_post_tags WHERE post_id = $1", [postId]);

      if (req.body.tags.length > 0) {
        for (const tagName of req.body.tags) {
          const tagSlug = tagName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-");
          let tag = await db.query<{ id: number }>("SELECT id FROM blog_tags WHERE slug = $1", [
            tagSlug,
          ]);

          if (tag.length === 0) {
            const newTag = await db.run<{ id: number }>(
              "INSERT INTO blog_tags (name, slug) VALUES ($1, $2) RETURNING id",
              [tagName, tagSlug],
            );
            tag = [{ id: newTag.id }];
          }

          await db.run(
            "INSERT INTO blog_post_tags (post_id, tag_id) VALUES ($1, $2)",
            [postId, tag[0].id],
          );
        }
      }
    }

    const updatedPost = await db.query<any>(
      `
      SELECT * FROM blog_posts WHERE id = $1
    `,
      [postId],
    );

    res.json(blogService.transformPost(updatedPost[0]));
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
});

/**
 * DELETE /api/blog/posts/:id
 * Delete a blog post (Admin only)
 */
router.delete("/posts/:id", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const postId = id;

    // Check if post exists and user has permission
    const existingPosts = await db.query<{ author_id: number }>(
      "SELECT author_id FROM blog_posts WHERE id = $1",
      [postId],
    );

    if (existingPosts.length === 0) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    const post = existingPosts[0];

    // Allow delete if user is author or admin
    if (post.author_id !== (req as any).user.id) {
      res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
      return;
    }

    await blogService.deletePost(postId);
    res.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});

/**
 * POST /api/blog/upload
 * Upload image for blog post (Admin only)
 */
router.post("/upload", authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    // This is a placeholder for image upload functionality
    // In a real implementation, you would:
    // 1. Handle multipart/form-data
    // 2. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 3. Return the uploaded image URL

    res.status(501).json({
      error: "Image upload not implemented yet",
      message:
        "Please implement image upload functionality with your preferred storage provider",
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export default router;
