const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.neustream.app';

class BlogService {
  /**
   * Get all blog posts with pagination and filtering
   */
  async getPosts(options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      author,
      search,
      sortBy = 'published_at',
      sortOrder = 'DESC'
    } = options;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (category) params.append('category', category);
    if (tag) params.append('tag', tag);
    if (author) params.append('author', author);
    if (search) params.append('search', search);

    const response = await fetch(`${API_BASE_URL}/api/blog/posts?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get a single blog post by slug
   */
  async getPostBySlug(slug) {
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
  async getRelatedPosts(slug, limit = 4) {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${slug}/related?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch related posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all blog categories
   */
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/api/blog/categories`);

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts in a specific category
   */
  async getCategoryPosts(slug, options = {}) {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/blog/categories/${slug}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch category posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all blog tags
   */
  async getTags(limit = 50) {
    const response = await fetch(`${API_BASE_URL}/api/blog/tags?limit=${limit}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts with a specific tag
   */
  async getTagPosts(slug, options = {}) {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/blog/tags/${slug}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch tag posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Search blog posts
   */
  async searchPosts(query, options = {}) {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString()
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
  async getPopularPosts(limit = 5, days = 30) {
    const response = await fetch(`${API_BASE_URL}/api/blog/popular?limit=${limit}&days=${days}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch popular posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get posts by author
   */
  async getAuthorPosts(username, options = {}) {
    const { page = 1, limit = 10 } = options;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/blog/author/${username}?${params}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch author posts: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a new blog post (requires authentication)
   */
  async createPost(postData, token) {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update a blog post (requires authentication)
   */
  async updatePost(id, postData, token) {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete a blog post (requires authentication)
   */
  async deletePost(id, token) {
    const response = await fetch(`${API_BASE_URL}/api/blog/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Format reading time
   */
  formatReadingTime(minutes) {
    if (minutes <= 1) {
      return '1 min read';
    }
    return `${minutes} min read`;
  }

  /**
   * Extract plain text from HTML content
   */
  extractTextFromHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  /**
   * Generate structured data for SEO
   */
  generateStructuredData(post) {
    if (!post) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt || post.seo?.metaDescription,
      image: post.featuredImage ? [post.featuredImage] : [],
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        '@type': 'Person',
        name: post.author?.name || 'Neustream Team'
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
  }
}

export default new BlogService();