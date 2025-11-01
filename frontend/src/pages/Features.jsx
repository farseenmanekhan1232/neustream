import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Monitor, Zap, Shield, MessageCircle, Users, Globe, Cpu, BarChart3, Settings, Star, TrendingUp, Target, Clock, Heart } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LiveChatSimulator from "../components/LiveChatSimulator";
import StreamConfigSimulator from "../components/StreamConfigSimulator";
import { TextHighlighter } from "../components/fancy/text/TextHighlighter";

function Features() {
  // TextHighlighter configuration
  const highlightConfig = {
    transition: { type: "spring", duration: 1, delay: 0.2, bounce: 0 },
    highlightColor: "#F2AD91",
    className: "rounded-[0.3em] px-px",
    useInViewOptions: { once: true, initial: false, amount: 0.3 },
    triggerType: "inView",
    direction: "ltr",
  };

  // Layer 1: Benefit-Focused Showcase
  const benefitFeatures = [
    {
      icon: TrendingUp,
      title: "Grow Your Audience Faster",
      description: "Reach viewers across all major platforms simultaneously without extra effort",
      benefits: [
        "Expand your reach 3x faster by streaming everywhere at once",
        "Build communities on multiple platforms simultaneously",
        "No technical expertise required - just stream once, reach everywhere"
      ],
      simulator: "streamConfig"
    },
    {
      icon: Zap,
      title: "Perfect Streams, Zero Performance Impact",
      description: "Keep your gaming performance intact while streaming in crystal-clear quality",
      benefits: [
        "No FPS drops or lag during intense gaming sessions",
        "Cloud encoding means your PC stays fast and responsive",
        "Professional stream quality without expensive hardware upgrades"
      ],
      simulator: null
    },
    {
      icon: Heart,
      title: "Engage with All Your Viewers in One Place",
      description: "Never miss a comment or question across multiple chat platforms",
      benefits: [
        "Respond to YouTube, Twitch, and Facebook chats simultaneously",
        "Build stronger connections with your entire audience",
        "Moderate all platforms from one simple interface"
      ],
      simulator: "liveChat"
    },
    {
      icon: Clock,
      title: "Save Hours of Setup Time",
      description: "Go live in minutes instead of hours with our streamlined workflow",
      benefits: [
        "One-click platform connections that save you setup time",
        "No complex OBS scene configurations for multi-streaming",
        "Focus on creating content, not managing technical details"
      ],
      simulator: null
    }
  ];

  // Layer 2: Deep Dive Reference
  const technicalFeatures = [
    {
      icon: Globe,
      title: "Multi-Platform Streaming",
      description: "Advanced platform management and optimization",
      details: [
        "Support for YouTube, Twitch, Facebook, TikTok, LinkedIn, and custom RTMP",
        "Platform-specific bitrate and resolution optimization",
        "Individual platform controls and status monitoring",
        "Automatic reconnection and failover handling"
      ]
    },
    {
      icon: Cpu,
      title: "Cloud Infrastructure",
      description: "Enterprise-grade streaming infrastructure",
      details: [
        "Distributed encoding across multiple cloud regions",
        "Real-time monitoring and automatic scaling",
        "99.9% uptime SLA with automatic failover",
        "Global CDN for optimal viewer experience"
      ]
    },
    {
      icon: Shield,
      title: "Security & Privacy",
      description: "Enterprise-grade security for your content and data",
      details: [
        "End-to-end encrypted stream transmission",
        "Secure credential storage with AES-256 encryption",
        "Two-factor authentication and session management",
        "GDPR and CCPA compliant data handling"
      ]
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive performance and audience analytics",
      details: [
        "Real-time viewer metrics across all platforms",
        "Engagement analysis and audience demographics",
        "Stream quality and performance monitoring",
        "Exportable reports and API access"
      ]
    }
  ];

  // Layer 3: Comparison & Differentiation
  const comparisonPoints = [
    {
      feature: "Multi-Platform Streaming",
      neuStream: "Unlimited platforms, no extra cost",
      competitors: "Limited platforms, extra fees"
    },
    {
      feature: "Performance Impact",
      neuStream: "Zero local performance impact",
      competitors: "High CPU usage, FPS drops"
    },
    {
      feature: "Setup Time",
      neuStream: "Minutes to go live",
      competitors: "Complex, hours of configuration"
    },
    {
      feature: "Chat Management",
      neuStream: "Unified chat from all platforms",
      competitors: "Separate windows, missed messages"
    },
    {
      feature: "Reliability",
      neuStream: "99.9% uptime guarantee",
      competitors: "Frequent outages and downtime"
    },
    {
      feature: "Pricing",
      neuStream: "Transparent, no hidden fees",
      competitors: "Complex pricing with add-ons"
    }
  ];

  const renderSimulator = (type) => {
    switch (type) {
      case "streamConfig":
        return <StreamConfigSimulator />;
      case "liveChat":
        return <LiveChatSimulator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>Features - NeuStream | Professional Multistreaming Platform</title>
        <meta
          name="description"
          content="Explore NeuStream's comprehensive features: multi-platform streaming, cloud-powered performance, unified chat, and enterprise-grade security."
        />
        <meta
          name="keywords"
          content="multistream features, streaming platform, live streaming, youtube, twitch, facebook, chat aggregation, cloud encoding"
        />
        <meta
          property="og:title"
          content="Features - NeuStream | Professional Multistreaming Platform"
        />
        <meta
          property="og:description"
          content="Explore NeuStream's comprehensive features for professional streaming."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Features - NeuStream | Professional Multistreaming Platform"
        />
        <meta
          name="twitter:description"
          content="Explore NeuStream's comprehensive features for professional streaming."
        />
        <meta name="twitter:image" content="/twitter-image.png" />
        <link rel="canonical" href="https://neustream.app/features" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 md:space-y-10">
            <div className="space-y-4 max-w-3xl">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                Everything You Need for
                <TextHighlighter {...highlightConfig}>
                  Professional Streaming
                </TextHighlighter>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl opacity-80 max-w-2xl mx-auto">
                Discover how NeuStream's comprehensive feature set transforms your streaming workflow
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
              <Button
                asChild
                className="w-full min-h-[44px] mx-auto text-base py-6 px-8 sm:py-8 sm:px-6 bg-white text-black rounded-2xl sm:rounded-3xl font-light hover:bg-white shadow-xl relative"
              >
                <Link to="/auth">
                  Start Streaming Free
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    <span className="animate-pulse">LIVE</span>
                  </span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Layer 1: Benefit-Focused Showcase */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Focus on Creating, We Handle the Rest
            </h2>
            <p className="text-lg opacity-80">
              NeuStream transforms complex multi-platform streaming into a seamless experience
              that lets you focus on what matters most - your content and your audience.
            </p>
          </div>

          <div className="grid gap-8 lg:gap-12">
            {benefitFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-xl">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal">
                        {feature.title}
                      </h2>
                    </div>

                    <p className="text-lg opacity-80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium opacity-90">You'll Experience:</h3>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            <Check className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-base leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {index === 0 && (
                    <div className="pt-4">
                      <Button
                        asChild
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                      >
                        <Link to="/auth">
                          Start Growing Your Audience
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Simulator */}
                <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  {feature.simulator && (
                    <div className="relative">
                      {renderSimulator(feature.simulator)}
                      <div className="absolute -top-3 -right-3 bg-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                        Live Demo
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA for benefits section */}
          <div className="text-center mt-16 pt-8 border-t border-white/20">
            <p className="text-lg opacity-80 mb-6">
              Ready to experience these benefits for yourself?
            </p>
            <Button
              asChild
              className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg rounded-2xl font-medium"
            >
              <Link to="/auth">
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Layer 2: Deep Dive Reference */}
      <section className="section-padding bg-white/5">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Technical Excellence Under the Hood
            </h2>
            <p className="text-lg opacity-80">
              Built on enterprise-grade infrastructure with cutting-edge technology
              to deliver the most reliable streaming experience available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {technicalFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/5 rounded-2xl p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-normal">{feature.title}</h3>
                </div>
                <p className="opacity-80">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Layer 3: Comparison & Differentiation */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Why Creators Choose NeuStream
            </h2>
            <p className="text-lg opacity-80">
              See how we stack up against traditional multi-streaming solutions
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/5 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
                <div className="font-medium">Feature</div>
                <div className="font-medium text-primary">NeuStream</div>
                <div className="font-medium opacity-70">Other Solutions</div>
              </div>

              {comparisonPoints.map((point, index) => (
                <div
                  key={point.feature}
                  className={`grid grid-cols-3 gap-4 p-6 ${
                    index % 2 === 0 ? "bg-white/5" : ""
                  }`}
                >
                  <div className="font-medium">{point.feature}</div>
                  <div className="text-primary">{point.neuStream}</div>
                  <div className="opacity-70">{point.competitors}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="section-padding bg-white/5">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal">
                Seamless Integration with Your Workflow
              </h2>
              <p className="text-lg opacity-80">
                NeuStream works with all major streaming software and platforms, ensuring
                a smooth transition from your current setup.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "OBS Studio", icon: "🎥" },
                  { name: "Streamlabs", icon: "⚡" },
                  { name: "XSplit", icon: "🎬" },
                  { name: "vMix", icon: "🎛️" },
                ].map((software) => (
                  <div key={software.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-xl">{software.icon}</span>
                    <span className="font-medium">{software.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-normal">
                RTMP Compatibility
              </h3>
              <p className="opacity-80">
                Any software that supports RTMP streaming can connect to NeuStream.
                We provide custom RTMP endpoints for maximum flexibility.
              </p>

              <div className="bg-black/20 rounded-lg p-4">
                <code className="text-sm font-mono text-primary">
                  rtmp://stream.neustream.app
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Ready to Experience Professional Streaming?
            </h2>
            <p className="text-lg mb-8 opacity-80">
              Join thousands of creators who trust NeuStream for their streaming needs.
              Start with our free plan and upgrade as you grow.
            </p>
            <Button
              asChild
              className="w-min mx-auto text-base py-8 px-6 bg-white text-black rounded-3xl font-light hover:bg-white shadow-xl relative"
            >
              <Link to="/auth">
                Start Streaming Free
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  <span className="animate-pulse">LIVE</span>
                </span>
              </Link>
            </Button>
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs opacity-70">
                By signing up, you agree to our{' '}
                <Link to="/privacy" className="underline hover:opacity-80">
                  Privacy Policy
                </Link>{' '}
                and{' '}
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

export default Features;