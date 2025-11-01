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
      icon: Globe,
      title: "Multi-Platform Streaming",
      description: "Stream to multiple platforms simultaneously with a single broadcast",
      details: [
        "Connect to YouTube, Twitch, Facebook, TikTok, and more",
        "No additional bandwidth requirements for multi-streaming",
        "Platform-specific optimizations for each destination",
        "Easy platform switching without restarting streams"
      ],
      simulator: "streamConfig"
    },
    {
      icon: Cpu,
      title: "Cloud-Powered Performance",
      description: "Offload video encoding to our cloud infrastructure for optimal performance",
      details: [
        "Zero impact on your local machine's performance",
        "No CPU spikes or dropped frames during streaming",
        "Automatic scaling for high-demand streams",
        "Consistent quality regardless of local hardware"
      ],
      simulator: null
    },
    {
      icon: MessageCircle,
      title: "Unified Live Chat",
      description: "Consolidate chat from all platforms into one easy-to-manage interface",
      details: [
        "Real-time chat aggregation from all connected platforms",
        "Platform identification for each message",
        "Moderation tools across all platforms",
        "Customizable chat display for OBS integration"
      ],
      simulator: "liveChat"
    },
    {
      icon: Shield,
      title: "Enterprise-Grade Security",
      description: "Protect your stream and credentials with advanced security measures",
      details: [
        "End-to-end encrypted stream connections",
        "Secure credential storage with industry standards",
        "Two-factor authentication support",
        "Regular security audits and updates"
      ],
      simulator: null
    },
    {
      icon: Zap,
      title: "Reliable Infrastructure",
      description: "99.9% uptime guarantee with distributed cloud infrastructure",
      details: [
        "Automatic failover between multiple servers",
        "Global CDN for optimal stream delivery",
        "Real-time monitoring and alerting",
        "24/7 technical support"
      ],
      simulator: null
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive insights into your stream performance and audience engagement",
      details: [
        "Real-time viewer count and engagement metrics",
        "Platform-specific performance analytics",
        "Historical data and trend analysis",
        "Exportable reports for content planning"
      ],
      simulator: null
    },
    {
      icon: Settings,
      title: "Advanced Configuration",
      description: "Fine-tune every aspect of your streaming setup with professional controls",
      details: [
        "Custom bitrate and resolution settings",
        "Platform-specific encoding presets",
        "Stream delay and synchronization controls",
        "Custom RTMP endpoints and advanced routing"
      ],
      simulator: "streamConfig"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work with co-hosts, moderators, and production teams seamlessly",
      details: [
        "Multi-user stream management",
        "Role-based access controls",
        "Shared stream configurations",
        "Collaborative chat moderation"
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
                  {feature.simulator ? (
                    renderSimulator(feature.simulator)
                  ) : (
                    <div className="bg-white/5 rounded-2xl p-8 h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <feature.icon className="h-12 w-12 text-primary mx-auto" />
                        <p className="text-lg opacity-70">
                          Experience this feature in action
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                  rtmp://your-server.neustream.app/live/your-stream-key
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