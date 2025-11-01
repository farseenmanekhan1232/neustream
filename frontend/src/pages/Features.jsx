import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, MessageCircle, Zap, Shield, Settings, Users, Globe } from "lucide-react";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { TextHighlighter } from "../components/fancy/text/TextHighlighter";
import MetricsDisplay from "../components/MetricsDisplay";
import LiveChatSimulator from "../components/LiveChatSimulator";
import StreamConfigSimulator from "../components/StreamConfigSimulator";

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
      description: "Stream to YouTube, Twitch, Facebook, TikTok, and LinkedIn simultaneously from a single source.",
      details: [
        "Broadcast to unlimited platforms with one stream",
        "Customize destinations per stream session",
        "Platform-specific optimization settings",
        "Real-time connection status monitoring"
      ],
      simulator: <StreamConfigSimulator />
    },
    {
      icon: MessageCircle,
      title: "Unified Chat Management",
      description: "Aggregate and manage chat from all streaming platforms in one intuitive interface.",
      details: [
        "Real-time chat aggregation from all connected platforms",
        "Platform-specific message filtering and moderation",
        "Customizable chat display and layout options",
        "Viewer engagement analytics and insights"
      ],
      simulator: <LiveChatSimulator />
    },
    {
      icon: Zap,
      title: "Performance Optimization",
      description: "Eliminate hardware bottlenecks with cloud-based encoding and intelligent resource management.",
      details: [
        "Cloud-based video encoding reduces local CPU usage",
        "Intelligent bitrate optimization for each platform",
        "Automatic quality adjustment based on network conditions",
        "Zero dropped frames with optimized streaming pipeline"
      ],
      simulator: <MetricsDisplay />
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Protect your streams and credentials with military-grade encryption and security protocols.",
      details: [
        "End-to-end encrypted stream transmission",
        "Secure credential storage with zero-knowledge architecture",
        "Two-factor authentication for account protection",
        "Regular security audits and compliance certifications"
      ],
      simulator: null
    },
    {
      icon: Monitor,
      title: "Universal Compatibility",
      description: "Works seamlessly with all major streaming software and hardware configurations.",
      details: [
        "Native support for OBS Studio, Streamlabs, XSplit",
        "RTMP-compatible with any streaming software",
        "Mobile streaming support for on-the-go creators",
        "Hardware encoder integration (NVENC, QuickSync)"
      ],
      simulator: null
    },
    {
      icon: Users,
      title: "Advanced Analytics",
      description: "Gain deep insights into your stream performance and audience engagement across all platforms.",
      details: [
        "Cross-platform viewer analytics and demographics",
        "Real-time performance metrics and health monitoring",
        "Engagement tracking and chat sentiment analysis",
        "Customizable reports and export capabilities"
      ],
      simulator: null
    }
  ];

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>Features - NeuStream | Advanced Multistreaming Platform</title>
        <meta
          name="description"
          content="Explore NeuStream's powerful features: multi-platform streaming, unified chat management, performance optimization, and enterprise security."
        />
        <meta
          name="keywords"
          content="multistream features, live streaming platform, chat aggregation, performance optimization, streaming security, analytics"
        />
        <meta
          property="og:title"
          content="Features - NeuStream | Advanced Multistreaming Platform"
        />
        <meta
          property="og:description"
          content="Explore NeuStream's powerful features: multi-platform streaming, unified chat management, performance optimization, and enterprise security."
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Features - NeuStream | Advanced Multistreaming Platform"
        />
        <meta
          name="twitter:description"
          content="Explore NeuStream's powerful features: multi-platform streaming, unified chat management, performance optimization, and enterprise security."
        />
        <meta name="twitter:image" content="/twitter-image.png" />
        <link rel="canonical" href="https://neustream.app/features" />
      </Helmet>
      <Header />

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-6 sm:space-y-8 md:space-y-10">
            <div className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Neustream Logo"
                className="h-20 w-20 -mb-8 animate-oscillate"
              />
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                Every Feature You Need to
                <TextHighlighter {...highlightConfig}>
                  Stream Like a Pro
                </TextHighlighter>
              </div>
              <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto">
                Discover how NeuStream's comprehensive feature set helps you reach more viewers,
                engage your audience, and grow your streaming presence across all platforms.
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
          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-row-dense' : ''
                }`}
              >
                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <feature.icon className="h-6 w-6 text-white" />
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
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="opacity-80">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {index === 0 && (
                    <div className="pt-4">
                      <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
                        <Link to="/auth">
                          Try Multi-Streaming
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>

                {/* Simulator/Visual */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  {feature.simulator ? (
                    feature.simulator
                  ) : (
                    <div className="bg-white/10 rounded-xl p-8 h-full flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <feature.icon className="h-12 w-12 text-white mx-auto opacity-60" />
                        <p className="opacity-70">Interactive demo coming soon</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="section-padding bg-white/5">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Seamless Platform Integration
            </h2>
            <p className="text-lg opacity-80">
              NeuStream works with all major streaming platforms and software,
              ensuring you can reach your audience wherever they are.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "YouTube", color: "bg-red-500" },
              { name: "Twitch", color: "bg-purple-500" },
              { name: "Facebook", color: "bg-blue-500" },
              { name: "TikTok", color: "bg-black" },
              { name: "Instagram", color: "bg-pink-500" },
              { name: "LinkedIn", color: "bg-blue-600" },
              { name: "OBS Studio", color: "bg-orange-500" },
              { name: "Streamlabs", color: "bg-green-500" },
            ].map((platform) => (
              <div key={platform.name} className="text-center space-y-3">
                <div className={`${platform.color} rounded-xl p-4 aspect-square flex items-center justify-center`}>
                  <span className="text-white font-medium text-sm">
                    {platform.name}
                  </span>
                </div>
                <p className="text-sm opacity-70">{platform.name}</p>
              </div>
            ))}
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
            <p className="text-lg opacity-80 mb-8">
              Join thousands of creators who trust NeuStream to power their multi-platform
              streaming strategy. Start reaching more viewers and growing your audience today.
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