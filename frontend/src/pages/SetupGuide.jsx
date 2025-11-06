import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

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
    { id: "api-reference", title: "API Reference" },
    { id: "troubleshooting", title: "Troubleshooting" },
    { id: "faq", title: "FAQ" },
  ];

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                NeuStream Documentation
              </h1>
              <p className="text-lg text-gray-600">
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search documentation..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-gray-300"
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
                          ? "bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-500"
                          : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Overview */}
              {activeSection === "overview" && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Overview
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                      NeuStream is a professional multistreaming platform that
                      enables content creators to broadcast simultaneously to
                      multiple streaming platforms while maintaining optimal
                      performance and quality.
                    </p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                        What is NeuStream?
                      </h2>
                      <p className="text-gray-700 leading-relaxed mb-6">
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
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Key Features
                      </h2>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Multi-Platform Streaming
                            </h3>
                            <p className="text-gray-600">
                              Broadcast to multiple platforms simultaneously
                              with a single stream source
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Cloud-Based Encoding
                            </h3>
                            <p className="text-gray-600">
                              High-performance encoding without consuming local
                              computer resources
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Unified Chat Management
                            </h3>
                            <p className="text-gray-600">
                              Aggregate and manage chat messages from all
                              platforms in one interface
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Real-Time Analytics
                            </h3>
                            <p className="text-gray-600">
                              Monitor stream health, viewer counts, and
                              performance across all platforms
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        System Requirements
                      </h2>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Internet Connection
                          </h3>
                          <p className="text-blue-800">
                            Minimum 5 Mbps upload speed (10+ Mbps recommended
                            for HD streaming)
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Streaming Software
                          </h3>
                          <p className="text-blue-800">
                            OBS Studio, Streamlabs, XSplit, or any
                            RTMP-compatible broadcasting software
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold text-blue-900 mb-2">
                            Hardware
                          </h3>
                          <p className="text-blue-800">
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                      Getting Started
                    </h1>
                    <p className="text-xl text-gray-600 leading-relaxed mb-8">
                      Get up and running with NeuStream in minutes. This
                      comprehensive guide will walk you through creating your
                      first multistream setup step by step.
                    </p>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Step 1: Create Your Account
                      </h2>
                      <p className="text-gray-700 mb-6 leading-relaxed">
                        Sign up for a NeuStream account and choose a plan that
                        fits your streaming needs.
                      </p>
                      <div className="grid gap-6 md:grid-cols-3">
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Free Plan
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Perfect for getting started
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Stream to 2 platforms</li>
                            <li>• Basic analytics</li>
                            <li>• Community support</li>
                            <li>• 720p streaming quality</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-300">
                          <h3 className="font-semibold text-blue-900 mb-3">
                            Pro Plan
                          </h3>
                          <p className="text-blue-700 mb-4">
                            Most popular choice
                          </p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Unlimited platforms</li>
                            <li>• Advanced analytics</li>
                            <li>• Priority support</li>
                            <li>• 1080p HD streaming</li>
                            <li>• Chat management tools</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Enterprise
                          </h3>
                          <p className="text-gray-600 mb-4">
                            For large organizations
                          </p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Custom solutions</li>
                            <li>• Dedicated support</li>
                            <li>• SLA guarantees</li>
                            <li>• White-label options</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Step 2: Create a Streaming Source
                      </h2>
                      <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            1
                          </div>
                          <div className="pt-2">
                            <p className="text-gray-700 font-medium mb-1">
                              Navigate to Dashboard
                            </p>
                            <p className="text-gray-600">
                              Go to your dashboard and click "Create Source"
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            2
                          </div>
                          <div className="pt-2">
                            <p className="text-gray-700 font-medium mb-1">
                              Configure Settings
                            </p>
                            <p className="text-gray-600">
                              Set up your stream resolution, bitrate, and
                              preferences
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                            3
                          </div>
                          <div className="pt-2">
                            <p className="text-gray-700 font-medium mb-1">
                              Get Stream Details
                            </p>
                            <p className="text-gray-600">
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
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {sections.find((s) => s.id === activeSection)?.title}
                      </h1>
                      <p className="text-xl text-gray-600 leading-relaxed mb-8">
                        Comprehensive documentation for{" "}
                        {sections
                          .find((s) => s.id === activeSection)
                          ?.title.toLowerCase()}
                        .
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <h3 className="font-semibold text-blue-900 mb-3">
                        📚 Documentation Section
                      </h3>
                      <p className="text-blue-800">
                        This section provides detailed information about{" "}
                        {sections
                          .find((s) => s.id === activeSection)
                          ?.title.toLowerCase()}
                        . Our comprehensive guides cover everything you need to
                        know to effectively use NeuStream's features.
                      </p>
                    </div>

                    {activeSection === "streaming-setup" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                          Quality Settings
                        </h2>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h3 className="font-semibold text-green-900 mb-2">
                              1080p HD
                            </h3>
                            <p className="text-green-800 text-sm">
                              Best quality for professional streaming
                            </p>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">
                              720p Standard
                            </h3>
                            <p className="text-blue-800 text-sm">
                              Good balance of quality and bandwidth
                            </p>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="font-semibold text-orange-900 mb-2">
                              480p Mobile
                            </h3>
                            <p className="text-orange-800 text-sm">
                              Optimized for mobile and low bandwidth
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "chat-management" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                          Chat Connector System
                        </h2>
                        <p className="text-gray-700 mb-4">
                          NeuStream's chat connector system aggregates messages
                          from all your streaming platforms into a unified
                          interface, making it easy to engage with your entire
                          audience.
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Supported Platforms
                          </h3>
                          <ul className="text-gray-700 space-y-2">
                            <li>• Twitch - Real-time chat via IRC/WebSocket</li>
                            <li>• YouTube - Live chat via YouTube API</li>
                            <li>• Facebook - Live comments integration</li>
                            <li>• Custom platforms via webhook</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {activeSection === "api-reference" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                          REST API Endpoints
                        </h2>
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Stream Management
                            </h3>
                            <code className="text-sm text-gray-700">
                              GET /api/streams - List all streams
                            </code>
                            <br />
                            <code className="text-sm text-gray-700">
                              POST /api/streams - Create new stream
                            </code>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Destinations
                            </h3>
                            <code className="text-sm text-gray-700">
                              GET /api/destinations - List destinations
                            </code>
                            <br />
                            <code className="text-sm text-gray-700">
                              POST /api/destinations - Add destination
                            </code>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSection === "troubleshooting" && (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                          Common Issues
                        </h2>
                        <div className="space-y-4">
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Stream Won't Start
                            </h3>
                            <ul className="text-gray-700 space-y-1 text-sm">
                              <li>• Check your stream key and server URL</li>
                              <li>• Verify internet connection stability</li>
                              <li>• Restart your streaming software</li>
                            </ul>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2">
                              Poor Video Quality
                            </h3>
                            <ul className="text-gray-700 space-y-1 text-sm">
                              <li>• Increase bitrate settings</li>
                              <li>• Check encoder configuration</li>
                              <li>• Verify upload bandwidth</li>
                            </ul>
                          </div>
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

export default Documentation;
