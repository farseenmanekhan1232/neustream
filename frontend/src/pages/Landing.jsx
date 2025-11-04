import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Check, Radio, BarChart3, MessageCircle, Clock, Users, Zap, Palette, Shield, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { subscriptionService } from "../services/subscription";
import { TextHighlighter } from "../components/fancy/text/TextHighlighter";
import MetricsDisplay from "../components/MetricsDisplay";
import LiveChatSimulator from "../components/LiveChatSimulator";
import StreamConfigSimulator from "../components/StreamConfigSimulator";
import { useCurrency } from "../contexts/CurrencyContext";

function Landing() {
  // Use currency context
  const { formatPrice } = useCurrency();

  // TextHighlighter configuration
  const highlightConfig = {
    transition: { type: "spring", duration: 1, delay: 0.2, bounce: 0 },
    highlightColor: "#F2AD91",
    className: "rounded-[0.3em] px-px",
    useInViewOptions: { once: true, initial: false, amount: 0.3 },
    triggerType: "inView",
    direction: "ltr",
  };

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

  // Helper function to get plan description and best for information
  const getPlanInfo = (plan) => {
    const planName = plan.name.toLowerCase();

    const planInfo = {
      free: {
        description: plan.description || "Perfect starting point for content creators exploring multistreaming",
        bestFor:
          "Beginners testing multistreaming, hobby streamers, and those trying out the platform",
        features: [
          { icon: <Radio className="w-5 h-5" />, text: "Stream to platforms simultaneously" },
          { icon: <BarChart3 className="w-5 h-5" />, text: "Basic analytics dashboard" },
          { icon: <MessageCircle className="w-5 h-5" />, text: "1 chat connector" },
          { icon: <Clock className="w-5 h-5" />, text: "35 hours streaming monthly" },
          { icon: <Users className="w-5 h-5" />, text: "Community support" },
        ],
      },
      pro: {
        description: plan.description || "Most popular choice for serious content creators and growing streamers",
        bestFor:
          "Regular streamers, content creators expanding their reach, and small stream teams",
        features: [
          { icon: <Radio className="w-5 h-5" />, text: "Stream to platforms simultaneously" },
          { icon: <BarChart3 className="w-5 h-5" />, text: "Advanced analytics & insights" },
          { icon: <MessageCircle className="w-5 h-5" />, text: "3 chat connectors" },
          { icon: <Clock className="w-5 h-5" />, text: "1000 hours streaming monthly" },
          { icon: <Users className="w-5 h-5" />, text: "Up to 2 streaming sources" },
          { icon: <Zap className="w-5 h-5" />, text: "Priority support" },
          { icon: <Palette className="w-5 h-5" />, text: "Custom branding options" },
        ],
      },
      business: {
        description: plan.description || "Comprehensive solution for professional streaming operations and teams",
        bestFor:
          "Professional streamers, production companies, esports teams, and large content creators",
        features: [
          { icon: <Radio className="w-5 h-5" />, text: "Stream to platforms simultaneously" },
          { icon: <BarChart3 className="w-5 h-5" />, text: "Enterprise analytics & insights" },
          { icon: <MessageCircle className="w-5 h-5" />, text: "10 chat connectors" },
          { icon: <Clock className="w-5 h-5" />, text: "5000 hours streaming monthly" },
          { icon: <Users className="w-5 h-5" />, text: "Up to 5 streaming sources" },
          { icon: <Shield className="w-5 h-5" />, text: "24/7 dedicated support" },
          { icon: <Palette className="w-5 h-5" />, text: "Full custom branding" },
          { icon: <Users className="w-5 h-5" />, text: "Team collaboration features" },
          { icon: <Shield className="w-5 h-5" />, text: "Enhanced security & privacy" },
        ],
      },
    };

    return planInfo[planName] || planInfo.free;
  };

  // Helper function to format plan features based on plan data (fallback for dynamic plans)
  const getPlanFeatures = (plan) => {
    const planInfo = getPlanInfo(plan);
    const features = [...planInfo.features];

    // Override with actual plan data if available
    if (plan.max_destinations) {
      features[0] = {
        icon: <Radio className="w-5 h-5" />,
        text: `Stream to ${plan.max_destinations} platform${plan.max_destinations > 1 ? "s" : ""} simultaneously`,
      };
    }

    if (plan.max_streaming_hours_monthly) {
      const hoursFeature = features.find((f) =>
        f.text.includes("hours streaming"),
      );
      if (hoursFeature) {
        hoursFeature.text = `${plan.max_streaming_hours_monthly} hours streaming monthly`;
      }
    }

    if (plan.max_sources > 1) {
      const sourcesFeature = features.find((f) =>
        f.text.includes("streaming sources"),
      );
      if (sourcesFeature) {
        sourcesFeature.text = `Up to ${plan.max_sources} streaming sources`;
      }
    }

    // Parse chat connectors from plan features array
    let chatConnectorsCount = 1;
    if (plan.features && Array.isArray(plan.features)) {
      const chatFeature = plan.features.find(f => f.includes("Chat Connectors:"));
      if (chatFeature) {
        const match = chatFeature.match(/Chat Connectors:\s*(\d+)/);
        if (match) {
          chatConnectorsCount = parseInt(match[1]);
        }
      }
    }

    const chatConnectorFeature = features.find((f) => f.text.includes("chat connector"));
    if (chatConnectorFeature) {
      chatConnectorFeature.text = `${chatConnectorsCount} chat connector${chatConnectorsCount > 1 ? "s" : ""} (Twitch, YouTube, etc.)`;
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>Neustream - Multistream to all platforms from one place</title>
        <meta
          name="description"
          content="Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously with Neustream. Professional multistreaming platform for content creators."
        />
        <meta
          name="keywords"
          content="multistream, live streaming, youtube, twitch, facebook, linkedin, streaming software, content creator"
        />
        <meta
          property="og:title"
          content="Neustream - Multistream to all platforms from one place"
        />
        <meta
          property="og:description"
          content="Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously with Neustream. Professional multistreaming platform for content creators."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Neustream - Multistream to all platforms from one place"
        />
        <meta
          name="twitter:description"
          content="Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously with Neustream. Professional multistreaming platform for content creators."
        />
        <meta name="twitter:image" content="/twitter-image.png" />
        <link rel="canonical" href="https://neustream.app" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 md:space-y-12">
            <div className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Neustream Logo"
                className="h-24 w-24 -mb-8 animate-oscillate"
              />
            </div>

            <div className="space-y-6 max-w-4xl">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                Streaming Without{" "}
                <TextHighlighter {...highlightConfig}>
                  Performance Compromises
                </TextHighlighter>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <Button
                asChild
                className="w-full min-h-[52px] text-lg py-7 px-10 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl relative transition-all hover:scale-105"
              >
                <Link to="/auth">
                  Start Streaming Free
                  <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full animate-pulse">
                    LIVE
                  </span>
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              <p className="opacity-90 text-base md:text-lg font-light">
                Seamlessly integrate with your favorite platforms
              </p>
              <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 opacity-90">
                {["Twitch", "YouTube", "Facebook", "TikTok", "Instagram"].map(
                  (platform) => (
                    <div
                      key={platform}
                      className="text-lg md:text-xl font-medium text-shadow-md"
                    >
                      {platform}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
              <a
                href="https://www.producthunt.com/products/neustream?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-neustream"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1033369&theme=light&t=1762067006843"
                  alt="Neustream - Multi&#0045;platform&#0032;streaming | Product Hunt"
                  style={{ width: "250px", height: "54px" }}
                  width="250"
                  height="54"
                />
              </a>
              <a
                href="https://peerlist.io/farseen/project/neustream--multiplatform-streaming"
                target="_blank"
                rel="noreferrer"
                className="transform transition-transform hover:scale-105"
              >
                <img
                  src="https://peerlist.io/api/v1/projects/embed/PRJHKKDDN7MNQBRKD1ORNA9KDB6B8G?showUpvote=true&theme=light"
                  alt="Neustream - Multi-Platform Streaming"
                  style={{ width: "auto", height: "54px" }}
                />
              </a>
            </div>
          </div>
        </div>
        <img
          src="/hero.png"
          alt="Integration"
          className="max-md:hidden w-full max-w-6xl mx-auto rounded-3xl mt-12 px-4 sm:px-0 shadow-2xl"
        />
      </section>

      {/* Performance & Privacy Section */}
      <section className="section-padding py-20 lg:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div className="space-y-8 order-2 lg:order-1">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight">
                    Best performance by default
                  </h2>
                  <p className="text-2xl leading-relaxed">
                    NeuStream offloads video encoding to the cloud, keeping your
                    machine fast and responsive. No CPU spikes, no dropped
                    frames, no{" "}
                    <TextHighlighter {...highlightConfig}>
                      performance compromises
                    </TextHighlighter>
                    .
                  </p>
                  <p className="text-2xl leading-relaxed">
                    Our distributed infrastructure ensures{" "}
                    <TextHighlighter {...highlightConfig}>
                      99.9% uptime
                    </TextHighlighter>{" "}
                    with advanced controls for bitrate and resolution when you
                    need them.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-8 order-1 lg:order-2">
              <MetricsDisplay />
              <StreamConfigSimulator />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 mt-25 lg:mt-40 gap-5 lg:gap-10 ">
            <div className="lg:col-span-1 space-y-16">
              <div className="grid  gap-12">
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Respectful by design
                  </h3>
                  <p className="text-xl leading-relaxed">
                    NeuStream never interrupts your workflow. No unexpected
                    tabs, popups, or restarts. Everything just works, keeping
                    you in{" "}
                    <TextHighlighter {...highlightConfig}>
                      full control
                    </TextHighlighter>
                    .
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Fast, efficient, and reliable
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Our cloud architecture delivers smooth streaming that never
                    slows down, even during long sessions. NeuStream is one of
                    the{" "}
                    <TextHighlighter {...highlightConfig}>
                      most efficient multistreaming solutions
                    </TextHighlighter>{" "}
                    with minimal resource usage.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 ">
              <LiveChatSimulator />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding py-20 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
              Everything you need for professional streaming
            </h2>
            <p className="text-2xl lg:text-3xl opacity-90 leading-relaxed">
              Stream like a pro across all platforms with our powerful features.
            </p>
            <Link
              to="/features"
              className="inline-flex items-center mt-6 text-xl hover:opacity-80 transition-opacity"
            >
              Explore all features <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            <div className="space-y-12">
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Works with all streaming software
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Compatible with{" "}
                    <TextHighlighter {...highlightConfig}>
                      OBS Studio, Streamlabs, XSplit
                    </TextHighlighter>
                    , and any RTMP software. Secure, encrypted connections
                    protect your stream keys with enterprise-grade security.
                  </p>
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Secure by default
                  </h3>
                  <p className="text-xl leading-relaxed">
                    NeuStream enforces{" "}
                    <TextHighlighter {...highlightConfig}>
                      secure connections
                    </TextHighlighter>{" "}
                    to all platforms with end-to-end protection. We collect only
                    what's needed for reliable streaming, keeping your{" "}
                    <TextHighlighter {...highlightConfig}>
                      privacy and content control
                    </TextHighlighter>{" "}
                    as top priorities.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                  Clean, simple interface
                </h3>
                <p className="text-xl leading-relaxed">
                  Our{" "}
                  <TextHighlighter {...highlightConfig}>
                    minimalistic design
                  </TextHighlighter>{" "}
                  maximizes your content space while keeping all functionality
                  accessible. Customize your dashboard to show only what
                  matters. Smooth, reliable streaming without interruptions.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative">
                <img
                  src="/obs.png"
                  alt="Streaming Software Integration"
                  className="w-full max-w-lg rounded-3xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Target Audience Section */}
      <section className="section-padding py-20 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
              Built for creators, by creators
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed">
              We built NeuStream to provide an{" "}
              <TextHighlighter {...highlightConfig}>
                honest, reliable, performance-focused streaming experience
              </TextHighlighter>{" "}
              that we'd want to use ourselves.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="text-center space-y-6 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-2xl sm:text-3xl font-normal mb-4">
                  Gamers
                </h3>
                <p className="text-xl leading-relaxed">
                  Stream without FPS drops or performance impact. Maintain your
                  competitive edge while{" "}
                  <TextHighlighter {...highlightConfig}>
                    multistreaming to all platforms
                  </TextHighlighter>
                  .
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-2xl sm:text-3xl font-normal mb-4">
                  Content creators
                </h3>
                <p className="text-xl leading-relaxed">
                  Reach wider audiences with one stream.{" "}
                  <TextHighlighter {...highlightConfig}>
                    Focus on creating content
                  </TextHighlighter>{" "}
                  while we handle the technical complexity.
                </p>
              </div>
            </div>

            <div className="text-center space-y-6 group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-2xl sm:text-3xl font-normal mb-4">
                  Mobile creators
                </h3>
                <p className="text-xl leading-relaxed">
                  Stream from anywhere with our{" "}
                  <TextHighlighter {...highlightConfig}>
                    reliable cloud infrastructure
                  </TextHighlighter>{" "}
                  backing you up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="section-padding py-20 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-5xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
              Choose Your <span className="underline font-medium">Plan</span>
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed mb-8">
              Start multistreaming with flexible pricing designed for creators
              at every level. No hidden fees, cancel anytime.
            </p>
          </div>

          {plansLoading ? (
            <div className="grid gap-8 lg:gap-12 md:grid-cols-3 max-w-6xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="feature-card animate-pulse bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10"
                >
                  <div className="text-center space-y-6">
                    <div className="h-10 bg-white/20 rounded w-3/4 mx-auto"></div>
                    <div className="h-6 bg-white/20 rounded w-1/2 mx-auto"></div>
                    <div className="h-8 bg-white/20 rounded w-1/3 mx-auto"></div>
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-6 bg-white/20 rounded w-full"
                        ></div>
                      ))}
                    </div>
                    <div className="h-14 bg-white/20 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : plansError ? (
            <div className="text-center py-12">
              <p className="">
                Unable to load pricing plans. Please try again later.
              </p>
            </div>
          ) : plans.length > 0 ? (
            <div className="grid gap-8 lg:gap-12 md:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan) => {
                const features = getPlanFeatures(plan);
                const planInfo = getPlanInfo(plan);
                const isProPlan = plan.name.toLowerCase() === "pro";
                const planName = plan.name.toLowerCase();

                return (
                  <div
                    key={plan.id}
                    className={`feature-card relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border transition-all duration-300 hover:bg-white/10 hover:scale-105 ${
                      isProPlan
                        ? "border-primary shadow-2xl shadow-primary/20 ring-2 ring-primary/20"
                        : planName === "business"
                          ? "border-white/20 ring-2 ring-white/10"
                          : "border-white/10"
                    }`}
                  >
                    {isProPlan && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary text-white px-6 py-2 rounded-full text-base font-medium shadow-lg">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-3">
                          <h3 className="text-3xl sm:text-4xl font-normal">
                            {plan.name}
                          </h3>
                          {planName === "free" && (
                            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-base font-medium">
                              Free Forever
                            </span>
                          )}
                          {planName === "business" && (
                            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-base font-medium">
                              Enterprise
                            </span>
                          )}
                        </div>
                        <p className="text-xl leading-relaxed opacity-90">
                          {planInfo.description}
                        </p>

                        {/* Best For Section */}
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                          <p className="text-base font-medium mb-2 opacity-70">
                            Best For:
                          </p>
                          <p className="text-base leading-relaxed">
                            {planInfo.bestFor}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 py-4 border-t border-white/10">
                        <div className="text-5xl font-normal">
                          {plan.formatted_price_monthly ||
                            formatPrice(plan.price_monthly)}
                          <span className="text-xl font-normal opacity-80">
                            /month
                          </span>
                        </div>
                        {plan.price_yearly && (
                          <div className="flex items-center justify-center gap-2">
                            <p className="text-base opacity-80">
                              {plan.formatted_price_yearly ||
                                formatPrice(plan.price_yearly)}{" "}
                              billed annually
                            </p>
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm font-medium">
                              Save 20%
                            </span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-3 text-lg text-left">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="mt-0.5 text-xl">
                              {feature.icon}
                            </span>
                            <span className="flex-1">{feature.text}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        variant={isProPlan ? "default" : "outline"}
                        className="w-full h-14 text-xl rounded-2xl font-medium transition-all duration-300 hover:scale-105"
                        asChild
                      >
                        <Link
                          to="/auth"
                          className={isProPlan ? "text-white" : "text-black"}
                        >
                          {planName === "free"
                            ? "Get Started Free"
                            : "Start Free Trial"}
                        </Link>
                      </Button>

                      {planName !== "free" && (
                        <p className="text-sm opacity-70 text-center">
                          14-day free trial • No credit card required
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="">No pricing plans available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-20">
            {/* Trust Badges */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-center mb-3">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="font-medium mb-2">30-Day Money Back</h4>
                <p className="text-sm opacity-80">
                  Full refund if you're not satisfied
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-center mb-3">
                  <Shield className="w-8 h-8" />
                </div>
                <h4 className="font-medium mb-2">Secure Payments</h4>
                <p className="text-sm opacity-80">
                  SSL encrypted payment processing
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-center mb-3">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-medium mb-2">Cancel Anytime</h4>
                <p className="text-sm opacity-80">
                  No contracts or hidden fees
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-white/20">
              <p className="text-sm opacity-70">
                By using our service, you agree to our{" "}
                <Link to="/privacy" className="underline hover:opacity-80">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/terms" className="underline hover:opacity-80">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding py-20 lg:py-24">
        <div className="container-custom">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
              Ready to try NeuStream?
            </h2>
            <p className="text-2xl lg:text-3xl mb-12 leading-relaxed">
              Reach more viewers across platforms while keeping your local
              performance intact.{" "}
              <TextHighlighter {...highlightConfig}>
                Start your streaming journey today
              </TextHighlighter>
              .
            </p>{" "}
            <Button
              asChild
              className="w-full sm:w-min mx-auto text-xl py-8 px-12 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl relative transition-all hover:scale-105"
            >
              <Link to="/auth">
                Start Streaming Free
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-base font-bold px-3 py-1.5 rounded-full animate-pulse">
                  LIVE
                </span>
              </Link>
            </Button>
            <div className="mt-16 pt-8 border-t border-white/20">
              <p className="text-base opacity-70">
                By signing up, you agree to our{" "}
                <Link to="/privacy" className="underline hover:opacity-80">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link to="/terms" className="underline hover:opacity-80">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Wrapper component that provides CurrencyProvider
function LandingWithCurrency() {
  return <Landing />;
}

export default LandingWithCurrency;
