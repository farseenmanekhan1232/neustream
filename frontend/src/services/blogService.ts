import { BlogListResponse, BlogPostResponse, BlogListItem } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://api.neustream.app";

interface GetPostsOptions {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface GetCategoryPostsOptions {
  page?: number;
  limit?: number;
}

interface GetTagPostsOptions {
  page?: number;
  limit?: number;
}

interface SearchPostsOptions {
  page?: number;
  limit?: number;
}

interface GetAuthorPostsOptions {
  page?: number;
  limit?: number;
}

interface PostData {
  title: string;
  content: string;
  excerpt?: string;
  slug?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

class BlogService {
  /**
   * Get all blog posts with pagination and filtering
   */
  async getPosts(options: GetPostsOptions = {}): Promise<BlogListResponse> {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      author,
      search,
      sortBy = "published_at",
      sortOrder = "DESC",
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder,
    });

    if (category) params.append("category", category);
    if (tag) params.append("tag", tag);
    if (author) params.append("author", author);
    if (search) params.append("search", search);

    const response = await fetch(`${API_BASE_URL}/api/blog/posts?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug: string): Promise<BlogPostResponse | null> {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get related posts for a given post
   */
  async getRelatedPosts(slug: string, limit = 4): Promise<BlogListItem[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/blog/posts/${slug}/related?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all blog categories
   */
  async getCategories(): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/api/blog/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts in a specific category
   */
  async getCategoryPosts(
    slug: string,
    options: GetCategoryPostsOptions = {},
  ): Promise<BlogListResponse> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/blog/categories/${slug}?${params}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch category posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all blog tags
   */
  async getTags(limit = 50): Promise<unknown> {
    const response = await fetch(
      `${API_BASE_URL}/api/blog/tags?limit=${limit}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts with a specific tag
   */
  async getTagPosts(
    slug: string,
    options: GetTagPostsOptions = {},
  ): Promise<BlogListResponse> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/blog/tags/${slug}?${params}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tag posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search blog posts
   */
  async searchPosts(
    query: string,
    options: SearchPostsOptions = {},
  ): Promise<BlogListResponse> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/blog/search?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to search posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get popular posts
   */
  async getPopularPosts(limit = 5, days = 30): Promise<BlogListItem[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/blog/popular?limit=${limit}&days=${days}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch popular posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts by author
   */
  async getAuthorPosts(
    username: string,
    options: GetAuthorPostsOptions = {},
  ): Promise<BlogListResponse> {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/blog/author/${username}?${params}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch author posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get adjacent posts (previous and next)
   */
  async getAdjacentPosts(postId: string): Promise<unknown> {
    const response = await fetch(
      `${API_BASE_URL}/api/blog/posts/${postId}/adjacent`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch adjacent posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new blog post (requires authentication)
   */
  async createPost(postData: PostData, token: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a blog post (requires authentication)
   */
  async updatePost(
    id: string,
    postData: PostData,
    token: string,
  ): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a blog post (requires authentication)
   */
  async deletePost(id: string, token: string): Promise<unknown> {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Format reading time
   */
  formatReadingTime(minutes: number): string {
    if (minutes <= 1) {
      return "1 min read";
    }
    return `${minutes} min read`;
  }

  /**
   * Extract plain text from HTML content
   */
  extractTextFromHTML(html: string | undefined): string {
    if (!html) return "";
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  /**
   * Generate structured data for SEO
   */
  generateStructuredData(post: unknown): Record<string, unknown> | null {
    if (!post) return null;

    return {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: (post as { title: string }).title,
      description:
        (post as { excerpt?: string; seo?: { metaDescription?: string } })
          .excerpt ||
        (post as { seo?: { metaDescription?: string } }).seo?.metaDescription,
      image: (post as { featuredImage?: string }).featuredImage
        ? [(post as { featuredImage: string }).featuredImage]
        : [],
      datePublished: (post as { publishedAt: string }).publishedAt,
      dateModified: (post as { updatedAt?: string }).updatedAt,
      author: {
        "@type": "Person",
        name:
          (post as { author?: { name?: string } }).author?.name ||
          "Neustream Team",
      },
      publisher: {
        "@type": "Organization",
        name: "Neustream",
        logo: {
          "@type": "ImageObject",
          url: "https://neustream.app/logo.png",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `https://neustream.app/blog/${(post as { slug: string }).slug}`,
      },
    };
  }

  /**
   * Retry a failed request
   */
  async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    throw lastError;
  }

  /**
   * Handle fetch errors with consistent error messages
   */
  handleError(error: unknown, context: string): Error {
    console.error(`Blog service error (${context}):`, error);

    if (
      error instanceof TypeError &&
      (error as Error).message.includes("fetch")
    ) {
      return new Error(
        "Network error. Please check your connection and try again.",
      );
    }

    if (error instanceof Error && error.message.includes("Failed to fetch")) {
      return new Error(
        "Unable to connect to the server. Please try again later.",
      );
    }

    return error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export default new BlogService();
