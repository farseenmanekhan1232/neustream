import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { Search, ChevronRight, Menu, X, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "../services/subscription";

interface Section {
  id: string;
  title: string;
  category: string;
  path?: string;
}

const sections: Section[] = [
  { id: "overview", title: "Overview", category: "Getting Started" },
  { id: "quick-start", title: "Quick Start", category: "Getting Started" },
  { id: "create-account", title: "Create Account", category: "Getting Started" },
  { id: "streaming-basics", title: "Streaming Basics", category: "Configuration" },
  { id: "obs-setup", title: "OBS Setup", category: "Configuration" },
  { id: "encoder-settings", title: "Encoder Settings", category: "Configuration" },
  
  // Global Major Platforms
  { id: "platform-youtube", title: "YouTube Live", category: "Platform Guides: Global", path: "/help/platforms/youtube-live" },
  { id: "platform-twitch", title: "Twitch", category: "Platform Guides: Global", path: "/help/platforms/twitch" },
  { id: "platform-facebook", title: "Facebook Live", category: "Platform Guides: Global", path: "/help/platforms/facebook-live" },
  { id: "platform-linkedin", title: "LinkedIn Live", category: "Platform Guides: Global", path: "/help/platforms/linkedin-live" },
  { id: "platform-twitter", title: "Twitter/X Live", category: "Platform Guides: Global", path: "/help/platforms/twitter-live" },
  { id: "platform-instagram", title: "Instagram Live", category: "Platform Guides: Global", path: "/help/platforms/instagram-live" },
  { id: "platform-tiktok", title: "TikTok Live", category: "Platform Guides: Global", path: "/help/platforms/tiktok-live" },
  
  // Alternative & Gaming Platforms
  { id: "platform-kick", title: "Kick", category: "Platform Guides: Gaming", path: "/help/platforms/kick" },
  { id: "platform-rumble", title: "Rumble", category: "Platform Guides: Gaming", path: "/help/platforms/rumble" },
  { id: "platform-dlive", title: "DLive", category: "Platform Guides: Gaming", path: "/help/platforms/dlive" },
  { id: "platform-trovo", title: "Trovo", category: "Platform Guides: Gaming", path: "/help/platforms/trovo" },
  { id: "platform-caffeine", title: "Caffeine", category: "Platform Guides: Gaming", path: "/help/platforms/caffeine" },
  { id: "platform-nimo", title: "Nimo TV", category: "Platform Guides: Gaming", path: "/help/platforms/nimo-tv" },
  { id: "platform-steam", title: "Steam Broadcasting", category: "Platform Guides: Gaming", path: "/help/platforms/steam-broadcasting" },
  
  // Professional/Enterprise
  { id: "platform-vimeo", title: "Vimeo Live", category: "Platform Guides: Professional", path: "/help/platforms/vimeo-live" },
  { id: "platform-dailymotion", title: "Dailymotion", category: "Platform Guides: Professional", path: "/help/platforms/dailymotion" },
  { id: "platform-ibm", title: "IBM Video Streaming", category: "Platform Guides: Professional", path: "/help/platforms/ibm-video-streaming" },
  { id: "platform-wowza", title: "Wowza Streaming Cloud", category: "Platform Guides: Professional", path: "/help/platforms/wowza" },
  
  // Asian Platforms
  { id: "platform-bilibili", title: "Bilibili", category: "Platform Guides: Asia", path: "/help/platforms/bilibili" },
  { id: "platform-douyu", title: "Douyu", category: "Platform Guides: Asia", path: "/help/platforms/douyu" },
  { id: "platform-huya", title: "Huya", category: "Platform Guides: Asia", path: "/help/platforms/huya" },
  { id: "platform-afreecatv", title: "AfreecaTV", category: "Platform Guides: Asia", path: "/help/platforms/afreecatv" },
  { id: "platform-niconico", title: "NicoNico Douga", category: "Platform Guides: Asia", path: "/help/platforms/niconico" },
  { id: "platform-openrec", title: "Openrec.tv", category: "Platform Guides: Asia", path: "/help/platforms/openrec" },
  { id: "platform-bigo", title: "Bigo Live", category: "Platform Guides: Asia", path: "/help/platforms/bigo-live" },
  { id: "platform-nonolive", title: "Nonolive", category: "Platform Guides: Asia", path: "/help/platforms/nonolive" },
  
  // Regional & Alternative
  { id: "platform-vk", title: "VK Live", category: "Platform Guides: Regional", path: "/help/platforms/vk-live" },
  { id: "platform-ok", title: "OK.ru", category: "Platform Guides: Regional", path: "/help/platforms/ok-ru" },
  { id: "platform-vaughn", title: "Vaughn Live", category: "Platform Guides: Regional", path: "/help/platforms/vaughn-live" },
  { id: "platform-picarto", title: "Picarto", category: "Platform Guides: Regional", path: "/help/platforms/picarto" },
  { id: "platform-mobcrush", title: "Mobcrush", category: "Platform Guides: Regional", path: "/help/platforms/mobcrush" },
  
  { id: "troubleshooting", title: "Troubleshooting", category: "Support" },
  { id: "faq", title: "FAQ", category: "Support" },
  { id: "api-reference", title: "API Reference", category: "Advanced" },
  { id: "self-hosting", title: "Self Hosting", category: "Advanced" },
];

const categories = Array.from(new Set(sections.map((s) => s.category)));

export default function Help() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Fetch subscription plans from API
  const { data: plansData }:any = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      return await subscriptionService.getPlans();
    },
  });

  const plans = plansData?.data?.plans || plansData?.plans || plansData || [];

  // Sync activeSection with URL
  useEffect(() => {
    if (location.pathname === "/help") {
      if (activeSection.startsWith("platform-")) {
        setActiveSection("overview");
      }
    } else {
      const matchingSection = sections.find((s) => s.path === location.pathname);
      if (matchingSection) {
        setActiveSection(matchingSection.id);
      }
    }
  }, [location.pathname]);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4 md:px-6 lg:px-8">
          <div className="mr-4 flex">
            <Link to="/" className="mr-6 flex items-center space-x-2">
              <img src="/logo2.png" alt="neustream" className="h-6 w-6" />
              <span className="font-semibold tracking-tighter text-lg">neustream.</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <Button
                variant="outline"
                className="relative h-8 w-full justify-start rounded-md bg-background text-sm text-muted-foreground shadow-none md:w-40 lg:w-64"
                onClick={() => setShowSearch(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline-flex">Search docs...</span>
                <span className="inline-flex lg:hidden">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  <Command className="h-3 w-3" />K
                </kbd>
              </Button>
            </div>
            <nav className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          onClick={() => setShowSearch(false)}
        >
          <div className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%]">
            <div className="relative">
              <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-11 text-base"
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <div className="mt-2 rounded-lg border border-border bg-card p-2 shadow-lg">
                  {filteredSections.map((section) => (
                    section.path ? (
                      <Link
                        key={section.id}
                        to={section.path}
                        onClick={() => {
                          setShowSearch(false);
                          setSearchQuery("");
                        }}
                        className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.category}
                        </div>
                      </Link>
                    ) : (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setShowSearch(false);
                          setSearchQuery("");
                          if (location.pathname !== "/help") navigate("/help");
                        }}
                        className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                      >
                        <div className="font-medium">{section.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {section.category}
                        </div>
                      </button>
                    )
                  ))}
                  {filteredSections.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto flex-1 items-start px-4 md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 md:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 lg:px-8">
        {/* Sidebar */}
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block md:w-[220px] lg:w-[240px]">
          <div className="h-full overflow-auto py-6 pr-6 lg:py-8">
            <nav className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="mb-2 text-sm font-semibold">{category}</h4>
                  <div className="space-y-1">
                      {sections
                        .filter((s) => s.category === category)
                        .map((section) => (
                          section.path ? (
                            <Link
                              key={section.id}
                              to={section.path}
                              className={cn(
                                "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:text-foreground",
                                activeSection === section.id
                                  ? "bg-accent font-medium text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {section.title}
                            </Link>
                          ) : (
                            <button
                              key={section.id}
                              onClick={() => {
                                setActiveSection(section.id);
                                if (location.pathname !== "/help") navigate("/help");
                              }}
                              className={cn(
                                "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:text-foreground",
                                activeSection === section.id
                                  ? "bg-accent font-medium text-foreground"
                                  : "text-muted-foreground"
                              )}
                            >
                              {section.title}
                            </button>
                          )
                        ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="my-4"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
            <span className="ml-2">Menu</span>
          </Button>

          {mobileMenuOpen && (
            <div className="mb-4 rounded-lg border border-border bg-card p-4">
              <nav className="space-y-4">
                {categories.map((category) => (
                  <div key={category}>
                    <h4 className="mb-2 text-sm font-semibold">{category}</h4>
                    <div className="space-y-1">
                        {sections
                          .filter((s) => s.category === category)
                          .map((section) => (
                            section.path ? (
                              <Link
                                key={section.id}
                                to={section.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "block w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                  activeSection === section.id
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {section.title}
                              </Link>
                            ) : (
                              <button
                                key={section.id}
                                onClick={() => {
                                  setActiveSection(section.id);
                                  setMobileMenuOpen(false);
                                  if (location.pathname !== "/help") navigate("/help");
                                }}
                                className={cn(
                                  "w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                                  activeSection === section.id
                                    ? "bg-accent font-medium text-foreground"
                                    : "text-muted-foreground"
                                )}
                              >
                                {section.title}
                              </button>
                            )
                          ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
          <div className="w-full min-w-0">
            {/* Breadcrumb */}
            <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Docs
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground">
                {sections.find((s) => s.id === activeSection)?.category}
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {sections.find((s) => s.id === activeSection)?.title}
              </span>
            </div>

            {/* Content */}
            <article className="prose prose-gray dark:prose-invert max-w-none">
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">
                      neustream Documentation
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Professional multistreaming made simple.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">What is neustream?</h2>
                    <p className="leading-7">
                      neustream is a cloud-based multistreaming platform that
                      enables content creators to broadcast simultaneously to
                      multiple streaming platforms (YouTube, Twitch, Facebook,
                      LinkedIn, and more) from a single source.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Key Features</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {[
                        {
                          title: "Multi-Platform Streaming",
                          desc: "Broadcast to unlimited platforms simultaneously",
                        },
                        {
                          title: "Cloud Encoding",
                          desc: "High-performance encoding without local resources",
                        },
                        {
                          title: "Unified Chat",
                          desc: "Manage all platform chats in one interface",
                        },
                        {
                          title: "Real-Time Analytics",
                          desc: "Monitor performance across all platforms",
                        },
                      ].map((feature) => (
                        <div
                          key={feature.title}
                          className="rounded-lg border border-border/50 p-4"
                        >
                          <h3 className="mb-1 text-sm font-semibold">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="not-prose rounded-lg border border-border/50 bg-muted/50 p-6">
                    <h3 className="mb-3 text-base font-semibold">
                      System Requirements
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Internet: 5+ Mbps upload (10+ recommended for HD)</li>
                      <li>• Software: OBS Studio, Streamlabs, or any RTMP-compatible software</li>
                      <li>• Hardware: Modern computer with hardware encoding support</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeSection === "quick-start" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Quick Start</h1>
                    <p className="text-lg text-muted-foreground">
                      Get streaming in under 5 minutes.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        step: "1",
                        title: "Create Your Account",
                        content: (
                          <>
                            <p className="leading-7">
                              Sign up for a free neustream account. No credit card
                              required to get started.
                            </p>
                            <Link to="/auth">
                              <Button className="mt-2">Sign Up Free</Button>
                            </Link>
                          </>
                        ),
                      },
                      {
                        step: "2",
                        title: "Create a Stream Source",
                        content: (
                          <p className="leading-7">
                            Navigate to your dashboard and click "Create Source".
                            Configure your stream settings (resolution, bitrate) and
                            copy your unique RTMP URL and stream key.
                          </p>
                        ),
                      },
                      {
                        step: "3",
                        title: "Configure OBS",
                        content: (
                          <div className="space-y-2">
                            <p className="leading-7">
                              Open OBS Studio and go to Settings → Stream. Enter:
                            </p>
                            <div className="rounded-md bg-muted p-3 font-mono text-sm">
                              <strong>Server: rtmp://stream.neustream.app/live</strong>
                              <br/>
                              <strong>Stream Key: [Your unique key]</strong>
                            </div>
                          </div>
                        ),
                      },
                      {
                        step: "4",
                        title: "Add Destinations",
                        content: (
                          <p className="leading-7">
                            Connect your streaming platforms (YouTube, Twitch, etc.)
                            from the dashboard. Authorize each platform to enable
                            multistreaming.
                          </p>
                        ),
                      },
                      {
                        step: "5",
                        title: "Go Live",
                        content: (
                          <p className="leading-7">
                            Click "Start Streaming" in OBS. Your stream will
                            automatically broadcast to all connected platforms!
                          </p>
                        ),
                      },
                    ].map((item) => (
                      <div key={item.step} className="space-y-3">
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-sm font-bold text-primary">
                            {item.step}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h2 className="text-xl font-semibold">{item.title}</h2>
                            <div className="text-muted-foreground">{item.content}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "create-account" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
                    <p className="text-lg text-muted-foreground">
                      Set up your neustream account to start streaming.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Sign Up Process</h2>
                    <p className="leading-7">
                      neustream offers multiple sign-up options for your convenience.
                      You can create an account using your email or connect with your
                      existing social accounts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Choose Your Plan</h2>
                    {plans.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-3">
                        {plans.map((plan: any) => {
                          const isPro = plan.name.toLowerCase() === "pro";
                          
                          // Build features list dynamically from API data
                          const features = [];
                          if (plan.max_destinations) {
                            features.push(`${plan.max_destinations} streaming destination${plan.max_destinations > 1 ? 's' : ''}`);
                          }
                          if (plan.max_streaming_hours_monthly) {
                            features.push(`${plan.max_streaming_hours_monthly} hours/month`);
                          }
                          if (plan.max_sources && plan.max_sources > 1) {
                            features.push(`Up to ${plan.max_sources} streaming sources`);
                          }
                          // Parse chat connectors from features array
                          if (plan.features && Array.isArray(plan.features)) {
                            const chatFeature = plan.features.find((f: string) => f.includes("Chat Connectors:"));
                            if (chatFeature) {
                              const match = chatFeature.match(/Chat Connectors:\s*(\d+)/);
                              if (match) {
                                features.push(`${match[1]} chat connector${parseInt(match[1]) > 1 ? 's' : ''}`);
                              }
                            }
                          }
                          // Add support type based on plan
                          const planName = plan.name.toLowerCase();
                          if (planName === 'free') {
                            features.push('Community support');
                          } else if (planName === 'pro') {
                            features.push('Priority support');
                          } else if (planName === 'business') {
                            features.push('24/7 dedicated support');
                          }

                          return (
                            <div
                              key={plan.id}
                              className={cn(
                                "rounded-lg border p-6",
                                isPro
                                  ? "border-primary bg-primary/5"
                                  : "border-border/50"
                              )}
                            >
                              {isPro && (
                                <span className="mb-2 inline-block rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
                                  Most Popular
                                </span>
                              )}
                              <h3 className="text-xl font-bold">{plan.name}</h3>
                              <div className="my-4 text-3xl font-bold">
                                {plan.formatted_price_monthly || `$${plan.price_monthly}`}
                              </div>
                              <ul className="space-y-2 text-sm text-muted-foreground">
                                {features.map((feature, idx) => (
                                  <li key={idx}>• {feature}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-lg border border-border/50 p-6 animate-pulse">
                            <div className="h-6 bg-muted rounded w-20 mb-4"></div>
                            <div className="h-8 bg-muted rounded w-24 mb-4"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-muted rounded"></div>
                              <div className="h-4 bg-muted rounded"></div>
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeSection === "streaming-basics" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Streaming Basics</h1>
                    <p className="text-lg text-muted-foreground">
                      Essential concepts for successful multistreaming.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">RTMP Configuration</h2>
                    <p className="leading-7">
                      neustream uses RTMP (Real-Time Messaging Protocol) to receive
                      your stream. Configure your streaming software with these
                      settings:
                    </p>
                    <div className="not-prose rounded-lg border border-border/50 bg-muted/50 p-4">
                      <div className="space-y-3 font-mono text-sm">
                        <div>
                          <div className="text-muted-foreground">Server URL</div>
                          <div className="font-medium">rtmp://stream.neustream.app</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Stream Key</div>
                          <div className="font-medium">
                            ns_live_[your-unique-key]
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                      Resolution & Bitrate Guide
                    </h2>
                    <div className="space-y-3">
                      {[
                        {
                          res: "1080p HD",
                          bitrate: "6000-8000 kbps",
                          upload: "10+ Mbps",
                          use: "Professional streaming, gaming",
                        },
                        {
                          res: "720p Standard",
                          bitrate: "3000-5000 kbps",
                          upload: "5+ Mbps",
                          use: "Most content types",
                        },
                        {
                          res: "480p Mobile",
                          bitrate: "1000-2000 kbps",
                          upload: "2+ Mbps",
                          use: "Low bandwidth situations",
                        },
                      ].map((config) => (
                        <div
                          key={config.res}
                          className="rounded-lg border border-border/50 p-4"
                        >
                          <h3 className="mb-2 font-semibold">{config.res}</h3>
                          <div className="grid gap-2 text-sm md:grid-cols-3">
                            <div>
                              <span className="text-muted-foreground">Bitrate: </span>
                              {config.bitrate}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Upload: </span>
                              {config.upload}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Best for: </span>
                              {config.use}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "obs-setup" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">OBS Setup</h1>
                    <p className="text-lg text-muted-foreground">
                      Configure OBS Studio for optimal multistreaming.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Installation</h2>
                    <p className="leading-7">
                      Download OBS Studio 30+ from{" "}
                      <a
                        href="https://obsproject.com"
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        obsproject.com
                      </a>
                      . Ensure your GPU drivers are up to date for optimal hardware
                      encoding support.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Stream Configuration</h2>
                    <ol className="list-decimal space-y-3 pl-6">
                      <li>Open OBS Studio</li>
                      <li>Go to Settings → Stream</li>
                      <li>
                        Select "Custom" as service
                      </li>
                      <li>Enter your neustream RTMP URL and stream key</li>
                      <li>Click "Apply" and "OK"</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                      Recommended Output Settings
                    </h2>
                    <div className="not-prose rounded-lg border border-border/50 bg-muted/50 p-4">
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Output Mode:</span>
                          <span>Advanced</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Encoder:</span>
                          <span>NVENC H.264 (or hardware encoder)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Rate Control:</span>
                          <span>CBR</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">Bitrate:</span>
                          <span>6000 kbps</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-muted-foreground">
                            Keyframe Interval:
                          </span>
                          <span>2 seconds</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "self-hosting" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Self Hosting</h1>
                    <p className="text-lg text-muted-foreground">
                      Deploy neustream on your own infrastructure.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Open Source</h2>
                    <p className="leading-7">
                      neustream is fully open source. You can host the entire platform, including the Control Plane, Media Server, and Frontend, on your own servers.
                    </p>
                    <div className="mt-4">
                       <Button asChild>
                        <a href="https://github.com/farseenmanekhan1232/neustream" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                          View Repository
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Requirements</h2>
                    <ul className="list-disc pl-6 space-y-2">
                       <li><strong>Docker</strong> for containerization</li>
                       <li><strong>Node.js v18+</strong> for backend services</li>
                       <li><strong>PostgreSQL</strong> for database</li>
                       <li><strong>Redis</strong> for caching and queues</li>
                       <li><strong>FFmpeg</strong> for media processing</li>
                    </ul>
                  </div>

                   <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Quick Deploy</h2>
                    <p className="leading-7">
                      For detailed deployment instructions, please refer to the <a href="https://github.com/farseenmanekhan1232/neustream#readme" target="_blank" className="text-primary hover:underline">Review the official README</a>.
                    </p>
                  </div>
                </div>
              )}

              {activeSection === "encoder-settings" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Encoder Settings</h1>
                    <p className="text-lg text-muted-foreground">
                      Choose the right encoder for your hardware.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                      Hardware vs Software Encoding
                    </h2>
                    <p className="leading-7">
                      Hardware encoders (NVENC, QuickSync, VCE) use your GPU to
                      encode video, reducing CPU usage. Software encoders (x264) use
                      your CPU and can provide better quality but require more
                      processing power.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        name: "NVENC (NVIDIA)",
                        desc: "Best for NVIDIA GPUs. Excellent quality with low CPU usage.",
                        recommended: true,
                      },
                      {
                        name: "QuickSync (Intel)",
                        desc: "Good for Intel integrated graphics. Lower power consumption.",
                      },
                      {
                        name: "VCE (AMD)",
                        desc: "Hardware encoding for AMD GPUs. Good performance.",
                      },
                      {
                        name: "x264 (CPU)",
                        desc: "Software encoding. Maximum quality but requires powerful CPU.",
                      },
                    ].map((encoder) => (
                      <div
                        key={encoder.name}
                        className={cn(
                          "rounded-lg border p-4",
                          encoder.recommended
                            ? "border-primary bg-primary/5"
                            : "border-border/50"
                        )}
                      >
                        <h3 className="mb-1 font-semibold">
                          {encoder.name}
                          {encoder.recommended && (
                            <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              Recommended
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {encoder.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Live */}
              {/* Platform Guides - Rendered via Outlet */}
              {activeSection.startsWith("platform-") && <Outlet />}

              {activeSection === "troubleshooting" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">Troubleshooting</h1>
                    <p className="text-lg text-muted-foreground">
                      Common issues and solutions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Stream Quality Issues</h2>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/50 p-4">
                        <h3 className="mb-2 font-semibold">
                          Stream is lagging or buffering
                        </h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Check your internet upload speed</li>
                          <li>• Reduce your bitrate in OBS settings</li>
                          <li>• Use hardware encoding to reduce CPU usage</li>
                          <li>• Close bandwidth-heavy applications</li>
                        </ul>
                      </div>

                      <div className="rounded-lg border border-border/50 p-4">
                        <h3 className="mb-2 font-semibold">
                          Stream keeps disconnecting
                        </h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Verify your RTMP URL and stream key</li>
                          <li>• Check firewall settings</li>
                          <li>• Use a wired connection instead of WiFi</li>
                          <li>• Contact your ISP if issues persist</li>
                        </ul>
                      </div>

                      <div className="rounded-lg border border-border/50 p-4">
                        <h3 className="mb-2 font-semibold">Poor video quality</h3>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Increase bitrate in OBS settings</li>
                          <li>• Check encoder preset (use "Quality" for NVENC)</li>
                          <li>• Ensure proper lighting in your scene</li>
                          <li>• Use higher resolution if bandwidth allows</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Need More Help?</h2>
                    <p className="leading-7">
                      If you're still experiencing issues, contact our support team
                      at{" "}
                      <a
                        href="mailto:support@neustream.app"
                        className="text-primary hover:underline"
                      >
                        support@neustream.app
                      </a>{" "}
                      or visit our{" "}
                      <Link to="/contact" className="text-primary hover:underline">
                        contact page
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {activeSection === "faq" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">
                      Frequently Asked Questions
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Quick answers to common questions.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        q: "How many platforms can I stream to at once?",
                        a: "Free plan: 2 platforms. Pro and Business plans: unlimited platforms.",
                      },
                      {
                        q: "What streaming software is compatible?",
                        a: "Any RTMP-compatible software including OBS Studio, Streamlabs, XSplit, vMix, and more.",
                      },
                      {
                        q: "Is there a delay when multistreaming?",
                        a: "Typical delay is 5-10 seconds, similar to single-platform streaming. This is normal for all streaming platforms.",
                      },
                      {
                        q: "Can I use neustream on mobile?",
                        a: "Yes! Our dashboard is mobile-responsive. You can manage streams and view analytics from any device.",
                      },
                      {
                        q: "Do you support 4K streaming?",
                        a: "Yes, 4K streaming is available on Business plan and higher.",
                      },
                      {
                        q: "Can I cancel my subscription anytime?",
                        a: "Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.",
                      },
                    ].map((faq, i) => (
                      <div key={i} className="rounded-lg border border-border/50 p-4">
                        <h3 className="mb-2 font-semibold">{faq.q}</h3>
                        <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "api-reference" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="mb-2 text-3xl font-bold">API Reference</h1>
                    <p className="text-lg text-muted-foreground">
                      Integrate neustream into your applications.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Authentication</h2>
                    <p className="leading-7">
                      All API requests require authentication using your API key.
                      Include your key in the request header.
                    </p>
                    <div className="not-prose rounded-lg border border-border/50 bg-muted/50 p-4">
                      <code className="text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Endpoints</h2>
                    <div className="space-y-3">
                      <div className="rounded-lg border border-border/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                            GET
                          </span>
                          <code className="text-sm">/api/sources</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Retrieve all streaming sources for your account.
                        </p>
                      </div>

                      <div className="rounded-lg border border-border/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                            POST
                          </span>
                          <code className="text-sm">/api/sources</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Create a new streaming source.
                        </p>
                      </div>

                      <div className="rounded-lg border border-border/50 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                            GET
                          </span>
                          <code className="text-sm">/api/destinations</code>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          List all configured streaming destinations.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="not-prose rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <h3 className="mb-2 text-sm font-semibold">⚠️ Note</h3>
                    <p className="text-sm text-muted-foreground">
                      API access is available on Pro and Business plans. Contact
                      sales for enterprise API solutions.
                    </p>
                  </div>
                </div>
              )}
            </article>

            {/* Footer Navigation */}
            <div className="mt-12 flex items-center justify-between border-t border-border/40 pt-6">
              <div className="text-sm text-muted-foreground">
                Need help?{" "}
                <Link to="/contact" className="text-primary hover:underline">
                  Contact support
                </Link>
              </div>
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Table of Contents (desktop only) */}
          <div className="hidden text-sm xl:block">
            <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
              <div className="space-y-2">
                <p className="font-semibold">On this page</p>
                <ul className="space-y-2 border-l border-border/40 pl-4">
                  {sections
                    .filter((s) => s.id === activeSection)
                    .map((section) => (
                      <li key={section.id}>
                        <button className="text-muted-foreground hover:text-foreground">
                          {section.title}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}