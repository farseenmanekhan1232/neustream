import { Link } from 'react-router-dom';
import { Calendar, Clock, User, Eye } from 'lucide-react';
import blogService from '../../services/blogService';
import { Badge } from '../ui/badge';

export default function BlogCard({ post, variant = 'default', showAuthor = true, showExcerpt = true }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      'streaming-guides': 'bg-red-500',
      'platform-updates': 'bg-blue-500',
      'equipment-reviews': 'bg-green-500',
      'growth-tips': 'bg-yellow-500',
      'technical-tutorials': 'bg-purple-500',
      'industry-news': 'bg-cyan-500',
      'success-stories': 'bg-pink-500',
      'neustream-features': 'bg-indigo-500'
    };
    return colors[category?.slug] || 'bg-gray-500';
  };

  if (variant === 'compact') {
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
            <span>{formatDate(post.publishedAt)}</span>
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
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {showAuthor && post.author?.name && (
              <span className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{post.author.name}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.publishedAt)}</span>
            </span>
            {post.readTimeMinutes && (
              <span className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{blogService.formatReadingTime(post.readTimeMinutes)}</span>
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