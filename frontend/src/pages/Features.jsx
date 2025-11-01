import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Monitor, Zap, Shield, MessageCircle, Users, Globe, Cpu, BarChart3, Settings } from "lucide-react";
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

  const features = [
    {
      icon: Monitor,
      title: "Multi-Source Streaming",
      description: "Manage multiple stream sources under one account - gaming, podcast, events, all in one place",
      details: [
        "Create separate stream sources for different content types",
        "Each source gets its own stream key and destinations",
        "Switch between active sources in real-time",
        "Perfect for creators with multiple streaming setups"
      ],
      simulator: "streamConfig"
    },
    {
      icon: Globe,
      title: "Multi-Platform Broadcasting",
      description: "Stream to YouTube, Twitch, Facebook, and custom RTMP destinations simultaneously",
      details: [
        "Broadcast to multiple platforms with one stream",
        "Platform-specific RTMP URLs and stream keys",
        "Easy destination management per stream source",
        "Custom RTMP endpoints for specialized workflows"
      ],
      simulator: "streamConfig"
    },
    {
      icon: MessageCircle,
      title: "Unified Live Chat",
      description: "Aggregate chat from Twitch, YouTube, and Instagram into one interface",
      details: [
        "OAuth-based platform authentication for secure connections",
        "Real-time chat aggregation across all connected platforms",
        "Platform identification for each message",
        "Public chat pages for OBS integration"
      ],
      simulator: "liveChat"
    },
    {
      icon: Zap,
      title: "Real-time Stream Preview",
      description: "Monitor your live streams with high-quality video preview and multi-source switching",
      details: [
        "Live video preview for each active stream source",
        "Switch between multiple active sources seamlessly",
        "Real-time stream status and health monitoring",
        "Integrated chat display alongside video preview"
      ],
      simulator: null
    },
    {
      icon: Settings,
      title: "Advanced Stream Management",
      description: "Fine-tune your streaming setup with professional-grade controls",
      details: [
        "Per-source stream key management and regeneration",
        "Destination configuration with platform-specific settings",
        "Stream source naming and organization",
        "Real-time stream status and connection monitoring"
      ],
      simulator: "streamConfig"
    },
    {
      icon: Shield,
      title: "Secure Infrastructure",
      description: "Enterprise-grade security with MediaMTX media server and encrypted connections",
      details: [
        "RTMP ingest with MediaMTX media server",
        "Secure credential storage and management",
        "OAuth 2.0 authentication for platform connections",
        "JWT-based session management"
      ],
      simulator: null
    },
    {
      icon: Users,
      title: "Production-Ready Workflow",
      description: "Professional streaming workflow designed for content creators and production teams",
      details: [
        "Multi-source architecture for complex streaming setups",
        "Real-time monitoring and preview capabilities",
        "Chat aggregation for audience engagement",
        "Scalable infrastructure for growing audiences"
      ],
      simulator: null
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
                Multi-Source Streaming
                <TextHighlighter {...highlightConfig}>
                  Without Compromise
                </TextHighlighter>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl opacity-80 max-w-2xl mx-auto">
                Manage multiple stream sources, aggregate chat across platforms, and monitor everything in real-time
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

      {/* Features Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal">
                      {feature.title}
                    </h2>
                  </div>

                  <p className="text-lg opacity-80">
                    {feature.description}
                  </p>

                  <ul className="space-y-3">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-base">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {index === 0 && (
                    <div className="pt-4">
                      <Button
                        asChild
                        variant="outline"
                        className="bg-transparent border-white text-white hover:bg-white hover:text-black"
                      >
                        <Link to="/auth">
                          Try It Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Simulator */}
                <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                  {feature.simulator && renderSimulator(feature.simulator)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="section-padding bg-white/5">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal">
                Built for Professional Streaming Workflows
              </h2>
              <p className="text-lg opacity-80">
                NeuStream's multi-source architecture and real-time monitoring make it perfect
                for creators managing complex streaming setups across multiple platforms.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Multi-Source Support", icon: "🎮" },
                  { name: "Real-time Preview", icon: "📺" },
                  { name: "Chat Aggregation", icon: "💬" },
                  { name: "RTMP Compatible", icon: "🔌" },
                ].map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-xl">{feature.icon}</span>
                    <span className="font-medium">{feature.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-normal">
                Supported Platforms & Software
              </h3>
              <p className="opacity-80">
                Connect with any RTMP-compatible streaming software and broadcast
                to major platforms with our integrated chat connectors.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "YouTube", status: "✅ Streaming & Chat" },
                  { name: "Twitch", status: "✅ Streaming & Chat" },
                  { name: "Facebook", status: "✅ Streaming" },
                  { name: "Instagram", status: "✅ Chat" },
                  { name: "OBS Studio", status: "✅ Compatible" },
                  { name: "Streamlabs", status: "✅ Compatible" },
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-2 bg-white/5 rounded">
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-xs opacity-70">{platform.status}</span>
                  </div>
                ))}
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
              Ready to Stream Like a Pro?
            </h2>
            <p className="text-lg mb-8 opacity-80">
              Experience the power of multi-source streaming with unified chat and real-time monitoring.
              Perfect for creators who manage complex streaming workflows across multiple platforms.
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