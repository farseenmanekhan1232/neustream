import { Link } from "react-router-dom";
import { Calendar, Clock, User, Eye } from "lucide-react";
import blogService from "../../services/blogService";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categories?: string[];
  publishedAt: string;
  readingTime: number;
  readTimeMinutes?: number;
  author: {
    name: string;
  };
  views?: number;
  slug: string;
  coverImage?: string;
  featuredImage?: string;
  tags?: string[];
}

interface BlogCardProps {
  post?: BlogPost;
  variant?: "default" | "compact";
  showAuthor?: boolean;
  showExcerpt?: boolean;
  isLoading?: boolean;
}

export default function BlogCard({
  post,
  variant = "default",
  showAuthor = true,
  showExcerpt = true,
  isLoading = false,
}: BlogCardProps) {
  // Loading skeleton
  if (isLoading) {
    if (variant === "compact") {
      return (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-lg overflow-hidden">
        <Skeleton className="aspect-video w-full" />
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center justify-between pt-2 ">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    );
  }

  // Early return if no post data
  if (!post) {
    return null;
  }

  const getCategoryColor = (category: any) => {
    const colors = {
      "streaming-guides": "bg-emerald-500",
      "platform-updates": "bg-blue-500",
      "equipment-reviews": "bg-blue-500",
      "growth-tips": "bg-amber-500",
      "technical-tutorials": "bg-violet-500",
      "industry-news": "bg-cyan-500",
      "success-stories": "bg-rose-500",
      "neustream-features": "bg-indigo-500",
    };
    return colors[category?.slug] || "bg-muted";
  };

  if (variant === "compact") {
    return (
      <div className="group flex flex-col space-y-2">
        <Link
          to={`/blog/${post.slug}`}
          className="font-medium text-lg group-hover:text-primary transition-colors line-clamp-2"
        >
          {post.title}
        </Link>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{blogService.formatDate(post.publishedAt)}</span>
          </span>
          {post.readTimeMinutes && (
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{blogService.formatReadingTime(post.readTimeMinutes)}</span>
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-card border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Featured Image */}
      {post.featuredImage && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6 space-y-4">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.slice(0, 2).map((category) => (
              <Link key={category.id} to={`/blog/category/${category.slug}`}>
                <Badge
                  variant="secondary"
                  className={`text-xs ${getCategoryColor(category)} text-white hover:opacity-80 transition-opacity`}
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <Link
          to={`/blog/${post.slug}`}
          className="block group-hover:text-primary transition-colors"
        >
          <h3 className="text-xl font-semibold leading-tight line-clamp-2 group-hover:underline">
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {showExcerpt && post.excerpt && (
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                <Badge variant="outline" className="text-xs hover:bg-muted">
                  #{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Meta Information */}
        <div className="flex items-center justify-between pt-2 ">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {showAuthor && post.author?.name && (
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{post.author.name}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{blogService.formatDate(post.publishedAt)}</span>
            </span>
            {post.readTimeMinutes && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>
                  {blogService.formatReadingTime(post.readTimeMinutes)}
                </span>
              </span>
            )}
          </div>

          {post.viewCount > 0 && (
            <span className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Eye className="w-3 h-3" />
              <span>{post.viewCount.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
