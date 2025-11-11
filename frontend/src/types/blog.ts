// Blog and content types

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: BlogAuthor;
  tags: string[];
  publishedAt: string;
  updatedAt?: string;
  readingTime: number;
  isPublished: boolean;
  seo?: SEOData;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: string;
}

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  author: BlogAuthor;
  publishedAt: string;
  readingTime: number;
  tags: string[];
}

export interface BlogListResponse {
  posts: BlogListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BlogPostResponse {
  post: BlogPost;
  relatedPosts: BlogListItem[];
}
