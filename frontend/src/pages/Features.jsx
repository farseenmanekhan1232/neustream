import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Monitor, MessageCircle, Zap, Shield, Settings, Users, Globe, CheckCircle } from "lucide-react";
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

  const featuredSimulators = [
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
    }
  ];

  const additionalFeatures = [
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Protect your streams and credentials with military-grade encryption and security protocols.",
      details: [
        "End-to-end encrypted stream transmission",
        "Secure credential storage with zero-knowledge architecture",
        "Two-factor authentication for account protection",
        "Regular security audits and compliance certifications"
      ]
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
      ]
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
      ]
    },
    {
      icon: Settings,
      title: "Advanced Configuration",
      description: "Fine-tune every aspect of your streaming setup with comprehensive configuration options.",
      details: [
        "Custom bitrate and resolution settings per platform",
        "Advanced audio and video codec configuration",
        "Stream delay and synchronization controls",
        "API access for custom integrations"
      ]
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

      {/* Featured Simulators Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="space-y-16">
            {featuredSimulators.map((feature, index) => (
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

                {/* Simulator */}
                <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  {feature.simulator}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Grid */}
      <section className="section-padding bg-white/5">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Complete Streaming Toolkit
            </h2>
            <p className="text-lg opacity-80">
              Everything you need to stream professionally, from security to analytics and beyond.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, index) => (
              <div key={feature.title} className="bg-white/5 rounded-2xl p-8 space-y-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-normal">
                    {feature.title}
                  </h3>
                </div>

                <p className="opacity-80">
                  {feature.description}
                </p>

                <ul className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start space-x-3 text-sm opacity-80">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Integration Section */}
      <section className="section-padding">
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "YouTube",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                ),
                color: "text-red-500"
              },
              {
                name: "Twitch",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                  </svg>
                ),
                color: "text-purple-500"
              },
              {
                name: "Facebook",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ),
                color: "text-blue-500"
              },
              {
                name: "TikTok",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                ),
                color: "text-black"
              },
              {
                name: "Instagram",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                ),
                color: "text-pink-500"
              },
              {
                name: "LinkedIn",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                ),
                color: "text-blue-600"
              },
              {
                name: "OBS Studio",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                  </svg>
                ),
                color: "text-orange-500"
              },
              {
                name: "Streamlabs",
                icon: (
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                ),
                color: "text-green-500"
              }
            ].map((platform) => (
              <div key={platform.name} className="text-center space-y-4 group">
                <div className={`${platform.color} rounded-2xl p-6 aspect-square flex items-center justify-center bg-white/5 group-hover:bg-white/10 transition-all duration-300`}>
                  {platform.icon}
                </div>
                <p className="text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                  {platform.name}
                </p>
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