import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Eye,
  ArrowLeft,
  Share2,
  Bookmark,
  Heart,
} from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import blogService from '../services/blogService';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '../components/ui/skeleton';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [tableOfContents, setTableOfContents] = useState([]);

  // Fetch blog post
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: () => blogService.getPostBySlug(slug),
    enabled: !!slug,
  });

  // Fetch related posts
  const { data: relatedData } = useQuery({
    queryKey: ['blog-related', slug],
    queryFn: () => blogService.getRelatedPosts(slug, 3),
    enabled: !!post,
  });

  // Generate table of contents from content
  useEffect(() => {
    if (post?.contentHtml) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = post.contentHtml;
      const headings = tempDiv.querySelectorAll('h2, h3, h4');

      const toc = Array.from(headings).map((heading, index) => ({
        id: `heading-${index}`,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1)),
        element: heading,
      }));

      setTableOfContents(toc);
    }
  }, [post?.contentHtml]);

  // Handle scroll to heading
  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Handle share
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: url,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      'streaming-guides': 'bg-red-500',
      'platform-updates': 'bg-blue-500',
      'equipment-reviews': 'bg-green-500',
      'growth-tips': 'bg-yellow-500',
      'technical-tutorials': 'bg-purple-500',
      'industry-news': 'bg-cyan-500',
      'success-stories': 'bg-pink-500',
      'neustream-features': 'bg-indigo-500',
    };
    return colors[category?.slug] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Back Button */}
            <Skeleton className="h-10 w-20" />

            {/* Title */}
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-2/3" />
            </div>

            {/* Meta */}
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Featured Image */}
            <Skeleton className="aspect-video w-full rounded-lg" />

            {/* Content */}
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl font-bold">Blog Post Not Found</h1>
            <p className="text-muted-foreground">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/blog')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.seo?.metaTitle || post.title} | Neustream Blog</title>
        <meta
          name="description"
          content={post.seo?.metaDescription || post.excerpt}
        />
        <meta
          name="keywords"
          content={post.seo?.metaKeywords || 'streaming, neustream, blog'}
        />
        <link rel="canonical" href={`https://www.neustream.app/blog/${post.slug}`} />

        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta
          property="og:description"
          content={post.seo?.metaDescription || post.excerpt}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://www.neustream.app/blog/${post.slug}`} />
        {post.featuredImage && (
          <meta property="og:image" content={post.featuredImage} />
        )}
        <meta
          property="article:published_time"
          content={new Date(post.publishedAt).toISOString()}
        />
        <meta
          property="article:modified_time"
          content={new Date(post.updatedAt).toISOString()}
        />
        {post.author?.name && (
          <meta property="article:author" content={post.author.name} />
        )}
        {post.categories?.map((category) => (
          <meta key={category.id} property="article:tag" content={category.name} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta
          name="twitter:description"
          content={post.seo?.metaDescription || post.excerpt}
        />
        {post.featuredImage && (
          <meta name="twitter:image" content={post.featuredImage} />
        )}

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(blogService.generateStructuredData(post))}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Back Button */}
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/blog')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <article className="space-y-8">
              {/* Title and Categories */}
              <div className="space-y-4">
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.categories.map((category) => (
                      <Link key={category.id} to={`/blog/category/${category.slug}`}>
                        <Badge
                          variant="secondary"
                          className={`${getCategoryColor(category)} text-white hover:opacity-80 transition-opacity`}
                        >
                          {category.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
              </div>

              {/* Article Meta */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b">
                <div className="flex items-center space-x-4">
                  {post.author?.avatar && (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {post.author?.name || 'Neustream Team'}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {blogService.formatDate(post.publishedAt)}
                        </span>
                      </span>
                      {post.readTimeMinutes && (
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {blogService.formatReadingTime(post.readTimeMinutes)}
                          </span>
                        </span>
                      )}
                      {post.viewCount > 0 && (
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{post.viewCount.toLocaleString()} views</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share Button */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleShare('twitter')}>
                      Share on Twitter
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('facebook')}>
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                      Share on LinkedIn
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare('copy')}>
                      Copy Link
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Article Content with Table of Contents */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Table of Contents */}
                {tableOfContents.length > 0 && (
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                        Table of Contents
                      </h3>
                      <nav className="space-y-2">
                        {tableOfContents.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => scrollToHeading(item.id)}
                            className={`block text-left text-sm hover:text-primary transition-colors ${
                              item.level === 3 ? 'pl-4' : item.level === 4 ? 'pl-8' : ''
                            }`}
                          >
                            {item.text}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>
                )}

                {/* Article Content */}
                <div className="lg:col-span-3">
                  <div
                    className="prose prose-lg max-w-none prose-headings:scroll-mt-24"
                    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                  />

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-8 pt-8 border-t">
                      <h3 className="font-semibold mb-4">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                            <Badge variant="outline" className="hover:bg-muted">
                              #{tag.name}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </article>

            {/* Related Posts */}
            {relatedData?.posts && relatedData.posts.length > 0 && (
              <div className="mt-16 pt-16 border-t">
                <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedData.posts.map((relatedPost) => (
                    <BlogCard
                      key={relatedPost.id}
                      post={relatedPost}
                      variant="compact"
                      showAuthor={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}