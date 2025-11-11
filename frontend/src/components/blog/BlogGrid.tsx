import { useState, useEffect, useRef } from "react";
import BlogCard from "./BlogCard";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readingTime: number;
  author: {
    name: string;
  };
  views?: number;
  slug: string;
  coverImage?: string;
}

interface Pagination {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

interface BlogGridProps {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  pagination?: Pagination;
  onLoadMore?: () => void;
  variant?: "default" | "compact";
  showAuthor?: boolean;
  showExcerpt?: boolean;
  columns?: 2 | 3 | 4;
  enableInfiniteScroll?: boolean;
}

export default function BlogGrid({
  posts,
  loading,
  error,
  pagination,
  onLoadMore,
  variant = "default",
  showAuthor = true,
  showExcerpt = true,
  columns = 3,
  enableInfiniteScroll = false,
}: BlogGridProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // Infinite scroll observer
  useEffect(() => {
    if (!enableInfiniteScroll || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          pagination?.hasNextPage &&
          !isLoadingMore &&
          !loading
        ) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [pagination, isLoadingMore, loading, enableInfiniteScroll]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !onLoadMore) return;

    setIsLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getGridCols = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
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
          <p className="text-destructive font-medium">
            Failed to load blog posts
          </p>
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
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Load More Button (only show if not using infinite scroll) */}
      {!enableInfiniteScroll &&
        pagination &&
        pagination.hasNextPage &&
        onLoadMore &&
        !isLoadingMore && (
          <div className="flex justify-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              disabled={isLoadingMore}
              className="min-w-[140px]"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}

      {/* Infinite Scroll Sentinel */}
      {enableInfiniteScroll && pagination?.hasNextPage && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {isLoadingMore && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          )}
        </div>
      )}

      {/* Pagination Info */}
      {pagination && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {posts.length} of {pagination.totalPosts} posts
          {pagination.totalPages > 1 && (
            <>
              {" "}
              • Page {pagination.page} of {pagination.totalPages}
            </>
          )}
        </div>
      )}
    </div>
  );
}
