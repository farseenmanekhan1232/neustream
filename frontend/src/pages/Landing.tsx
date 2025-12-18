import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Check,
  Radio,
  BarChart3,
  MessageCircle,
  Clock,
  Users,
  Zap,
  Palette,
  Shield,
  Lock,
  RefreshCw,
} from "lucide-react";
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
import CamcorderViewfinder from "../components/fancy/CamcorderViewfinder";

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
        description:
          plan.description ||
          "Perfect starting point for content creators exploring multistreaming",
        bestFor:
          "Beginners testing multistreaming, hobby streamers, and those trying out the platform",
        features: [
          {
            icon: <Radio className="w-5 h-5" />,
            text: "Stream to platforms simultaneously",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            text: "Basic analytics dashboard",
          },
          {
            icon: <MessageCircle className="w-5 h-5" />,
            text: "1 chat connector",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: "35 hours streaming monthly",
          },
          { icon: <Users className="w-5 h-5" />, text: "Community support" },
        ],
      },
      pro: {
        description:
          plan.description ||
          "Most popular choice for serious content creators and growing streamers",
        bestFor:
          "Regular streamers, content creators expanding their reach, and small stream teams",
        features: [
          {
            icon: <Radio className="w-5 h-5" />,
            text: "Stream to platforms simultaneously",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            text: "Advanced analytics & insights",
          },
          {
            icon: <MessageCircle className="w-5 h-5" />,
            text: "3 chat connectors",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: "1000 hours streaming monthly",
          },
          {
            icon: <Users className="w-5 h-5" />,
            text: "Up to 2 streaming sources",
          },
          { icon: <Zap className="w-5 h-5" />, text: "Priority support" },
          {
            icon: <Palette className="w-5 h-5" />,
            text: "Custom branding options",
          },
        ],
      },
      business: {
        description:
          plan.description ||
          "Comprehensive solution for professional streaming operations and teams",
        bestFor:
          "Professional streamers, production companies, esports teams, and large content creators",
        features: [
          {
            icon: <Radio className="w-5 h-5" />,
            text: "Stream to platforms simultaneously",
          },
          {
            icon: <BarChart3 className="w-5 h-5" />,
            text: "Enterprise analytics & insights",
          },
          {
            icon: <MessageCircle className="w-5 h-5" />,
            text: "10 chat connectors",
          },
          {
            icon: <Clock className="w-5 h-5" />,
            text: "5000 hours streaming monthly",
          },
          {
            icon: <Users className="w-5 h-5" />,
            text: "Up to 5 streaming sources",
          },
          {
            icon: <Shield className="w-5 h-5" />,
            text: "24/7 dedicated support",
          },
          {
            icon: <Palette className="w-5 h-5" />,
            text: "Full custom branding",
          },
          {
            icon: <Users className="w-5 h-5" />,
            text: "Team collaboration features",
          },
          {
            icon: <Shield className="w-5 h-5" />,
            text: "Enhanced security & privacy",
          },
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
      const chatFeature = plan.features.find((f) =>
        f.includes("Chat Connectors:"),
      );
      if (chatFeature) {
        const match = chatFeature.match(/Chat Connectors:\s*(\d+)/);
        if (match) {
          chatConnectorsCount = parseInt(match[1]);
        }
      }
    }

    const chatConnectorFeature = features.find((f) =>
      f.text.includes("chat connector"),
    );
    if (chatConnectorFeature) {
      chatConnectorFeature.text = `${chatConnectorsCount} chat connector${chatConnectorsCount > 1 ? "s" : ""} (Twitch, YouTube, etc.)`;
    }

    return features;
  };

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>Neustream - Open Source Multistreaming Platform</title>
        <meta
          name="description"
          content="Free and open-source multistreaming platform. Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously. Self-hostable alternative to Restream."
        />
        <meta
          name="keywords"
          content="open source multistream, live streaming, youtube, twitch, facebook, linkedin, streaming software, self-hosted streaming"
        />
        <meta
          property="og:title"
          content="Neustream - Open Source Multistreaming Platform"
        />
        <meta
          property="og:description"
          content="Free and open-source multistreaming platform. Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously. Self-hostable alternative to Restream."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Neustream - Open Source Multistreaming Platform"
        />
        <meta
          name="twitter:description"
          content="Free and open-source multistreaming platform. Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously. Self-hostable alternative to Restream."
        />
        <meta name="twitter:image" content="/twitter-image.png" />
        <link rel="canonical" href="https://neustream.app" />
        
        {/* Organization Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "neustream",
            "url": "https://neustream.app",
            "logo": "https://neustream.app/logo.png",
            "description": "Professional multistreaming platform for content creators. Stream to YouTube, Twitch, Facebook, and LinkedIn simultaneously with cloud encoding and unified chat management.",
            "foundingDate": "2024",
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "url": "https://neustream.app/contact",
              "availableLanguage": ["en"]
            },
            "sameAs": [
              // Add social media URLs when available
            ]
          })}
        </script>
        
        {/* SoftwareApplication Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "neustream",
            "applicationCategory": "MultimediaApplication",
            "operatingSystem": "Web Browser, Windows, macOS, Linux",
            "offers": {
              "@type": "AggregateOffer",
              "priceCurrency": "USD",
              "lowPrice": "0",
              "highPrice": "99",
              "offerCount": "3",
              "priceSpecification": [
                {
                  "@type": "UnitPriceSpecification",
                  "price": "0",
                  "priceCurrency": "USD",
                  "name": "Free Plan"
                }
              ]
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "150"
            },
            "featureList": [
              "Multi-platform streaming to YouTube, Twitch, Facebook, LinkedIn",
              "Cloud-based video encoding",
              "Unified chat management across all platforms",
              "Real-time analytics and viewer insights",
              "Stream to unlimited platforms simultaneously",
              "Zero performance impact on local machine",
              "Compatible with OBS, Streamlabs, XSplit",
              "Enterprise-grade security and encryption"
            ],
            "screenshot": "https://neustream.app/hero.png",
            "softwareVersion": "1.0",
            "datePublished": "2024-01-01",
            "provider": {
              "@type": "Organization",
              "name": "neustream"
            }
          })}
        </script>
      </Helmet>

      {/* Marketing Content Wrapper - Contains header + all marketing sections */}
      <div className="relative -mt-[100vh]">
        {/* Camcorder Viewfinder - Sticky full-screen overlay */}
        <div className="sticky top-0 z-[100] h-dvh min-lg:opacity-60 pointer-events-none">
          <CamcorderViewfinder />
        </div>

        {/* Header - Inside the wrapper and covered by viewfinder */}
        {/* <Header />*/}

        {/* Hero Section */}
        <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 md:space-y-12 max-lg:py-[10vh]">
              <div className="inline-flex items-center">
                <img
                  src="/logo.png"
                  alt="Neustream Logo"
                  className="h-24 w-24 -mb-8 animate-oscillate"
                />
              </div>

              <div className="space-y-6 max-w-4xl">
                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                  Stream to All Platforms.
                  <br />
                  <TextHighlighter {...highlightConfig}>
                    No Performance Hit.
                  </TextHighlighter>
                </div>
                <p className="text-lg md:text-2xl font-light opacity-90 max-w-3xl mx-auto max-lg:tracking-tight max-lg:leading-5">
                  The <strong className="italic">Open Source</strong> alternative to Restream. Multistream to <strong className="italic">YouTube</strong>,{" "}
                  <strong className="italic">Twitch</strong>,{" "}
                  <strong className="italic">Facebook</strong>, and more. Cloud encoding keeps your machine fast.
                </p>
              </div>

              <div className="flex flex-col gap-6 w-full max-w-md">
                <Button
                  asChild
                  className="w-full min-h-[52px] text-lg py-7 px-10 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl transition-all hover:scale-105 relative"
                >
                  <Link to="/auth">
                    Start Streaming Free
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full ">
                      <span className="animate-pulse">LIVE</span>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <img
            src="/hero.png"
            alt="Integration"
            className="max-md:hidden w-full max-w-7xl mx-auto rounded-3xl lg:mt-12 px-4 sm:px-0 shadow-2xl"
          />
        </section>

        {/* Core Value Props Section */}
        <section className="pb-20 pt-5 lg:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-12">
                Built for Speed and Privacy
              </h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div className="space-y-8">
                <MetricsDisplay />
                <StreamConfigSimulator />
              </div>

              <div className="space-y-8 flex flex-col justify-center">
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-normal">
                    Cloud Encoding
                  </h3>
                  <p className="text-xl leading-relaxed">
                    No CPU spikes. No dropped frames. 99.9% uptime.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-normal">
                    No Interruptions
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Zero popups. Zero restarts. Just streaming.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-normal">
                    Secure by Default
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Enterprise-grade security. End-to-end protection.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-20">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
                Works with Your Setup
              </h2>
              <p className="text-2xl lg:text-3xl opacity-90 leading-relaxed">
                Compatible with OBS, Streamlabs, XSplit, and any RTMP software.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Minimalistic Design
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Clean interface that keeps you focused on what matters—your
                    content.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-3xl sm:text-4xl font-normal leading-tight">
                    Encrypted & Secure
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Enterprise-grade security protects your stream keys and
                    connections.
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
        {/* How It Works Section */}
        <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto mb-20">
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
                How It Works
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
              <div className="text-center space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold">1</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-normal mb-3">
                    Connect Your Software
                  </h3>
                  <p className="text-lg">
                    Link OBS, Streamlabs, or any RTMP software
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold">2</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-normal mb-3">
                    Add Platforms
                  </h3>
                  <p className="text-lg">
                    Select YouTube, Twitch, Facebook, and more
                  </p>
                </div>
              </div>

              <div className="text-center space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold">3</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-normal mb-3">
                    Go Live
                  </h3>
                  <p className="text-lg">
                    Stream to all platforms simultaneously
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Subscription Plans Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                  className="animate-pulse bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10"
                >
                  <div className="text-center space-y-4">
                    {/* Plan name */}
                    <div className="h-10 bg-white/20 rounded-xl w-3/4 mx-auto"></div>
                    {/* Description */}
                    <div className="space-y-2">
                      <div className="h-4 bg-white/20 rounded w-full"></div>
                      <div className="h-3 bg-white/20 rounded w-5/6 mx-auto italic opacity-70"></div>
                    </div>
                    {/* Price */}
                    <div className="py-3 border-t border-white/10">
                      <div className="h-10 bg-white/20 rounded w-2/3 mx-auto"></div>
                      <div className="h-3 bg-white/20 rounded w-1/2 mx-auto mt-2"></div>
                    </div>
                    {/* Features */}
                    <div className="space-y-2">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="flex items-start gap-2">
                          <div className="h-4 w-4 bg-white/20 rounded-full mt-0.5"></div>
                          <div className="h-3 bg-white/20 rounded flex-1"></div>
                        </div>
                      ))}
                    </div>
                    {/* Button */}
                    <div className="h-12 bg-white/20 rounded-xl w-full mt-2"></div>
                    {/* Trial text */}
                    <div className="h-3 bg-white/20 rounded w-2/3 mx-auto opacity-60"></div>
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
                    className={`relative bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg active:scale-100 ${
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
                    <div className="text-center space-y-4">
                      {/* Plan Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          <h3 className="text-3xl sm:text-4xl font-normal">
                            {plan.name}
                          </h3>
                          {planName === "free" && (
                            <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                              Free Forever
                            </span>
                          )}
                          {planName === "business" && (
                            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                              Enterprise
                            </span>
                          )}
                        </div>
                        <p className="text-lg leading-relaxed opacity-90">
                          {planInfo.description}
                        </p>
                        <p className="text-sm opacity-70 italic">
                          {planInfo.bestFor}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="py-3 border-t border-white/10">
                        <div className="text-4xl font-normal">
                          {plan.formatted_price_monthly ||
                            formatPrice(plan.price_monthly)}
                          <span className="text-lg opacity-80">/mo</span>
                        </div>
                        {plan.price_yearly && (
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-sm opacity-80">
                              ${Math.round(plan.price_yearly / 12)}/mo billed
                              annually
                            </span>
                            <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs font-medium">
                              Save 20%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-2 text-left">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="mt-0.5 text-primary">
                              {feature.icon}
                            </span>
                            <span className="text-sm flex-1">
                              {feature.text}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Button
                        asChild
                        className={`w-full h-12 text-lg rounded-xl font-medium transition-all duration-300 mt-2 ${
                          isProPlan
                            ? "bg-white text-black hover:bg-white/90 shadow-lg"
                            : "bg-white/90 text-black hover:bg-white"
                        }`}
                      >
                        <Link to="/auth">
                          {planName === "free"
                            ? "Get Started Free"
                            : "Start Free Trial"}
                        </Link>
                      </Button>

                      {planName !== "free" && (
                        <p className="text-xs opacity-60">
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
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h4 className="font-medium mb-2">30-Day Money Back</h4>
                <p className="text-sm opacity-80">
                  Full refund if you're not satisfied
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex justify-center mb-3">
                  <Lock className="w-8 h-8" />
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
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal mb-8 leading-tight">
              Ready to try{" "}
              <span className="font-bold tracking-tighter">neustream.</span>?
            </h2>
            <p className="text-2xl lg:text-3xl mb-12 leading-relaxed">
              Start multistreaming today.{" "}
              <TextHighlighter {...highlightConfig}>
                No credit card required.
              </TextHighlighter>
            </p>{" "}
            <Button
              asChild
              className="w-full sm:w-min mx-auto text-xl py-8 px-12 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl relative transition-all hover:scale-105"
            >
              <Link to="/auth">
                Start Streaming Free
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-base font-bold px-3 py-1.5 rounded-full ">
                  <span className="animate-pulse">LIVE</span>
                </span>
              </Link>
            </Button>
            <div className="mt-12 pt-8 border-t border-white/20">
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
