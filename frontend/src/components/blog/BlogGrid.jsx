import { useState } from 'react';
import BlogCard from './BlogCard';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export default function BlogGrid({
  posts,
  loading,
  error,
  pagination,
  onLoadMore,
  variant = 'default',
  showAuthor = true,
  showExcerpt = true,
  columns = 3
}) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (loadingMore || !onLoadMore) return;

    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  };

  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (loading && !posts.length) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">Failed to load blog posts</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!posts.length && !loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No blog posts found</p>
          <p className="text-muted-foreground text-sm">
            Check back later for new content or try adjusting your filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Blog Posts Grid */}
      <div className={`grid ${getGridCols()} gap-6`}>
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            variant={variant}
            showAuthor={showAuthor}
            showExcerpt={showExcerpt}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Load More Button */}
      {pagination && pagination.hasNextPage && onLoadMore && !loadingMore && (
        <div className="flex justify-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loadingMore}
            className="min-w-[140px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {posts.length} of {pagination.totalPosts} posts
          {pagination.totalPages > 1 && (
            <> • Page {pagination.page} of {pagination.totalPages}</>
          )}
        </div>
      )}
    </div>
  );
}