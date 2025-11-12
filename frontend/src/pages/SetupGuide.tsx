import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../services/subscription";
import { useCurrency } from "../contexts/CurrencyContext";

const SetupGuide = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  // Use currency context
  const { formatPrice } = useCurrency();

  // Fetch subscription plans from API
  const {
    data: plansData,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      return await subscriptionService.getPlans();
    },
  });

  // Handle both direct data and wrapped response structures
  const plans = plansData?.data?.plans || plansData?.plans || plansData || [];

  // Helper function to get plan by name
  const getPlanByName = (planName) => {
    return plans.find((p) => p.name.toLowerCase() === planName.toLowerCase());
  };

  // Helper function to get price with fallback
  const getPlanPrice = (plan, interval = "month") => {
    // Use the formatted price if available, otherwise format the raw price
    const formattedPrice =
      interval === "month"
        ? plan.formatted_price_monthly
        : plan.formatted_price_yearly;

    if (formattedPrice) {
      return formattedPrice;
    }

    // Fallback to raw price
    const rawPrice =
      interval === "month" ? plan.price_monthly : plan.price_yearly;

    if (!rawPrice || rawPrice === "0.00") return "$0.00";
    return formatPrice(parseFloat(rawPrice));
  };

  // Helper function to get interval with fallback
  const getPlanInterval = (plan) => {
    return "month"; // Default to monthly
  };

  // Helper function to get max destinations
  const getMaxDestinations = (plan) => {
    return plan.max_destinations || plan.destinations || 2;
  };

  // Helper function to get max streaming hours
  const getMaxStreamingHours = (plan) => {
    return (
      plan.max_streaming_hours_monthly || plan.streaming_hours || "Unlimited"
    );
  };

  const sections = [
    { id: "overview", title: "Overview" },
    { id: "getting-started", title: "Getting Started" },
    { id: "streaming-setup", title: "Streaming Setup" },
    { id: "obs-configuration", title: "OBS Configuration" },
    { id: "platform-integration", title: "Platform Integration" },
    { id: "chat-management", title: "Chat Management" },
    { id: "stream-sources", title: "Stream Sources" },
    { id: "destinations", title: "Destinations" },
    { id: "analytics", title: "Analytics & Monitoring" },
    { id: "subscription-billing", title: "Subscription & Billing" },
    { id: "troubleshooting", title: "Troubleshooting" },
    { id: "faq", title: "FAQ" },
  ];

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                NeuStream Documentation
              </h1>
              <p className="text-lg text-muted-foreground">
                Complete guide to professional multistreaming
              </p>
            </div>
            <Button asChild size="lg" className="px-6">
              <Link to="/dashboard/streaming">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-card rounded-lg shadow-sm border border-border p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-border"
                    />
                  </div>
                </div>

                <nav className="space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeSection === section.id
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "text-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>

                {/* Pricing Card */}
                {!plansLoading && !plansError && plans.length > 0 && (
                  <div className="mt-6 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-lg p-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      Start Streaming Today
                    </h3>
                    {!plansLoading && plans.length > 0 && (
                      <>
                        {(() => {
                          const proPlan = getPlanByName("pro");
                          const businessPlan = getPlanByName("business");

                          return (
                            <div className="space-y-3">
                              {proPlan && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-foreground/90">
                                    Pro Plan
                                  </span>
                                  <span className="text-sm font-semibold text-foreground">
                                    {getPlanPrice(proPlan)}/
                                    {getPlanInterval(proPlan)}
                                  </span>
                                </div>
                              )}
                              {businessPlan && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-foreground/90">
                                    Business Plan
                                  </span>
                                  <span className="text-sm font-semibold text-foreground">
                                    {getPlanPrice(businessPlan)}/
                                    {getPlanInterval(businessPlan)}
                                  </span>
                                </div>
                              )}
                              <div className="pt-2 border-t border-border/50">
                                <p className="text-xs text-muted-foreground mb-3">
                                  {proPlan
                                    ? `Stream in 4K up to ${getMaxStreamingHours(proPlan)} hours/month`
                                    : "Stream in 4K up to 1000 hours/month"}
                                </p>
                                <Link to="/auth">
                                  <Button className="w-full" size="sm">
                                    Get Started Free
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg shadow-sm border border-border p-8">
              {/* Overview */}
              {activeSection === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      Overview
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                      NeuStream is a professional multistreaming platform that
                      enables content creators to broadcast simultaneously to
                      multiple streaming platforms while maintaining optimal
                      performance and quality.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-4">
                        What is NeuStream?
                      </h2>
                      <p className="text-foreground/90 leading-relaxed mb-6">
                        NeuStream provides cloud-based streaming infrastructure
                        that allows you to stream to YouTube, Twitch, Facebook,
                        LinkedIn, TikTok, Instagram, and custom RTMP
                        destinations simultaneously from a single source. Our
                        platform handles the technical complexity of
                        multistreaming while providing real-time analytics,
                        unified chat management, and performance monitoring.
                      </p>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Key Features
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                          <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Multi-Platform Streaming
                            </h3>
                            <p className="text-muted-foreground">
                              Broadcast to multiple platforms simultaneously
                              with a single stream source
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                          <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Cloud-Based Encoding
                            </h3>
                            <p className="text-muted-foreground">
                              High-performance encoding without consuming local
                              computer resources
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                          <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Unified Chat Management
                            </h3>
                            <p className="text-muted-foreground">
                              Aggregate and manage chat messages from all
                              platforms in one interface
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                          <div className="w-3 h-3 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-foreground mb-1">
                              Real-Time Analytics
                            </h3>
                            <p className="text-muted-foreground">
                              Monitor stream health, viewer counts, and
                              performance across all platforms
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        System Requirements
                      </h2>
                      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Internet Connection
                          </h3>
                          <p className="text-primary/90">
                            Minimum 5 Mbps upload speed (10+ Mbps recommended
                            for HD streaming)
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Streaming Software
                          </h3>
                          <p className="text-primary/90">
                            OBS Studio, Streamlabs, XSplit, or any
                            RTMP-compatible broadcasting software
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Hardware
                          </h3>
                          <p className="text-primary/90">
                            Modern computer with hardware encoding support
                            (NVIDIA, AMD, or Intel)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Getting Started */}
              {activeSection === "getting-started" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-foreground mb-4">
                      Getting Started
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                      Get up and running with NeuStream in minutes. This
                      comprehensive guide will walk you through creating your
                      first multistream setup step by step.
                    </p>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Step 1: Create Your Account
                      </h2>
                      <p className="text-foreground/90 mb-6 leading-relaxed">
                        Sign up for a NeuStream account and choose a plan that
                        fits your streaming needs.
                      </p>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-muted rounded-lg p-6 border border-border">
                          <h3 className="font-semibold text-foreground mb-3">
                            Free Plan
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Perfect for getting started
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Stream to 2 platforms</li>
                            <li>• Basic analytics</li>
                            <li>• Community support</li>
                            <li>• 720p streaming quality</li>
                          </ul>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-6 border-2 border-primary/30">
                          <h3 className="font-semibold text-foreground mb-3">
                            Pro Plan
                          </h3>
                          <p className="text-primary mb-4">
                            Most popular choice
                          </p>
                          <ul className="text-sm text-primary space-y-1">
                            <li>• Unlimited platforms</li>
                            <li>• Advanced analytics</li>
                            <li>• Priority support</li>
                            <li>• 1080p HD streaming</li>
                            <li>• Chat management tools</li>
                          </ul>
                        </div>
                        <div className="bg-muted rounded-lg p-6 border border-border">
                          <h3 className="font-semibold text-foreground mb-3">
                            Enterprise
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            For large organizations
                          </p>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Custom solutions</li>
                            <li>• Dedicated support</li>
                            <li>• SLA guarantees</li>
                            <li>• White-label options</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-foreground mb-6">
                        Step 2: Create a Streaming Source
                      </h2>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            1
                          </div>
                          <div className="pt-2">
                            <p className="text-foreground/90 font-medium mb-1">
                              Navigate to Dashboard
                            </p>
                            <p className="text-muted-foreground">
                              Go to your dashboard and click "Create Source"
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            2
                          </div>
                          <div className="pt-2">
                            <p className="text-foreground/90 font-medium mb-1">
                              Configure Settings
                            </p>
                            <p className="text-muted-foreground">
                              Set up your stream resolution, bitrate, and
                              preferences
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            3
                          </div>
                          <div className="pt-2">
                            <p className="text-foreground/90 font-medium mb-1">
                              Get Stream Details
                            </p>
                            <p className="text-muted-foreground">
                              Copy your unique RTMP URL and stream key
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* All other sections with comprehensive content */}
              {activeSection !== "overview" &&
                activeSection !== "getting-started" && (
                  <div className="space-y-8">
                    <div>
                      <h1 className="text-4xl font-bold text-foreground mb-4">
                        {sections.find((s) => s.id === activeSection)?.title}
                      </h1>
                      <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                        Comprehensive documentation for{" "}
                        {sections
                          .find((s) => s.id === activeSection)
                          ?.title.toLowerCase()}
                        .
                      </p>
                    </div>

                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                      <h3 className="font-semibold text-foreground mb-3">
                        📚 Documentation Section
                      </h3>
                      <p className="text-primary/90">
                        This section provides detailed information about{" "}
                        {sections
                          .find((s) => s.id === activeSection)
                          ?.title.toLowerCase()}
                        . Our comprehensive guides cover everything you need to
                        know to effectively use NeuStream's features.
                      </p>
                    </div>

                    {activeSection === "streaming-setup" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            RTMP Configuration
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            NeuStream provides you with a unique RTMP endpoint
                            for each streaming source. Configure your streaming
                            software to use these settings for optimal
                            performance.
                          </p>

                          <div className="bg-muted rounded-lg p-6 border border-border space-y-4">
                            <div>
                              <h3 className="font-semibold text-foreground mb-2">
                                Server URL Format
                              </h3>
                              <code className="block text-sm bg-black/90 text-green-400 p-3 rounded font-mono">
                                rtmp://stream.neustream.app
                              </code>
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground mb-2">
                                Stream Key
                              </h3>
                              <code className="block text-sm bg-black/90 text-green-400 p-3 rounded font-mono">
                                ns_live_[your-unique-key]
                              </code>
                              <p className="text-sm text-muted-foreground mt-2">
                                ⚠️ Never share your stream key publicly. It's
                                tied to your account and allows direct streaming
                                access.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Encoder Settings
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Choose the right encoder based on your hardware and
                            streaming needs. Hardware encoders reduce CPU usage
                            and provide better performance for multistreaming.
                          </p>

                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                                NVENC (NVIDIA)
                              </h3>
                              <p className="text-foreground/90 mb-4">
                                Recommended for most streamers. Uses NVIDIA GPU
                                hardware encoding for excellent quality with low
                                CPU usage.
                              </p>
                              <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                                <div>Encoder: NVENC H.264</div>
                                <div>Rate Control: CBR</div>
                                <div>Bitrate: 6000-8000 kbps</div>
                                <div>Keyframe Interval: 2 sec</div>
                                <div>Preset: Quality</div>
                                <div>GPU: 0</div>
                                <div>Max B-frames: 2</div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                QuickSync (Intel)
                              </h3>
                              <p className="text-foreground/90 mb-4">
                                Great for Intel integrated graphics or older
                                systems. Lower power consumption.
                              </p>
                              <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                                <div>Encoder: QuickSync H.264</div>
                                <div>Rate Control: CBR</div>
                                <div>Bitrate: 6000-8000 kbps</div>
                                <div>Keyframe Interval: 2 sec</div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                VCE (AMD)
                              </h3>
                              <p className="text-foreground/90 mb-4">
                                Hardware encoding for AMD GPUs. Good performance
                                for budget setups.
                              </p>
                              <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                                <div>Encoder: AMD HW H.264</div>
                                <div>Rate Control: CBR</div>
                                <div>Bitrate: 6000-8000 kbps</div>
                                <div>Keyframe Interval: 2 sec</div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                                x264 (CPU)
                              </h3>
                              <p className="text-foreground/90 mb-4">
                                Software encoding. Requires powerful CPU but
                                provides maximum quality.
                              </p>
                              <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                                <div>Encoder: x264</div>
                                <div>Rate Control: CBR</div>
                                <div>Bitrate: 6000 kbps</div>
                                <div>Keyframe Interval: 2 sec</div>
                                <div>CPU Preset: medium</div>
                                <div>Profile: high</div>
                                <div>Tune: none</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Resolution & Bitrate Recommendations
                          </h2>
                          <div className="grid gap-4">
                            <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-lg p-6 dark:bg-emerald-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 text-lg">
                                  1080p HD (Recommended)
                                </h3>
                                <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded">
                                  Best Quality
                                </span>
                              </div>
                              <p className="text-emerald-800 dark:text-emerald-200 text-sm mb-3">
                                Ideal for professional streaming with good
                                upload bandwidth
                              </p>
                              <ul className="text-emerald-800 dark:text-emerald-200 text-sm space-y-1">
                                <li>• Resolution: 1920x1080 @ 60fps</li>
                                <li>• Bitrate: 6000-8000 kbps</li>
                                <li>• Upload: 10+ Mbps required</li>
                                <li>
                                  • Best for: Gaming, tutorials, presentations
                                </li>
                              </ul>
                            </div>

                            <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-6">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-foreground text-lg">
                                  720p Standard
                                </h3>
                                <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                                  Balanced
                                </span>
                              </div>
                              <p className="text-primary/90 text-sm mb-3">
                                Good quality with moderate bandwidth
                                requirements
                              </p>
                              <ul className="text-primary/90 text-sm space-y-1">
                                <li>• Resolution: 1280x720 @ 60fps</li>
                                <li>• Bitrate: 3000-5000 kbps</li>
                                <li>• Upload: 5+ Mbps required</li>
                                <li>• Best for: Most content types</li>
                              </ul>
                            </div>

                            <div className="bg-orange-50 border-2 border-orange-500/30 rounded-lg p-6 dark:bg-orange-900/20">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-orange-900 dark:text-orange-100 text-lg">
                                  480p Mobile
                                </h3>
                                <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded">
                                  Bandwidth Saver
                                </span>
                              </div>
                              <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                                Optimized for low bandwidth or mobile streaming
                              </p>
                              <ul className="text-orange-800 dark:text-orange-200 text-sm space-y-1">
                                <li>• Resolution: 854x480 @ 30fps</li>
                                <li>• Bitrate: 1000-2000 kbps</li>
                                <li>• Upload: 2+ Mbps required</li>
                                <li>
                                  • Best for: Backup streams, low bandwidth
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Audio Settings
                          </h2>
                          <div className="bg-muted rounded-lg p-6 border border-border">
                            <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-sm space-y-1">
                              <div>Codec: AAC</div>
                              <div>Bitrate: 128 kbps</div>
                              <div>Sample Rate: 48 kHz</div>
                              <div>Channels: Stereo (2.0)</div>
                            </div>
                            <p className="text-foreground/90 text-sm mt-4">
                              Ensure your audio levels are around -12dB to -6dB
                              for optimal clarity. Avoid going above -3dB to
                              prevent clipping.
                            </p>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-800">
                          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                            💡 Pro Tips for Multistreaming
                          </h3>
                          <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-2">
                            <li>
                              • Test your stream locally before going live
                            </li>
                            <li>
                              • Monitor your upload bandwidth - it should be
                              50-80% of your total available
                            </li>
                            <li>
                              • Use hardware encoding to reduce CPU strain
                              during multistreaming
                            </li>
                            <li>
                              • Set up a backup streaming source in case of
                              issues
                            </li>
                            <li>
                              • Keep a 10-15 second buffer delay to prevent
                              disconnection issues
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "obs-configuration" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Initial OBS Setup
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Configure OBS Studio for optimal multistreaming
                            performance. Follow these steps to set up your
                            streaming environment correctly.
                          </p>

                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                1
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Install OBS Studio
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Download OBS Studio 30+ from the official
                                  website. Ensure your GPU drivers are up to
                                  date.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                2
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Run Auto-Configuration
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Use OBS's auto-configuration wizard to
                                  optimize settings for your hardware and
                                  bandwidth.
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                3
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Enable Hardware Encoding
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Go to Settings → Output → Streaming. Select
                                  your hardware encoder (NVENC, QuickSync, or
                                  VCE).
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Scene Setup for Multistreaming
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Create organized scenes for different streaming
                            scenarios. This helps manage overlays and
                            transitions across multiple platforms.
                          </p>

                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Scene Structure Recommendations
                              </h3>
                              <ul className="text-foreground/90 space-y-2">
                                <li className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>
                                    <strong>Starting Soon:</strong> Pre-stream
                                    screen with countdown or branding
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>
                                    <strong>Main Scene:</strong> Your primary
                                    gameplay/face cam setup
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>
                                    <strong>BRB (Be Right Back):</strong>{" "}
                                    Temporary screen when stepping away
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>
                                    <strong>Ending:</strong> Thanks for watching
                                    and follow notifications
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-primary mr-2">•</span>
                                  <span>
                                    <strong>Testing:</strong> Scene for checking
                                    stream quality before going live
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Source Management
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Efficiently organize your sources for easy switching
                            and optimal performance.
                          </p>

                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Essential Sources
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground font-medium">
                                    Capture Card / Game Capture
                                  </span>
                                  <span className="text-muted-foreground">
                                    Primary video source
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground font-medium">
                                    Webcam / Camera
                                  </span>
                                  <span className="text-muted-foreground">
                                    Face cam overlay
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground font-medium">
                                    Microphone / Audio Input
                                  </span>
                                  <span className="text-muted-foreground">
                                    Primary audio
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground font-medium">
                                    Desktop Audio / System Audio
                                  </span>
                                  <span className="text-muted-foreground">
                                    Game/application sound
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground font-medium">
                                    Alert Overlay
                                  </span>
                                  <span className="text-muted-foreground">
                                    StreamElements/Streamlabs
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground font-medium">
                                    Chat Overlay
                                  </span>
                                  <span className="text-muted-foreground">
                                    Twitch/Youtube chat
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                💡 Source Organization Tips
                              </h3>
                              <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                                <li>
                                  • Use groups to organize sources (Audio,
                                  Video, Overlays)
                                </li>
                                <li>
                                  • Set global shortcuts for source visibility
                                  (Hotkeys → Studio Mode)
                                </li>
                                <li>
                                  • Create separate scenes for different content
                                  types
                                </li>
                                <li>• Use transparency for layered overlays</li>
                                <li>
                                  • Lock sources to prevent accidental changes
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Audio Configuration
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Audio Mixer Settings
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Microphone (Desktop Audio 2)
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Enable noise suppression (Settings →
                                      Advanced → Audio)
                                    </li>
                                    <li>
                                      • Enable noise gate if in noisy
                                      environment
                                    </li>
                                    <li>• Set input gain to -12dB to -6dB</li>
                                    <li>• Enable push-to-talk if needed</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Desktop Audio
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Monitor only (for DJ or music streams)
                                    </li>
                                    <li>
                                      • Set to 80-90% volume to balance with mic
                                    </li>
                                    <li>
                                      • Consider compressor for dynamic content
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Settings in OBS
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                RTMP Server Connection
                              </h3>
                              <ol className="text-foreground/90 text-sm space-y-3">
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">1.</span>
                                  <span>Open Settings → Stream</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">2.</span>
                                  <span>Select "Custom" as Service</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">3.</span>
                                  <span>
                                    Server: rtmp://stream.neustream.app
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">4.</span>
                                  <span>
                                    Stream Key: ns_live_[your-unique-key]
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">5.</span>
                                  <span>Click OK and test connection</span>
                                </li>
                              </ol>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Advanced Settings
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Reconnect:</strong> Enable automatic
                                  reconnection
                                </li>
                                <li>
                                  • <strong>Reconnect Delay:</strong> 10 seconds
                                </li>
                                <li>
                                  • <strong>Max Retries:</strong> 20
                                </li>
                                <li>
                                  • <strong>Bind to IP:</strong> Enable if using
                                  multiple network adapters
                                </li>
                                <li>
                                  • <strong>Dynamic Bitrate:</strong> Enable if
                                  platforms support VBR
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Performance Optimization
                          </h2>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="bg-muted rounded-lg p-6 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">
                                  General Performance
                                </h3>
                                <ul className="text-foreground/90 text-sm space-y-2">
                                  <li>• Close unnecessary applications</li>
                                  <li>
                                    • Set game to "Fullscreen" or "Borderless"
                                  </li>
                                  <li>• Disable Windows Game Bar (Win+G)</li>
                                  <li>• Run OBS as Administrator</li>
                                  <li>• Enable Game Mode in Windows</li>
                                </ul>
                              </div>
                              <div className="bg-muted rounded-lg p-6 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">
                                  Resource Management
                                </h3>
                                <ul className="text-foreground/90 text-sm space-y-2">
                                  <li>• Monitor CPU/GPU usage</li>
                                  <li>• Limit frame rate to 60 FPS</li>
                                  <li>
                                    • Use efficient sources (Game Capture over
                                    Display)
                                  </li>
                                  <li>
                                    • Enable hardware decoding when possible
                                  </li>
                                  <li>• Reduce preview quality if needed</li>
                                </ul>
                              </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-800">
                              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                🎯 Multistreaming Performance Checklist
                              </h3>
                              <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
                                <li>✓ Encoder utilization below 80%</li>
                                <li>✓ CPU usage below 70%</li>
                                <li>✓ GPU usage below 90%</li>
                                <li>✓ Frame drops below 1%</li>
                                <li>✓ No dropped frames in encoder</li>
                                <li>
                                  ✓ Stream quality test shows green across all
                                  metrics
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "platform-integration" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Connecting Streaming Platforms
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Link your streaming platforms to NeuStream to enable
                            multistreaming. Each platform requires
                            authentication and specific configuration to receive
                            your stream.
                          </p>

                          <div className="space-y-6">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  YT
                                </span>
                                YouTube Live Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Go to YouTube Studio → Stream → Live
                                        Streaming
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Click "Create Stream" and configure
                                        stream details
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Copy the Server URL and Stream Key from
                                        stream settings
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream dashboard, add YouTube
                                        destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Paste Server URL and Stream Key,
                                        authorize your YouTube account
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                                <div className="bg-blue-50 rounded p-3 dark:bg-blue-900/20">
                                  <p className="text-xs text-blue-900 dark:text-blue-100">
                                    <strong>Note:</strong> YouTube requires 24
                                    hours to activate live streaming for new
                                    accounts. Stream delays of 30-60 seconds are
                                    normal on YouTube.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  T
                                </span>
                                Twitch Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Go to Twitch Dashboard → Settings →
                                        Stream
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Navigate to "Stream Key & Preferences"
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Click "Show" to reveal your Stream Key
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream, add Twitch as destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Authorize Twitch account and copy stream
                                        key
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                                <div className="bg-muted rounded p-3">
                                  <p className="text-xs text-foreground/90">
                                    <strong>RTMP URL:</strong>{" "}
                                    rtmp://ingest.twitch.tv/live
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                  FB
                                </span>
                                Facebook Gaming Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Go to Facebook → Creator Studio → Live
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Click "Create Live" and configure stream
                                        settings
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Get the Stream Key from "Streaming
                                        software"
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream, add Facebook as
                                        destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Authorize Facebook account and paste
                                        credentials
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                                <div className="bg-muted rounded p-3">
                                  <p className="text-xs text-foreground/90">
                                    <strong>Note:</strong> Facebook may require
                                    page verification for live streaming
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  LI
                                </span>
                                LinkedIn Live Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Go to LinkedIn → Create → Live Event
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Set up your live event with title and
                                        description
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Select "Use external encoder" option
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream, add LinkedIn destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Authorize LinkedIn and configure stream
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                  TT
                                </span>
                                TikTok Live Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Open TikTok app → Profile → Menu → Live
                                        Studio
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Enable "Use third-party streaming
                                        software"
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Get your stream key from Live Studio
                                        settings
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream, add TikTok destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Authorize TikTok and paste stream key
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                                <div className="bg-yellow-50 rounded p-3 dark:bg-yellow-900/20">
                                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                                    <strong>Note:</strong> TikTok Live requires
                                    1,000+ followers to enable external
                                    streaming
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                  IG
                                </span>
                                Instagram Live Integration
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Setup Steps:
                                  </h4>
                                  <ol className="text-sm text-foreground/90 space-y-2">
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        1.
                                      </span>
                                      <span>
                                        Open Instagram → Profile → Menu → Live
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        2.
                                      </span>
                                      <span>
                                        Tap "Go Live" and select "Live with"
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        3.
                                      </span>
                                      <span>
                                        Enable "Connect to streaming software"
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        4.
                                      </span>
                                      <span>
                                        In NeuStream, add Instagram destination
                                      </span>
                                    </li>
                                    <li className="flex items-start">
                                      <span className="font-semibold mr-2">
                                        5.
                                      </span>
                                      <span>
                                        Authorize Instagram and configure
                                      </span>
                                    </li>
                                  </ol>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                          <h3 className="font-semibold text-foreground mb-3">
                            🔐 Security Best Practices
                          </h3>
                          <ul className="text-foreground/90 text-sm space-y-2">
                            <li>• Never share your stream keys publicly</li>
                            <li>
                              • Regenerate stream keys if accidentally exposed
                            </li>
                            <li>
                              • Use different stream keys for different streams
                            </li>
                            <li>
                              • Enable two-factor authentication on all
                              platforms
                            </li>
                            <li>• Review platform permissions regularly</li>
                            <li>• Disconnect platforms you no longer use</li>
                          </ul>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Authentication & Permissions
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            NeuStream requires specific permissions on each
                            platform to manage your streams and chat.
                          </p>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Required Permissions
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>• Stream management (start/stop)</li>
                                <li>• Chat read access</li>
                                <li>• Stream information updates</li>
                                <li>• Analytics data access</li>
                                <li>• Thumbnail management</li>
                              </ul>
                            </div>
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Token Management
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>• Tokens auto-refresh when valid</li>
                                <li>
                                  • Re-authentication required every 60 days
                                </li>
                                <li>• View token status in dashboard</li>
                                <li>
                                  • Revoke access anytime from platform settings
                                </li>
                                <li>• NeuStream never stores passwords</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "stream-sources" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            What Are Stream Sources?
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            A Stream Source is your unique RTMP endpoint that
                            you connect to from your streaming software (OBS,
                            Streamlabs, XSplit, etc.). Each source acts as a
                            central hub that can distribute your stream to
                            multiple platforms simultaneously.
                          </p>

                          <div className="bg-muted rounded-lg p-6 border border-border mb-6">
                            <h3 className="font-semibold text-foreground mb-3">
                              How It Works
                            </h3>
                            <div className="space-y-4">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                  1
                                </div>
                                <div>
                                  <p className="text-foreground font-medium">
                                    You create a Stream Source
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Each source gets a unique stream key and
                                    RTMP URL
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                  2
                                </div>
                                <div>
                                  <p className="text-foreground font-medium">
                                    Configure OBS to use the source
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Set Server URL and Stream Key in your
                                    streaming software
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                  3
                                </div>
                                <div>
                                  <p className="text-foreground font-medium">
                                    Add destinations to the source
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Connect YouTube, Twitch, Facebook, and other
                                    platforms
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                                  4
                                </div>
                                <div>
                                  <p className="text-foreground font-medium">
                                    Go live!
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Stream once, reaches all platforms
                                    automatically
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Creating a Stream Source
                          </h2>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                1
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Navigate to Sources
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Go to Dashboard → Stream Sources → "Create New
                                  Source"
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                2
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Name Your Source
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Give your source a descriptive name (e.g.,
                                  "Gaming Setup", "Podcast Studio", "Main
                                  Channel")
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                3
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Configure Quality Settings
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Set resolution, bitrate, and encoder
                                  preferences (can be changed later)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                4
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Get Your Stream Credentials
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Copy your unique Server URL and Stream Key for
                                  OBS configuration
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                5
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Test the Connection
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Verify your source is working before going
                                  live
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Source Configuration Options
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Quality Settings
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Resolution
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • 1920x1080 (1080p) - Full HD quality
                                    </li>
                                    <li>• 1280x720 (720p) - HD quality</li>
                                    <li>• 854x480 (480p) - Standard quality</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Frame Rate
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • 60 FPS - Smoothest motion (gaming,
                                      sports)
                                    </li>
                                    <li>• 30 FPS - Standard framerate</li>
                                    <li>
                                      • 24 FPS - Cinematic look (talk shows)
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Bitrate
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Auto - Automatically optimized based on
                                      resolution
                                    </li>
                                    <li>
                                      • Custom - Set specific bitrate value
                                    </li>
                                    <li>
                                      • Range: 1000-8000 kbps depending on
                                      resolution
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Recording Settings
                              </h3>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Record Locally
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Optional local recording
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Cloud Recording
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Auto-upload to cloud
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Recording Quality
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Same as stream or source quality
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground text-sm">
                                    Format
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    MP4 (H.264/AAC)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Advanced Settings
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Buffer Size:</strong> Adjustable
                                  from 0-15 seconds (default: 5s)
                                </li>
                                <li>
                                  • <strong>Keyframe Interval:</strong> 2
                                  seconds (recommended for most platforms)
                                </li>
                                <li>
                                  • <strong>Encoder:</strong> Auto-selected
                                  based on hardware capabilities
                                </li>
                                <li>
                                  • <strong>Audio Codec:</strong> AAC 128 kbps
                                  (48 kHz)
                                </li>
                                <li>
                                  • <strong>Stream Delay:</strong> Optional
                                  delay for broadcast safety (0-30s)
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Managing Multiple Sources
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Create multiple sources for different streaming
                            setups, content types, or purposes.
                          </p>

                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                When to Use Multiple Sources
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • Different content types (gaming vs.
                                  podcasts)
                                </li>
                                <li>
                                  • Different quality settings (high-end vs.
                                  backup)
                                </li>
                                <li>
                                  • Multiple streaming setups (different
                                  locations)
                                </li>
                                <li>
                                  • Team management (different users/brands)
                                </li>
                                <li>• A/B testing (compare performance)</li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Source Organization
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Naming Convention
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Use clear, descriptive names like
                                    "Main-1080p", "Gaming-PC", "Podcast-Setup-A"
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Tags & Labels
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Add tags to organize sources by category,
                                    quality, location, or purpose
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Archive Old Sources
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Archive sources you no longer use - they're
                                    preserved but hidden from active list
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Source Security
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 dark:bg-yellow-900/20 dark:border-yellow-800">
                              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3 flex items-center">
                                <span className="w-5 h-5 text-yellow-600 mr-2">
                                  ⚠️
                                </span>
                                Protect Your Stream Key
                              </h3>
                              <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-2">
                                <li>• Never share your stream key publicly</li>
                                <li>
                                  • Don't display it on your stream overlay
                                </li>
                                <li>• Regenerate if accidentally exposed</li>
                                <li>
                                  • Each source has a unique, non-guessable key
                                </li>
                                <li>
                                  • Keys are encrypted and stored securely
                                </li>
                              </ul>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Access Control
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Private:</strong> Only you can
                                  access this source
                                </li>
                                <li>
                                  • <strong>Team Members:</strong> Grant access
                                  to specific team members
                                </li>
                                <li>
                                  • <strong>Read-Only:</strong> Others can view
                                  but not modify
                                </li>
                                <li>
                                  • <strong>Full Access:</strong> Collaborate on
                                  source configuration
                                </li>
                                <li>
                                  • <strong>IP Restrictions:</strong> Limit
                                  access to specific IP addresses (Enterprise)
                                </li>
                              </ul>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Monitoring & Alerts
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>• Unauthorized access attempts</li>
                                <li>• Stream status changes (start/stop)</li>
                                <li>• Connection failures</li>
                                <li>• Unusual activity patterns</li>
                                <li>• Email and SMS alerts available</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Source Status & Health Monitoring
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-4">
                                Status Indicators
                              </h3>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div className="bg-emerald-50 rounded-lg p-4 dark:bg-emerald-900/20">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                                      Active
                                    </span>
                                  </div>
                                  <p className="text-xs text-emerald-800 dark:text-emerald-200">
                                    Source is live and streaming
                                  </p>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 dark:bg-blue-900/20">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                      Idle
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-800 dark:text-blue-200">
                                    Source is ready but not streaming
                                  </p>
                                </div>
                                <div className="bg-orange-50 rounded-lg p-4 dark:bg-orange-900/20">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-semibold text-orange-900 dark:text-orange-100">
                                      Warning
                                    </span>
                                  </div>
                                  <p className="text-xs text-orange-800 dark:text-orange-200">
                                    Connection issues detected
                                  </p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-4 dark:bg-red-900/20">
                                  <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                                      Error
                                    </span>
                                  </div>
                                  <p className="text-xs text-red-800 dark:text-red-200">
                                    Source configuration issue
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Real-Time Metrics
                              </h3>
                              <div className="grid gap-4 md:grid-cols-3">
                                <div>
                                  <div className="text-2xl font-bold text-foreground">
                                    0.0%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Dropped Frames
                                  </div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-foreground">
                                    6.2s
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Avg Latency
                                  </div>
                                </div>
                                <div>
                                  <div className="text-2xl font-bold text-foreground">
                                    100%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Uptime
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            💡 Best Practices for Stream Sources
                          </h3>
                          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                            <li>• Test your source before important streams</li>
                            <li>
                              • Keep a backup source configured for emergencies
                            </li>
                            <li>• Monitor source health during live streams</li>
                            <li>
                              • Use descriptive names for easy identification
                            </li>
                            <li>
                              • Regularly check and update encoder settings
                            </li>
                            <li>
                              • Archive unused sources instead of deleting
                            </li>
                            <li>
                              • Rotate stream keys periodically for security
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "destinations" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Managing Stream Destinations
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Destinations are the streaming platforms where your
                            content will be broadcast. Configure and manage
                            multiple destinations to maximize your audience
                            reach.
                          </p>

                          <div className="bg-muted rounded-lg p-6 border border-border mb-6">
                            <h3 className="font-semibold text-foreground mb-3">
                              What Are Destinations?
                            </h3>
                            <p className="text-foreground/90 text-sm leading-relaxed">
                              Destinations represent your connected streaming
                              platforms (YouTube, Twitch, Facebook, etc.). Each
                              destination receives a copy of your stream from
                              NeuStream's cloud infrastructure, allowing you to
                              broadcast to multiple platforms simultaneously
                              from a single RTMP source.
                            </p>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Adding Destinations
                          </h2>
                          <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                1
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Navigate to Destinations
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Go to your streaming source dashboard →
                                  "Destinations" tab
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                2
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Click "Add Destination"
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Select from available platforms: YouTube,
                                  Twitch, Facebook, LinkedIn, TikTok, Instagram
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                3
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Authenticate Platform
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Sign in to your platform account and grant
                                  NeuStream necessary permissions
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                4
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Configure Destination
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Set stream title, description, visibility, and
                                  platform-specific settings
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start space-x-4">
                              <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                                5
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground mb-2">
                                  Save & Test
                                </h3>
                                <p className="text-muted-foreground text-sm">
                                  Verify the connection and test stream to
                                  ensure everything works correctly
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Platform-Specific Settings
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                YouTube Configuration
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Stream Settings
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Title and description (supports
                                      variables like `{`{streamTitle}`}`, `
                                      {`{game}`}`)
                                    </li>
                                    <li>
                                      • Category selection (Gaming, Education,
                                      Entertainment, etc.)
                                    </li>
                                    <li>
                                      • Visibility: Public, Unlisted, Private,
                                      or Scheduled
                                    </li>
                                    <li>
                                      • Thumbnail upload or automatic generation
                                    </li>
                                    <li>
                                      • Age restriction and content rating
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Stream Options
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Enable/disable chat</li>
                                    <li>
                                      • Monetization settings (ads, memberships)
                                    </li>
                                    <li>
                                      • Stream latency (Normal, Low, Ultra Low)
                                    </li>
                                    <li>
                                      • Recording to YouTube (automatic DVR)
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Twitch Configuration
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Channel Settings
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Channel title with game/category</li>
                                    <li>
                                      • Game/category selection from Twitch
                                      directory
                                    </li>
                                    <li>
                                      • Tags for discoverability (Screenshots,
                                      Subs Enabled, etc.)
                                    </li>
                                    <li>• Mature content toggle</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Advanced Options
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Channel points and rewards</li>
                                    <li>• Followers-only chat duration</li>
                                    <li>• Subscriber-only chat</li>
                                    <li>• Slow mode interval</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Facebook Configuration
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Live Settings
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Live video title and description</li>
                                    <li>
                                      • Audience targeting (Page, Profile,
                                      Group)
                                    </li>
                                    <li>• Location tagging</li>
                                    <li>• Post to page feed</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Privacy & Access
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Public, Friends, or Custom audience
                                    </li>
                                    <li>• Allow comments and reactions</li>
                                    <li>• Cross-post to Instagram</li>
                                    <li>• Live shopping integration</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Destination Status & Health
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Monitor the health and status of all your connected
                            destinations in real-time.
                          </p>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 dark:bg-emerald-900/20 dark:border-emerald-800">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                                  Connected
                                </h3>
                              </div>
                              <p className="text-emerald-800 dark:text-emerald-200 text-xs">
                                Destination is active and receiving stream data
                              </p>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-900/20 dark:border-orange-800">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                                <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                                  Reconnecting
                                </h3>
                              </div>
                              <p className="text-orange-800 dark:text-orange-200 text-xs">
                                Temporarily disconnected, attempting to
                                reconnect
                              </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
                              <div className="flex items-center mb-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                <h3 className="font-semibold text-red-900 dark:text-red-100">
                                  Error
                                </h3>
                              </div>
                              <p className="text-red-800 dark:text-red-200 text-xs">
                                Connection failed, check credentials and
                                settings
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Managing Multiple Destinations
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Bulk Actions
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Start All:</strong> Begin streaming
                                  to all connected destinations simultaneously
                                </li>
                                <li>
                                  • <strong>Stop All:</strong> End stream on all
                                  platforms at once
                                </li>
                                <li>
                                  • <strong>Update All:</strong> Apply stream
                                  information changes to all destinations
                                </li>
                                <li>
                                  • <strong>Health Check:</strong> Verify
                                  connection status across all platforms
                                </li>
                                <li>
                                  • <strong>Export Settings:</strong> Save
                                  destination configurations as template
                                </li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Templates & Presets
                              </h3>
                              <p className="text-foreground/90 text-sm mb-3">
                                Save destination configurations as templates for
                                reuse across different streams.
                              </p>
                              <ul className="text-foreground/90 text-sm space-y-1">
                                <li>
                                  • Create templates for different content types
                                  (Gaming, Talk Shows, Tutorials)
                                </li>
                                <li>
                                  • Include pre-configured titles, descriptions,
                                  and platform settings
                                </li>
                                <li>
                                  • Apply templates to new destinations with one
                                  click
                                </li>
                                <li>• Share templates with team members</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Custom RTMP Destinations
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Stream to any platform or service that accepts RTMP
                            input. Useful for custom integrations, private
                            servers, or platforms not yet supported natively.
                          </p>

                          <div className="border border-border rounded-lg p-6 mb-4">
                            <h3 className="font-semibold text-foreground mb-3">
                              Custom RTMP Setup
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Configuration Options
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>
                                    • <strong>Server URL:</strong> Custom RTMP
                                    ingest endpoint
                                  </li>
                                  <li>
                                    • <strong>Stream Key:</strong> Unique
                                    identifier for your stream
                                  </li>
                                  <li>
                                    • <strong>Play URL:</strong> Optional
                                    playback URL for testing
                                  </li>
                                  <li>
                                    • <strong>Backup Server:</strong> Failover
                                    RTMP endpoint
                                  </li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Common Use Cases
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>• Custom streaming servers</li>
                                  <li>• Private CDN deployments</li>
                                  <li>• Media archival systems</li>
                                  <li>• Internal company streams</li>
                                  <li>• Educational institution streaming</li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                              ⚠️ Custom RTMP Tips
                            </h3>
                            <ul className="text-yellow-800 dark:text-yellow-200 text-sm space-y-1">
                              <li>
                                • Verify your server accepts H.264/AAC encoding
                              </li>
                              <li>
                                • Test custom RTMP endpoints before going live
                              </li>
                              <li>
                                • Monitor custom destinations for connection
                                stability
                              </li>
                              <li>
                                • Keep stream keys secure and rotate regularly
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            💡 Best Practices for Destinations
                          </h3>
                          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                            <li>
                              • Keep destination names descriptive for easy
                              identification
                            </li>
                            <li>
                              • Regularly test connections to ensure they're
                              active
                            </li>
                            <li>
                              • Use templates to quickly configure recurring
                              streams
                            </li>
                            <li>
                              • Monitor platform-specific requirements (YouTube
                              stream key rotation)
                            </li>
                            <li>
                              • Maintain backup destinations for critical
                              streams
                            </li>
                            <li>
                              • Review and update stream metadata before each
                              broadcast
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "analytics" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Real-Time Stream Analytics
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Monitor your stream health, performance metrics, and
                            audience engagement across all platforms in
                            real-time. NeuStream provides comprehensive
                            analytics to help you optimize your broadcasts.
                          </p>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Health Dashboard
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-4">
                                Key Performance Indicators
                              </h3>
                              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      Bitrate
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">
                                    6,000
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    kbps
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      FPS
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">
                                    60
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    frames/sec
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      Dropped Frames
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-emerald-600">
                                    0.0%
                                  </div>
                                  <div className="text-xs text-emerald-600">
                                    Optimal
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      Latency
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">
                                    2.5
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    seconds
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      Upload Bandwidth
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">
                                    7.2
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Mbps used
                                  </div>
                                </div>
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-muted-foreground">
                                      Encoder Load
                                    </span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                  </div>
                                  <div className="text-2xl font-bold text-foreground">
                                    65%
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    NVENC
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Platform-Specific Analytics
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                YouTube Metrics
                              </h3>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Current viewers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    1,247
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Peak viewers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    1,563
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Chat messages
                                  </span>
                                  <span className="text-foreground font-medium">
                                    892
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Likes
                                  </span>
                                  <span className="text-foreground font-medium">
                                    234
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Total watch time
                                  </span>
                                  <span className="text-foreground font-medium">
                                    2.3K hrs
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground text-sm">
                                    New subscribers
                                  </span>
                                  <span className="text-emerald-600 font-medium">
                                    +12
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Twitch Metrics
                              </h3>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Current viewers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    342
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Peak viewers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    489
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Chat messages
                                  </span>
                                  <span className="text-foreground font-medium">
                                    1,456
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Bits received
                                  </span>
                                  <span className="text-foreground font-medium">
                                    2,340
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    New followers
                                  </span>
                                  <span className="text-emerald-600 font-medium">
                                    +18
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground text-sm">
                                    Subscribers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    23
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Facebook Metrics
                              </h3>
                              <div className="grid gap-3 md:grid-cols-2">
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Current viewers
                                  </span>
                                  <span className="text-foreground font-medium">
                                    178
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Total reactions
                                  </span>
                                  <span className="text-foreground font-medium">
                                    156
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Comments
                                  </span>
                                  <span className="text-foreground font-medium">
                                    89
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-border/50">
                                  <span className="text-foreground text-sm">
                                    Shares
                                  </span>
                                  <span className="text-foreground font-medium">
                                    23
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-foreground text-sm">
                                    Total reach
                                  </span>
                                  <span className="text-foreground font-medium">
                                    3.2K
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Quality Indicators
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            NeuStream continuously monitors your stream quality
                            and reports on critical metrics.
                          </p>

                          <div className="space-y-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 dark:bg-emerald-900/20 dark:border-emerald-800">
                              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3 flex items-center">
                                <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
                                Excellent Quality
                              </h3>
                              <ul className="text-emerald-800 dark:text-emerald-200 text-sm space-y-1">
                                <li>• Bitrate steady within ±5% of target</li>
                                <li>• No dropped frames (0%)</li>
                                <li>• FPS stable at 60 (no variance)</li>
                                <li>• Encoder utilization under 70%</li>
                                <li>• No connection timeouts</li>
                                <li>• All destinations connected</li>
                              </ul>
                            </div>

                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 dark:bg-orange-900/20 dark:border-orange-800">
                              <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3 flex items-center">
                                <span className="w-3 h-3 bg-orange-500 rounded-full mr-3"></span>
                                Warning State
                              </h3>
                              <ul className="text-orange-800 dark:text-orange-200 text-sm space-y-1">
                                <li>• Bitrate fluctuating ±10-20% of target</li>
                                <li>• Dropped frames between 0.1-1%</li>
                                <li>• FPS dropping below 55 occasionally</li>
                                <li>• Encoder utilization 70-90%</li>
                                <li>• Occasional buffering</li>
                                <li>• 1-2 destinations showing errors</li>
                              </ul>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
                              <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3 flex items-center">
                                <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                                Critical Issues
                              </h3>
                              <ul className="text-red-800 dark:text-red-200 text-sm space-y-1">
                                <li>• Bitrate below 50% of target</li>
                                <li>• Dropped frames above 1%</li>
                                <li>• FPS consistently under 50</li>
                                <li>• Encoder utilization over 95%</li>
                                <li>• Frequent disconnections</li>
                                <li>• Multiple destinations failing</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Performance Optimization
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Common Performance Issues & Solutions
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">
                                      1
                                    </span>
                                    High Dropped Frames
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                                    <li>
                                      • Reduce output resolution (1080p → 720p)
                                    </li>
                                    <li>• Lower bitrate by 10-20%</li>
                                    <li>• Check upload bandwidth stability</li>
                                    <li>
                                      • Close bandwidth-heavy applications
                                    </li>
                                    <li>
                                      • Switch to hardware encoding if using CPU
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">
                                      2
                                    </span>
                                    Encoder Overload
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                                    <li>
                                      • Lower encoding preset (quality →
                                      performance)
                                    </li>
                                    <li>• Reduce output resolution</li>
                                    <li>• Enable GPU scaling instead of CPU</li>
                                    <li>
                                      • Close other GPU-intensive applications
                                    </li>
                                    <li>• Update GPU drivers</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">
                                      3
                                    </span>
                                    Audio/Video Sync Issues
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                                    <li>
                                      • Set audio sync offset in OBS (+40ms to
                                      +80ms)
                                    </li>
                                    <li>
                                      • Enable "Sync to Output" in OBS settings
                                    </li>
                                    <li>
                                      • Use display capture instead of game
                                      capture
                                    </li>
                                    <li>
                                      • Disable hardware acceleration in
                                      browser/game
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center">
                                    <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs mr-2">
                                      4
                                    </span>
                                    Connection Timeouts
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1 ml-8">
                                    <li>
                                      • Increase reconnect delay (10s → 30s)
                                    </li>
                                    <li>
                                      • Check internet connection stability
                                    </li>
                                    <li>
                                      • Try different RTMP server endpoints
                                    </li>
                                    <li>• Enable automatic reconnection</li>
                                    <li>• Restart router/modem</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Historical Analytics & Reports
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Available Reports
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Stream Summary:</strong> Overall
                                  performance per stream
                                </li>
                                <li>
                                  • <strong>Platform Comparison:</strong> Viewer
                                  metrics across all platforms
                                </li>
                                <li>
                                  • <strong>Quality Analysis:</strong> Technical
                                  performance trends
                                </li>
                                <li>
                                  • <strong>Engagement Report:</strong> Chat
                                  activity and audience interaction
                                </li>
                                <li>
                                  • <strong>Growth Tracking:</strong>{" "}
                                  Followers/subscribers gained over time
                                </li>
                                <li>
                                  • <strong>Peak Performance:</strong> Identify
                                  optimal streaming times
                                </li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Export Options
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>CSV Export:</strong> Raw data for
                                  Excel/Google Sheets
                                </li>
                                <li>
                                  • <strong>PDF Reports:</strong> Formatted
                                  summaries for sharing
                                </li>
                                <li>
                                  • <strong>API Access:</strong> Retrieve
                                  analytics programmatically
                                </li>
                                <li>
                                  • <strong>Scheduled Reports:</strong>{" "}
                                  Automatic email delivery
                                </li>
                                <li>
                                  • <strong>Custom Dashboards:</strong> Create
                                  your own metrics view
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            📊 Monitoring Best Practices
                          </h3>
                          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                            <li>
                              • Check analytics dashboard before going live to
                              verify connection
                            </li>
                            <li>
                              • Monitor dropped frames in real-time during
                              stream
                            </li>
                            <li>
                              • Set up alerts for critical issues (email/push
                              notifications)
                            </li>
                            <li>
                              • Review post-stream reports to identify
                              improvement areas
                            </li>
                            <li>
                              • Track platform-specific metrics to understand
                              your audience
                            </li>
                            <li>
                              • Use quality indicators to adjust settings
                              mid-stream if needed
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "chat-management" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Unified Chat Management
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            NeuStream's Chat Connector aggregates messages from
                            all your streaming platforms into a single, unified
                            interface. Engage with your entire audience across
                            YouTube, Twitch, Facebook, and more - all from one
                            place.
                          </p>

                          <div className="bg-muted rounded-lg p-6 border border-border mb-6">
                            <h3 className="font-semibold text-foreground mb-3">
                              How Chat Aggregation Works
                            </h3>
                            <div className="space-y-3">
                              <div className="flex items-start space-x-3">
                                <span className="text-primary font-bold">
                                  1.
                                </span>
                                <p className="text-sm text-foreground/90">
                                  NeuStream connects to each platform's chat
                                  system using OAuth authentication
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <span className="text-primary font-bold">
                                  2.
                                </span>
                                <p className="text-sm text-foreground/90">
                                  Chat messages are received in real-time via
                                  platform APIs (Twitch IRC, YouTube Live Chat
                                  API, etc.)
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <span className="text-primary font-bold">
                                  3.
                                </span>
                                <p className="text-sm text-foreground/90">
                                  Messages are normalized and displayed in
                                  NeuStream's unified chat interface
                                </p>
                              </div>
                              <div className="flex items-start space-x-3">
                                <span className="text-primary font-bold">
                                  4.
                                </span>
                                <p className="text-sm text-foreground/90">
                                  Platform indicator shows which platform each
                                  message comes from
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Connecting Platform Chats
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Enable chat for each platform you've added as a
                            destination. Chat access requires the same OAuth
                            permissions used for streaming.
                          </p>

                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  YT
                                </span>
                                YouTube Chat
                              </h3>
                              <div className="space-y-3">
                                <div className="bg-blue-50 rounded p-3 dark:bg-blue-900/20">
                                  <p className="text-xs text-blue-900 dark:text-blue-100">
                                    <strong>Note:</strong> YouTube chat has a
                                    2-5 minute delay. This is normal and cannot
                                    be reduced.
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Supported Features:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Read live chat messages</li>
                                    <li>
                                      • View super chat and super sticker
                                      donations
                                    </li>
                                    <li>
                                      • See new member messages (with welcome
                                      effect)
                                    </li>
                                    <li>• Read message timestamps</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Limitations:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Cannot send messages via API (YouTube
                                      restriction)
                                    </li>
                                    <li>
                                      • Cannot delete messages (requires channel
                                      owner permissions)
                                    </li>
                                    <li>
                                      • Some message types may not appear
                                      (membership gifts, etc.)
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  T
                                </span>
                                Twitch Chat
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Supported Features:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Read all chat messages in real-time
                                    </li>
                                    <li>
                                      • Send messages as broadcaster or bot
                                      account
                                    </li>
                                    <li>
                                      • Delete messages (with moderator
                                      permissions)
                                    </li>
                                    <li>
                                      • See system messages (subscriptions,
                                      bits, etc.)
                                    </li>
                                    <li>• Display emote-only messages</li>
                                    <li>• View VIP and moderator badges</li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Message Types:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Standard messages</li>
                                    <li>• Cheering with Bits</li>
                                    <li>• Subscription notifications</li>
                                    <li>• Resub messages</li>
                                    <li>• Raid announcements</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3">
                                  FB
                                </span>
                                Facebook Live Chat
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Supported Features:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Read live video comments</li>
                                    <li>
                                      • See reactions (likes, loves, etc.)
                                    </li>
                                    <li>• View shares count</li>
                                    <li>
                                      • Read question and answer interactions
                                    </li>
                                  </ul>
                                </div>
                                <div className="bg-yellow-50 rounded p-3 dark:bg-yellow-900/20">
                                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                                    <strong>Note:</strong> Facebook Live doesn't
                                    support sending responses via third-party
                                    applications.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  LI
                                </span>
                                LinkedIn Live Chat
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Supported Features:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Read comments in real-time</li>
                                    <li>• View reactions</li>
                                    <li>• Professional networking features</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Using the Unified Chat Interface
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Chat Layout
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Message Display
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Platform icon next to each message
                                    </li>
                                    <li>• Username and timestamp</li>
                                    <li>
                                      • Message text with platform-specific
                                      formatting
                                    </li>
                                    <li>
                                      • Special badges (moderator, subscriber,
                                      VIP, etc.)
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Filtering Options
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Show/hide specific platforms</li>
                                    <li>
                                      • Filter by message type (donations, subs,
                                      etc.)
                                    </li>
                                    <li>• Search messages by keyword</li>
                                    <li>
                                      • Filter by user role (mod, sub, VIP,
                                      etc.)
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Responding to Messages
                              </h3>
                              <div className="space-y-3">
                                <div className="bg-green-50 rounded p-3 dark:bg-green-900/20">
                                  <p className="text-xs text-green-900 dark:text-green-100">
                                    <strong>Twitch:</strong> You can reply
                                    directly from NeuStream's chat interface
                                  </p>
                                </div>
                                <div className="bg-orange-50 rounded p-3 dark:bg-orange-900/20">
                                  <p className="text-xs text-orange-900 dark:text-orange-100">
                                    <strong>YouTube & Facebook:</strong> Click
                                    the link to open the platform's native chat
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Reply Features:
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Quick replies with predefined messages
                                    </li>
                                    <li>
                                      • @mention users with proper platform
                                      formatting
                                    </li>
                                    <li>
                                      • Send as yourself or as a bot account
                                    </li>
                                    <li>• Pin messages for visibility</li>
                                    <li>• Highlight important messages</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Chat Moderation Tools
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Auto-Moderation
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Link Filter:</strong> Automatically
                                  hide messages containing suspicious links
                                </li>
                                <li>
                                  • <strong>Spam Detection:</strong> Block
                                  repetitive or excessive messages
                                </li>
                                <li>
                                  • <strong>Bad Word Filter:</strong>{" "}
                                  Customizable blacklist of prohibited terms
                                </li>
                                <li>
                                  • <strong>Emote-Only Mode:</strong> Allow only
                                  emote messages (Twitch)
                                </li>
                                <li>
                                  • <strong>Slow Mode:</strong> Limit message
                                  frequency (Twitch)
                                </li>
                                <li>
                                  • <strong>Follower-Only Mode:</strong>{" "}
                                  Restrict chat to followers (Twitch)
                                </li>
                              </ul>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Moderation Actions
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Delete Message:</strong> Remove
                                  individual messages
                                </li>
                                <li>
                                  • <strong>Timeout User:</strong> Temporarily
                                  restrict chat participation
                                </li>
                                <li>
                                  • <strong>Ban User:</strong> Permanently
                                  remove user from chat
                                </li>
                                <li>
                                  • <strong>Permanent Ban:</strong> Block user
                                  from entire channel
                                </li>
                                <li>
                                  • <strong>Purge Chat:</strong> Clear all
                                  messages from a user
                                </li>
                              </ul>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                                ⚠️ Platform Permissions Required
                              </h3>
                              <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                Chat moderation features vary by platform and
                                require appropriate permissions. Twitch requires
                                moderator or broadcaster status. YouTube doesn't
                                allow third-party message deletion.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Chat Bots & Automation
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Built-In Bot Features
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Auto-Greetings:</strong> Welcome new
                                  chatters automatically
                                </li>
                                <li>
                                  • <strong>Command Responses:</strong> Create
                                  custom commands (!commands)
                                </li>
                                <li>
                                  • <strong>Polls & Surveys:</strong>{" "}
                                  Interactive audience engagement
                                </li>
                                <li>
                                  • <strong>Countdown Timers:</strong> Stream
                                  start timers and breaks
                                </li>
                                <li>
                                  • <strong>Phrase Triggers:</strong>{" "}
                                  Auto-respond to specific keywords
                                </li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Custom Bot Integration
                              </h3>
                              <p className="text-foreground/90 text-sm mb-3">
                                Connect your own chat bots (Moobot, Streamlabs,
                                etc.) through webhooks or APIs.
                              </p>
                              <ul className="text-foreground/90 text-sm space-y-1">
                                <li>
                                  • Webhook notifications for new messages
                                </li>
                                <li>• REST API for bot interactions</li>
                                <li>
                                  • WebSocket connections for real-time events
                                </li>
                                <li>• Custom command integration</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Chat Analytics
                          </h2>
                          <div className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="bg-muted rounded-lg p-6 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">
                                  Engagement Metrics
                                </h3>
                                <ul className="text-foreground/90 text-sm space-y-2">
                                  <li>• Total messages per stream</li>
                                  <li>• Unique chatters count</li>
                                  <li>• Messages per minute</li>
                                  <li>• Peak chat activity times</li>
                                  <li>• Most active chatters</li>
                                </ul>
                              </div>
                              <div className="bg-muted rounded-lg p-6 border border-border">
                                <h3 className="font-semibold text-foreground mb-3">
                                  Platform Breakdown
                                </h3>
                                <ul className="text-foreground/90 text-sm space-y-2">
                                  <li>• Messages by platform</li>
                                  <li>• Platform engagement rates</li>
                                  <li>• Cross-platform conversations</li>
                                  <li>• Platform-specific metrics</li>
                                  <li>• Engagement comparison charts</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            💡 Chat Management Tips
                          </h3>
                          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                            <li>
                              • Use platform filters to focus on specific
                              audiences
                            </li>
                            <li>• Set up auto-moderation before going live</li>
                            <li>
                              • Create quick-reply templates for common
                              questions
                            </li>
                            <li>
                              • Highlight questions to keep track of unanswered
                              items
                            </li>
                            <li>
                              • Use @mentions sparingly to avoid overwhelming
                              users
                            </li>
                            <li>
                              • Review chat analytics after streams to improve
                              engagement
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "subscription-billing" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Subscription Plans
                          </h2>
                          <p className="text-foreground/90 mb-6 leading-relaxed">
                            Choose the NeuStream plan that best fits your
                            streaming needs. All plans include our core
                            multistreaming infrastructure with no setup fees or
                            hidden costs.
                          </p>

                          {plansLoading ? (
                            <div className="text-center py-12">
                              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                              <p className="text-muted-foreground mt-4">
                                Loading plans...
                              </p>
                            </div>
                          ) : plansError ? (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/20 dark:border-red-800">
                              <p className="text-red-800 dark:text-red-200">
                                Error loading plans. Please try again later.
                              </p>
                            </div>
                          ) : plans.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-3">
                              {plans.map((plan) => (
                                <div
                                  key={plan.id}
                                  className={`bg-white dark:bg-gray-800 rounded-lg p-6 border-2 ${
                                    plan.isPopular
                                      ? "border-primary relative"
                                      : "border-border"
                                  }`}
                                >
                                  {plan.isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                                        Most Popular
                                      </span>
                                    </div>
                                  )}
                                  <div className="mb-4">
                                    <h3 className="text-xl font-semibold text-foreground mb-2">
                                      {plan.name}
                                    </h3>
                                    <div className="text-3xl font-bold text-foreground">
                                      {getPlanPrice(plan)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      /{getPlanInterval(plan)}
                                    </div>
                                  </div>

                                  {/* Features from API or fallback */}
                                  <ul className="space-y-3 mb-6">
                                    {plan.features &&
                                    Array.isArray(plan.features) ? (
                                      plan.features
                                        .slice(0, 8)
                                        .map((feature, idx) => (
                                          <li
                                            key={idx}
                                            className="flex items-start text-sm"
                                          >
                                            <span className="text-emerald-500 mr-2">
                                              ✓
                                            </span>
                                            <span className="text-foreground/90">
                                              {feature.text || feature}
                                            </span>
                                          </li>
                                        ))
                                    ) : (
                                      <>
                                        {plan.name.toLowerCase() === "free" && (
                                          <>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                Stream to{" "}
                                                {getMaxDestinations(plan)}{" "}
                                                platforms
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                720p streaming quality
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                Basic analytics
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                Community support
                                              </span>
                                            </li>
                                          </>
                                        )}
                                        {(plan.name.toLowerCase() === "pro" ||
                                          plan.name.toLowerCase() ===
                                            "business") && (
                                          <>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                {getMaxDestinations(plan) === -1
                                                  ? "Unlimited platforms"
                                                  : `Stream to ${getMaxDestinations(plan)} platforms`}
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                Up to{" "}
                                                {getMaxStreamingHours(plan)}{" "}
                                                hours/month
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                Advanced analytics
                                              </span>
                                            </li>
                                            <li className="flex items-start text-sm">
                                              <span className="text-emerald-500 mr-2">
                                                ✓
                                              </span>
                                              <span className="text-foreground/90">
                                                {plan.support || "Priority"}{" "}
                                                support
                                              </span>
                                            </li>
                                          </>
                                        )}
                                      </>
                                    )}
                                  </ul>

                                  <Link to="/auth">
                                    <Button className="mt-auto w-full text-white">
                                      {getPlanPrice(plan) === "$0.00"
                                        ? "Get Started"
                                        : "Choose Plan"}
                                    </Button>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-muted-foreground">
                                No plans available at the moment.
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Billing & Payments
                          </h2>
                          <div className="space-y-6">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Payment Methods
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>Credit/Debit Cards:</strong> Visa,
                                  Mastercard, American Express, Discover
                                </li>
                                <li>
                                  • <strong>PayPal:</strong> Secure payment
                                  through PayPal account
                                </li>
                                <li>
                                  • <strong>Bank Transfer:</strong> Available
                                  for Enterprise plans
                                </li>
                                <li>
                                  • <strong>Cryptocurrency:</strong> Bitcoin,
                                  Ethereum (Enterprise only)
                                </li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Billing Cycle
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Monthly Billing
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Pay monthly with no commitment. Cancel
                                    anytime. 7-day money-back guarantee.
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Annual Billing (Save 20%)
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Pay annually and save 20% compared to
                                    monthly billing. Best for regular streamers.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Invoicing
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>• Automatic invoices sent via email</li>
                                <li>
                                  • Download invoices from billing dashboard
                                </li>
                                <li>• Custom VAT numbers supported</li>
                                <li>• PO numbers accepted (Enterprise)</li>
                                <li>• Multi-currency support</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Upgrades & Downgrades
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Upgrading Your Plan
                              </h3>
                              <ol className="text-sm text-foreground/90 space-y-3">
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">1.</span>
                                  <span>
                                    Go to Settings → Subscription & Billing
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">2.</span>
                                  <span>
                                    Click "Change Plan" and select new plan
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">3.</span>
                                  <span>
                                    Review prorated charges for upgrade
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">4.</span>
                                  <span>Confirm payment method</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">5.</span>
                                  <span>Upgrade takes effect immediately</span>
                                </li>
                              </ol>
                              <div className="mt-4 bg-blue-50 rounded p-3 dark:bg-blue-900/20">
                                <p className="text-xs text-blue-900 dark:text-blue-100">
                                  <strong>Pro Tip:</strong> Upgrades take effect
                                  immediately and you'll be charged the prorated
                                  difference.
                                </p>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Downgrading Your Plan
                              </h3>
                              <ol className="text-sm text-foreground/90 space-y-3">
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">1.</span>
                                  <span>
                                    Go to Settings → Subscription & Billing
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">2.</span>
                                  <span>
                                    Click "Change Plan" and select lower tier
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">3.</span>
                                  <span>Review changes to feature limits</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">4.</span>
                                  <span>
                                    Downgrade takes effect at next billing cycle
                                  </span>
                                </li>
                              </ol>
                              <div className="mt-4 bg-yellow-50 rounded p-3 dark:bg-yellow-900/20">
                                <p className="text-xs text-yellow-900 dark:text-yellow-100">
                                  <strong>Note:</strong> Downgrades take effect
                                  at your next billing date. You'll retain all
                                  features until then.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Refunds & Cancellations
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                7-Day Money-Back Guarantee
                              </h3>
                              <p className="text-foreground/90 text-sm mb-3">
                                Not satisfied with NeuStream? Get a full refund
                                within 7 days of your first payment.
                              </p>
                              <ul className="text-foreground/90 text-sm space-y-1">
                                <li>
                                  • Applies to first-time subscribers only
                                </li>
                                <li>• No questions asked refund policy</li>
                                <li>
                                  • Refund processed within 5-7 business days
                                </li>
                                <li>• Contact support to request refund</li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Cancelling Your Subscription
                              </h3>
                              <ol className="text-sm text-foreground/90 space-y-3">
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">1.</span>
                                  <span>
                                    Go to Settings → Subscription & Billing
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">2.</span>
                                  <span>Click "Cancel Subscription"</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">3.</span>
                                  <span>
                                    Tell us why you're cancelling (optional)
                                  </span>
                                </li>
                                <li className="flex items-start">
                                  <span className="font-semibold mr-3">4.</span>
                                  <span>Confirm cancellation</span>
                                </li>
                              </ol>
                              <div className="mt-4 bg-orange-50 rounded p-3 dark:bg-orange-900/20">
                                <p className="text-xs text-orange-900 dark:text-orange-100">
                                  <strong>Important:</strong> You'll retain
                                  access to all features until the end of your
                                  billing period.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "troubleshooting" && (
                      <div className="space-y-8">
                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Connection Issues
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  1
                                </span>
                                "Failed to connect to server" Error
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Possible Causes:</strong>
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>• Incorrect server URL or stream key</li>
                                  <li>• Firewall blocking connection</li>
                                  <li>• ISP blocking RTMP protocol</li>
                                  <li>
                                    • Stream key has expired or been regenerated
                                  </li>
                                </ul>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Verify server URL is:{" "}
                                    <code className="text-xs">
                                      rtmp://stream.neustream.app
                                    </code>
                                  </li>
                                  <li>
                                    2. Copy stream key directly from NeuStream
                                    dashboard
                                  </li>
                                  <li>
                                    3. Temporarily disable firewall/antivirus
                                  </li>
                                  <li>
                                    4. Try different network (mobile hotspot)
                                  </li>
                                  <li>
                                    5. Contact your ISP to check RTMP blocking
                                  </li>
                                </ol>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  2
                                </span>
                                Intermittent Disconnections
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Possible Causes:</strong>
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>• Unstable internet connection</li>
                                  <li>
                                    • Router overheating or performance issues
                                  </li>
                                  <li>
                                    • Bandwidth fluctuations during peak hours
                                  </li>
                                </ul>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Run internet speed test - should be
                                    stable
                                  </li>
                                  <li>2. Restart router and modem</li>
                                  <li>
                                    3. Use ethernet connection instead of WiFi
                                  </li>
                                  <li>
                                    4. Enable auto-reconnect in OBS settings
                                  </li>
                                  <li>5. Reduce bitrate by 20%</li>
                                  <li>
                                    6. Upgrade internet plan if consistently
                                    unstable
                                  </li>
                                </ol>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  3
                                </span>
                                "Authentication Failed" Error
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Possible Causes:</strong>
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>• Stream key has been regenerated</li>
                                  <li>
                                    • Stream key incorrectly copied (extra
                                    spaces/characters)
                                  </li>
                                  <li>
                                    • Source has been deleted or suspended
                                  </li>
                                </ul>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>1. Regenerate stream key in dashboard</li>
                                  <li>
                                    2. Copy new key carefully, no extra spaces
                                  </li>
                                  <li>3. Verify source status is "Active"</li>
                                  <li>4. Clear OBS cache and restart</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Stream Quality Issues
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  1
                                </span>
                                High Dropped Frames
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Diagnosis:</strong> If dropped frames
                                  exceed 1%, your stream quality is affected.
                                </p>
                                <p className="text-foreground/90 text-sm mt-2">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Reduce output resolution (1080p → 720p)
                                  </li>
                                  <li>2. Lower bitrate by 10-20%</li>
                                  <li>
                                    3. Enable hardware encoding
                                    (NVENC/QuickSync)
                                  </li>
                                  <li>4. Close unnecessary applications</li>
                                  <li>
                                    5. Check CPU/GPU usage - should be below 80%
                                  </li>
                                  <li>
                                    6. Disable Windows Game Bar and overlays
                                  </li>
                                  <li>7. Update GPU drivers</li>
                                </ol>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  2
                                </span>
                                Pixelated or Blurry Video
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Possible Causes:</strong>
                                </p>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>• Bitrate too low for resolution</li>
                                  <li>
                                    • Bitrate control mode set incorrectly
                                  </li>
                                  <li>• Obsolete encoder settings</li>
                                </ul>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Increase bitrate (6000 kbps for 1080p)
                                  </li>
                                  <li>2. Use CBR (Constant Bitrate) mode</li>
                                  <li>3. Enable VBV Buffer (1500-3000 kbps)</li>
                                  <li>
                                    4. Increase Keyframe Interval to 2 seconds
                                  </li>
                                  <li>5. Use x264 medium or slower preset</li>
                                </ol>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  3
                                </span>
                                Audio/Video Sync Issues
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Symptoms:</strong> Audio plays before
                                  or after video
                                </p>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Set audio sync offset (+40ms to +80ms)
                                  </li>
                                  <li>2. Enable "Sync to Output" in OBS</li>
                                  <li>
                                    3. Disable hardware acceleration in games
                                  </li>
                                  <li>
                                    4. Use display capture instead of game
                                    capture
                                  </li>
                                  <li>
                                    5. Set audio sample rate to 48kHz (match
                                    video)
                                  </li>
                                </ol>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3 flex items-center">
                                <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                  4
                                </span>
                                Encoder Overload
                              </h3>
                              <div className="space-y-3">
                                <p className="text-foreground/90 text-sm">
                                  <strong>Symptoms:</strong> High encoder usage,
                                  dropped frames, stuttering
                                </p>
                                <p className="text-foreground/90 text-sm mt-3">
                                  <strong>Solutions:</strong>
                                </p>
                                <ol className="text-sm text-muted-foreground space-y-1 ml-4">
                                  <li>
                                    1. Switch to hardware encoder
                                    (NVENC/QuickSync)
                                  </li>
                                  <li>
                                    2. Lower encoding preset (quality →
                                    performance)
                                  </li>
                                  <li>3. Reduce output resolution</li>
                                  <li>4. Close GPU-intensive applications</li>
                                  <li>5. Enable GPU scaling instead of CPU</li>
                                  <li>6. Update GPU drivers</li>
                                </ol>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Platform-Specific Issues
                          </h2>
                          <div className="space-y-4">
                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                YouTube
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Stream not appearing on YouTube
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Wait 24-48 hours for new accounts to be
                                      eligible
                                    </li>
                                    <li>
                                      • Verify stream key is correct and not
                                      expired
                                    </li>
                                    <li>
                                      • Check YouTube account has streaming
                                      enabled
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Low viewer count on YouTube
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Increase thumbnail quality and
                                      attractiveness
                                    </li>
                                    <li>
                                      • Optimize stream title and description
                                      with keywords
                                    </li>
                                    <li>
                                      • YouTube has built-in delay (30-60
                                      seconds)
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Twitch
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Twitch not receiving stream
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Verify stream key from Twitch dashboard
                                    </li>
                                    <li>
                                      • Check channel isn't in "Stream Review"
                                      mode
                                    </li>
                                    <li>
                                      • Ensure no IP restrictions on Twitch
                                      account
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Chat not connecting
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Re-authenticate Twitch account</li>
                                    <li>
                                      • Check if channel is in "slow mode" or
                                      "sub-only mode"
                                    </li>
                                    <li>
                                      • Verify chat bot isn't blocking
                                      connections
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            <div className="border border-border rounded-lg p-6">
                              <h3 className="font-semibold text-foreground mb-3">
                                Facebook
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Facebook Live not starting
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Verify page is published and approved
                                      for live
                                    </li>
                                    <li>
                                      • Check country restrictions on page
                                    </li>
                                    <li>
                                      • Ensure Facebook account has live
                                      streaming rights
                                    </li>
                                  </ul>
                                </div>
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">
                                    Stream quality poor on Facebook
                                  </h4>
                                  <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>
                                      • Facebook often reduces quality
                                      automatically
                                    </li>
                                    <li>
                                      • Wait for viewer count to stabilize
                                    </li>
                                    <li>
                                      • Facebook prioritizes engagement over
                                      quality
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Performance Optimization
                          </h2>
                          <div className="bg-muted rounded-lg p-6 border border-border">
                            <h3 className="font-semibold text-foreground mb-3">
                              System Performance Checklist
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Before Going Live:
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>✓ Close unnecessary applications</li>
                                  <li>✓ Disable Windows Game Bar (Win+G)</li>
                                  <li>✓ Run Windows Game Mode</li>
                                  <li>
                                    ✓ Set power plan to "High Performance"
                                  </li>
                                  <li>✓ Close browser tabs</li>
                                  <li>✓ Disable Windows automatic updates</li>
                                  <li>✓ Clear OBS scene collections</li>
                                </ul>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  During Stream:
                                </h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  <li>
                                    ✓ Monitor CPU usage (should be &lt;70%)
                                  </li>
                                  <li>
                                    ✓ Monitor GPU usage (should be &lt;90%)
                                  </li>
                                  <li>✓ Check encoder utilization</li>
                                  <li>✓ Watch dropped frames percentage</li>
                                  <li>✓ Monitor network upload stability</li>
                                  <li>✓ Avoid switching between games/apps</li>
                                  <li>✓ Keep system temperatures low</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h2 className="text-2xl font-semibold text-foreground mb-4">
                            Diagnostic Tools & Resources
                          </h2>
                          <div className="space-y-4">
                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Useful Tools
                              </h3>
                              <ul className="text-foreground/90 text-sm space-y-2">
                                <li>
                                  • <strong>speedtest.net</strong> - Check
                                  upload/download speeds
                                </li>
                                <li>
                                  • <strong>obsproject.com help</strong> -
                                  OBS-specific troubleshooting
                                </li>
                                <li>
                                  • <strong>Streamlabs</strong> - Alternative
                                  streaming software
                                </li>
                                <li>
                                  • <strong>GPU-Z</strong> - Monitor GPU
                                  temperatures and usage
                                </li>
                                <li>
                                  • <strong>NeuStream Dashboard</strong> -
                                  Real-time stream health monitoring
                                </li>
                              </ul>
                            </div>

                            <div className="bg-muted rounded-lg p-6 border border-border">
                              <h3 className="font-semibold text-foreground mb-3">
                                Getting Help
                              </h3>
                              <p className="text-foreground/90 text-sm mb-3">
                                Still having issues? Our support team is here to
                                help.
                              </p>
                              <ul className="text-foreground/90 text-sm space-y-1">
                                <li>• 📧 Email: support@neustream.app</li>
                                <li>
                                  • 💬 Live Chat: Available in dashboard
                                  (Pro/Enterprise)
                                </li>
                                <li>• 📚 Knowledge Base: help.neustream.app</li>
                                <li>
                                  • 🎥 Video Tutorials: youtube.com/neustream
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 dark:bg-blue-900/20 dark:border-blue-800">
                          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            💡 Prevention is Better Than Cure
                          </h3>
                          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-2">
                            <li>
                              • Always test your stream 30 minutes before going
                              live
                            </li>
                            <li>• Keep a backup streaming setup ready</li>
                            <li>
                              • Monitor stream health during entire broadcast
                            </li>
                            <li>
                              • Have a secondary internet connection as backup
                            </li>
                            <li>
                              • Regularly update streaming software and drivers
                            </li>
                            <li>
                              • Maintain adequate upload bandwidth (20% buffer)
                            </li>
                            <li>• Document what works for your setup</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
