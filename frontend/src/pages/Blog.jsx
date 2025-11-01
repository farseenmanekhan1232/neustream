import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, ChevronDown } from 'lucide-react';
import BlogGrid from '../components/blog/BlogGrid';
import BlogCard from '../components/blog/BlogCard';
import blogService from '../services/blogService';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Helmet } from 'react-helmet-async';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('published_at');
  const [currentPage, setCurrentPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [pagination, setPagination] = useState(null);

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => blogService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular posts
  const { data: popularData } = useQuery({
    queryKey: ['blog-popular'],
    queryFn: () => blogService.getPopularPosts(3),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch initial posts
  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'blog-posts',
      currentPage,
      searchQuery,
      selectedCategory,
      selectedTag,
      sortBy,
    ],
    queryFn: () =>
      blogService.getPosts({
        page: currentPage,
        limit: 9,
        search: searchQuery || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        tag: selectedTag !== 'all' ? selectedTag : undefined,
        sortBy,
        sortOrder: 'DESC',
      }),
    keepPreviousData: true,
  });

  // Update posts when data changes
  useEffect(() => {
    if (postsData) {
      if (currentPage === 1) {
        setAllPosts(postsData.posts);
      } else {
        setAllPosts((prev) => [...prev, ...postsData.posts]);
      }
      setPagination(postsData.pagination);
    }
  }, [postsData, currentPage]);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setAllPosts([]);
  };

  // Handle category filter
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setAllPosts([]);
  };

  // Handle tag filter
  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setCurrentPage(1);
    setAllPosts([]);
  };

  // Handle sort
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setCurrentPage(1);
    setAllPosts([]);
  };

  // Load more posts
  const handleLoadMore = async () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setSortBy('published_at');
    setCurrentPage(1);
    setAllPosts([]);
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTag !== 'all';

  return (
    <>
      <Helmet>
        <title>Neustream Blog - Streaming Guides, Tips & Industry News</title>
        <meta
          name="description"
          content="Discover the latest streaming guides, platform updates, equipment reviews, and growth tips for content creators on the Neustream blog."
        />
        <meta
          name="keywords"
          content="streaming blog, streaming guides, twitch tips, youtube streaming, obs tutorials, content creator tips, neustream"
        />
        <link rel="canonical" href="https://neustream.app/blog" />

        {/* Open Graph */}
        <meta property="og:title" content="Neustream Blog - Streaming Guides, Tips & Industry News" />
        <meta
          property="og:description"
          content="Discover the latest streaming guides, platform updates, equipment reviews, and growth tips for content creators."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://neustream.app/blog" />
        <meta property="og:image" content="https://neustream.app/og-image-blog.jpg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Neustream Blog - Streaming Guides, Tips & Industry News" />
        <meta
          name="twitter:description"
          content="Discover the latest streaming guides, platform updates, equipment reviews, and growth tips for content creators."
        />
        <meta name="twitter:image" content="https://neustream.app/og-image-blog.jpg" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Neustream Blog',
            description: 'Discover the latest streaming guides, platform updates, equipment reviews, and growth tips for content creators.',
            url: 'https://neustream.app/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Neustream',
              logo: {
                '@type': 'ImageObject',
                url: 'https://neustream.app/logo.png',
              },
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 border-b">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
                Neustream<span className="text-primary"> Blog</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Discover streaming guides, platform updates, equipment reviews, and growth tips
                to take your content creation to the next level.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search blog posts..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Filters */}
              <div className="bg-card border rounded-lg p-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Category Filter */}
                  <div className="flex-1">
                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoriesData?.categories?.map((category) => (
                          <SelectItem key={category.id} value={category.slug}>
                            {category.name} ({category.post_count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="flex-1">
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published_at">Latest First</SelectItem>
                        <SelectItem value="view_count">Most Popular</SelectItem>
                        <SelectItem value="title">Title A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reset Filters */}
                  {hasActiveFilters && (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Reset
                    </Button>
                  )}
                </div>

                {/* Active Filters */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <Badge variant="secondary">
                        Search: "{searchQuery}"
                      </Badge>
                    )}
                    {selectedCategory !== 'all' && (
                      <Badge variant="secondary">
                        Category: {selectedCategory}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Blog Posts Grid */}
              <BlogGrid
                posts={allPosts}
                loading={isLoading}
                error={error}
                pagination={pagination}
                onLoadMore={pagination?.hasNextPage ? handleLoadMore : null}
                columns={3}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Popular Posts */}
              {popularData?.posts && popularData.posts.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Popular Posts</h3>
                  <div className="space-y-4">
                    {popularData.posts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        variant="compact"
                        showAuthor={false}
                        showExcerpt={false}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categoriesData?.categories && categoriesData.categories.length > 0 && (
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categoriesData.categories
                      .filter((cat) => cat.post_count > 0)
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.slug)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category.slug
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span>{category.name}</span>
                            <span className="text-xs opacity-70">
                              {category.post_count}
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 border rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get the latest streaming tips and guides delivered to your inbox.
                </p>
                <Button className="w-full" variant="default">
                  Subscribe to Newsletter
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}