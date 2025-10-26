import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { subscriptionService } from "../services/subscription";
import { TextHighlighter } from "../components/fancy/text/TextHighlighter";

function Landing() {
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

  const plans = plansData || [];

  // Helper function to format plan features based on plan data
  const getPlanFeatures = (plan) => {
    const features = [];

    // Add streaming platforms feature
    if (plan.max_destinations) {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: `Stream to ${plan.max_destinations} platform${
          plan.max_destinations > 1 ? "s" : ""
        } simultaneously`,
      });
    }

    // Add streaming quality based on plan name
    if (plan.name.toLowerCase() === "free") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "720p HD streaming quality",
      });
    } else if (plan.name.toLowerCase() === "pro") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "1080p Full HD streaming quality",
      });
    } else if (plan.name.toLowerCase() === "business") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "4K Ultra HD streaming quality",
      });
    }

    // Add analytics feature
    if (plan.name.toLowerCase() === "free") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "Basic analytics dashboard",
      });
    } else {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "Advanced analytics & insights",
      });
    }

    // Add support feature
    if (plan.name.toLowerCase() === "free") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "Community support",
      });
    } else if (plan.name.toLowerCase() === "pro") {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "Priority support",
      });
    } else {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: "24/7 dedicated support",
      });
    }

    // Add sources feature
    if (plan.max_sources > 1) {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: `Up to ${plan.max_sources} streaming sources`,
      });
    }

    // Add monthly hours
    if (plan.max_streaming_hours_monthly) {
      features.push({
        icon: (
          <svg
            className="h-4 w-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
        text: `${plan.max_streaming_hours_monthly} hours monthly`,
      });
    }

    return features;
  };

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return "$0";
    return `$${price}`;
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
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-10">
            <div className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Neustream Logo"
                className="h-20 w-20 -mb-8 animate-oscillate"
              />
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tighter leading-tight md:leading-tight lg:leading-tight">
                Streaming Without{" "}
                <TextHighlighter {...highlightConfig}>
                  Performance Compromises
                </TextHighlighter>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
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
            </div>

            <div className=" ">
              <p className=" opacity-80 text-sm">
                Seamlessly integrate with your favorite platforms
              </p>
              <div className="flex flex-wrap justify-center gap-x-8 opacity-80">
                {["Twitch", "YouTube", "Facebook", "TikTok", "Instagram"].map(
                  (platform) => (
                    <div
                      key={platform}
                      className="text-base font-semibold text-shadow-md"
                    >
                      {platform}
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
        <img
          src="/hero.png"
          alt="Integration"
          className="w-2/3 mx-auto rounded-2xl mt-6"
        />
      </section>

      {/* Performance & Privacy Section */}
      <section className="section-padding ">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-normal">
                  Best performance by default, not as a hidden option
                </h2>
                <p className="text-lg ">
                  NeuStream eliminates hardware bottlenecks by offloading video
                  encoding to our cloud infrastructure. Your local machine stays
                  fast and responsive, whether you're gaming, creating, or
                  working on resource-intensive projects. No CPU spikes, no
                  dropped frames, no{" "}
                  <TextHighlighter {...highlightConfig}>
                    performance compromises
                  </TextHighlighter>
                  .
                  <br />
                  <br />
                  Our distributed infrastructure ensures your streams stay live
                  even if individual servers experience issues. You get{" "}
                  <TextHighlighter {...highlightConfig}>
                    99.9% uptime guarantee
                  </TextHighlighter>{" "}
                  without thinking about it.
                  <br />
                  <br />
                  Not enough? Fine-tune your streaming settings with advanced
                  controls for bitrate, resolution, and platform-specific
                  optimizations. You're finally in{" "}
                  <TextHighlighter {...highlightConfig}>
                    full control of your streaming performance
                  </TextHighlighter>{" "}
                  without hardware limitations.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-2xl font-normal">Respectful by design</h3>
                <p className="">
                  NeuStream doesn't interrupt your workflow or annoy you with
                  anything. It doesn't do anything without your consent: no
                  unexpected tabs about updates, no persistent popups telling
                  you about features you don't care about, no weird restarts.
                  <br />
                  <br />
                  Nothing interrupts your stream, jumps in your face, or breaks
                  your creative flow. Everything just makes sense. You're in
                  <TextHighlighter {...highlightConfig}>
                    full control
                  </TextHighlighter>
                  .
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-normal">
                  Fast, efficient, and reliable
                </h3>
                <p className="">
                  NeuStream's cloud architecture is optimized for streaming
                  performance and energy efficiency. You will notice the
                  difference after streaming with NeuStream for just one
                  session. It doesn't slow down over time or during long
                  streams.
                  <br />
                  <br />
                  All unnecessary bloat is removed: NeuStream is one of the{" "}
                  <TextHighlighter {...highlightConfig}>
                    most efficient multistreaming solutions
                  </TextHighlighter>{" "}
                  available, delivering maximum performance with minimal
                  resource usage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-2xl font-normal">
                    Works with all streaming software
                  </h3>
                  <p className="">
                    All major streaming applications are supported and work
                    right away, by default, including{" "}
                    <TextHighlighter {...highlightConfig}>
                      OBS Studio, Streamlabs, XSplit
                    </TextHighlighter>
                    , and any RTMP-compatible software. We'll keep support for
                    emerging platforms as they become available.
                    <br />
                    <br />
                    NeuStream provides{" "}
                    <TextHighlighter {...highlightConfig}>
                      secure, encrypted connections
                    </TextHighlighter>{" "}
                    to all platforms. Your stream keys and credentials are
                    protected with enterprise-grade security.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-normal">
                    Best practices for everyone, by default
                  </h3>
                  <p className="">
                    NeuStream enforces{" "}
                    <TextHighlighter {...highlightConfig}>
                      secure connections to all platforms
                    </TextHighlighter>{" "}
                    and warns you when a platform connection needs attention.
                    Your stream data is protected end-to-end.
                    <br />
                    <br />
                    There's no unnecessary data collection. We only process
                    what's needed to deliver your streams reliably. Your{" "}
                    <TextHighlighter {...highlightConfig}>
                      privacy and control over your content
                    </TextHighlighter>{" "}
                    are fundamental principles.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-normal">
                  Designed to get out of your way
                </h3>
                <p className="">
                  NeuStream's interface is{" "}
                  <TextHighlighter {...highlightConfig}>
                    clean and minimalistic
                  </TextHighlighter>
                  , but doesn't compromise on functionality. More screen space
                  for your content, less clutter from the interface. Customize
                  your dashboard to show only what matters to you.
                  <br />
                  <br />
                  NeuStream is built with attention to detail. Your streams
                  don't stutter or drop frames abnormally. Your creative
                  workflow isn't interrupted by lag or technical issues.
                  Everything's{" "}
                  <TextHighlighter {...highlightConfig}>
                    smooth, reliable, and simple
                  </TextHighlighter>
                  . Comfort and performance are our top priorities.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <img src="/obs.png" alt="Gaming" className="w-full rounded-2xl" />
              <div className="space-y-4">
                <h3 className="text-2xl font-normal">
                  Transparent and honest pricing
                </h3>
                <p className="">
                  All NeuStream plans are{" "}
                  <TextHighlighter {...highlightConfig}>
                    clearly priced with no hidden fees
                  </TextHighlighter>
                  . You get exactly what you pay for, with straightforward
                  upgrade paths as your streaming needs grow.
                  <br />
                  <br />
                  Everything is available with{" "}
                  <TextHighlighter {...highlightConfig}>
                    transparent billing
                  </TextHighlighter>
                  . No exceptions, no surprise charges.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-normal">
                  Always reliable and up-to-date
                </h3>
                <p className="">
                  We maintain our infrastructure with the latest security and
                  performance updates. Your streaming service will always be
                  <TextHighlighter {...highlightConfig}>
                    safe, fast, and current
                  </TextHighlighter>
                  .
                  <br />
                  <br />
                  NeuStream updates its services automatically, with new
                  features and optimizations delivered seamlessly. All
                  improvements are available to you{" "}
                  <TextHighlighter {...highlightConfig}>
                    without manual intervention
                  </TextHighlighter>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Target Audience Section */}
      <section className="section-padding ">
        <img
          src="/live.png"
          alt="Target Audience"
          className="w-2/3 h-auto mb-8 mx-auto rounded-2xl"
        />
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              The streaming platform made for creators, with purpose
            </h2>
            <p className=" text-lg">
              We're building a streaming platform that we would want to use
              ourselves. NeuStream's main goal is to provide an{" "}
              <TextHighlighter {...highlightConfig}>
                honest, reliable, performance-focused, and non-invasive
                streaming experience
              </TextHighlighter>
              .
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-normal">Perfect for gamers</h3>
              <p className="">
                Stream without FPS drops or system performance impact. Maintain
                competitive edge while{" "}
                <TextHighlighter {...highlightConfig}>
                  broadcasting to multiple platforms simultaneously
                </TextHighlighter>
                .
              </p>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-normal">
                Perfect for content creators
              </h3>
              <p className="">
                Reach audiences across multiple platforms with one stream.{" "}
                <TextHighlighter {...highlightConfig}>
                  Focus on creating amazing content
                </TextHighlighter>{" "}
                while we handle the technical complexity.
              </p>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-xl font-normal">
                Perfect for everyone on the go
              </h3>
              <p className="">
                NeuStream's efficiency makes it perfect for mobile creators and
                professionals. Stream from anywhere with{" "}
                <TextHighlighter {...highlightConfig}>
                  reliable cloud infrastructure
                </TextHighlighter>{" "}
                backing you up.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Choose Your{" "}
              <span className="underline font-medium">Perfect Plan</span>
            </h2>
            <p className=" text-lg">
              Start streaming to multiple platforms with our flexible pricing
              options. Scale as you grow with no hidden fees.
            </p>
          </div>

          {plansLoading ? (
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="feature-card animate-pulse">
                  <div className="text-center space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={j}
                          className="h-4 bg-gray-200 rounded w-full"
                        ></div>
                      ))}
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
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
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {plans.map((plan) => {
                const features = getPlanFeatures(plan);
                const isProPlan = plan.name.toLowerCase() === "pro";

                return (
                  <div
                    key={plan.id}
                    className={`relative ${
                      isProPlan ? "border-2 border-primary" : ""
                    }`}
                  >
                    {isProPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary  px-3 py-1 rounded-full text-sm font-medium">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="text-center space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-normal">{plan.name}</h3>
                        <p className="">
                          {plan.description ||
                            `Perfect for ${plan.name.toLowerCase()} users`}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <div className="text-3xl font-normal">
                          {formatPrice(plan.price_monthly)}
                          <span className="text-sm font-normal ">/month</span>
                        </div>
                        {plan.price_yearly && (
                          <p className="text-sm ">
                            ${plan.price_yearly} billed annually
                          </p>
                        )}
                      </div>
                      <ul className="space-y-3 text-sm">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            {feature.icon}
                            {feature.text}
                          </li>
                        ))}
                      </ul>
                      <Button
                        variant={isProPlan ? "default" : "outline"}
                        className="w-full"
                        asChild
                      >
                        <Link to="/auth">Start Free Trial</Link>
                      </Button>
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

          <div className="text-center mt-12">
            <p className=" mb-4">
              All plans include a 14-day free trial. No credit card required.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm ">
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Cancel anytime
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Secure payment processing
              </span>
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                30-day money-back guarantee
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-normal mb-4">
              Ready to try NeuStream?
            </h2>
            <p className=" text-lg mb-8">
              It's never too late to get your streaming setup on the right
              track. NeuStream can help you{" "}
              <TextHighlighter {...highlightConfig}>
                reach more viewers across platforms while keeping your local
                performance intact
              </TextHighlighter>
              . We hope you'll love it!
            </p>{" "}
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
