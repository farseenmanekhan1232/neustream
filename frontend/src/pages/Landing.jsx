import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex flex-col items-center text-center space-y-8 md:space-y-10">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
              <span className="text-xs font-semibold uppercase tracking-wide">
                Coming Soon
              </span>
              <span className="mx-2">|</span>
              <span className="text-muted-foreground">
                Launch Date: Q2 2025
              </span>
            </div>

            <div className="space-y-4 max-w-3xl">
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight lg:leading-tight">
                Stream Without{" "}
                <span className="gradient-text">Hardware Limitations</span>
              </div>
              <div className="text-xl text-muted-foreground max-w-2xl mx-auto">
                NeuStream offloads computational burden from your system,
                letting you stream to multiple platforms simultaneously without
                sacrificing performance or creative quality.
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
              <Button asChild className="w-full">
                <Link to="/auth">Get Started</Link>
              </Button>
              <Button variant="outline" className="w-full">
                <span>Watch Demo</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="pt-8 md:pt-12">
              <p className="text-sm text-muted-foreground mb-4">
                Seamlessly integrate with your favorite platforms
              </p>
              <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-70">
                {["Twitch", "YouTube", "Facebook", "TikTok", "Instagram"].map(
                  (platform) => (
                    <div key={platform} className="text-lg font-semibold">
                      {platform}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-muted/30">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Features for{" "}
              <span className="gradient-text">Professional Streamers</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Our cloud-based computational offloading technology transforms
              your streaming workflow, giving you the power to do more with your
              existing hardware.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                ),
                title: "Cloud-Powered Processing",
                description:
                  "Our servers handle the heavy computational load of multi-streaming, reducing CPU usage on your machine by up to 60%.",
              },
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                ),
                title: "Zero-Lag Performance",
                description:
                  "Maintain high frame rates in your games or creative applications while streaming to multiple platforms simultaneously.",
              },
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                ),
                title: "Creative Freedom",
                description:
                  "Run resource-intensive applications alongside your streams without compromising quality or performance.",
              },
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "Unified Analytics Dashboard",
                description:
                  "Track viewer engagement, growth metrics, and performance statistics across all platforms in one place.",
              },
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                ),
                title: "99.9% Uptime Guarantee",
                description:
                  "Our distributed infrastructure ensures your streams stay live even if individual servers experience issues.",
              },
              {
                icon: (
                  <svg
                    className="h-10 w-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
                title: "Global CDN Integration",
                description:
                  "Deliver high-quality streams to viewers worldwide with minimal latency through our optimized content delivery network.",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Streaming?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of content creators who have already upgraded their
              streaming setup with NeuStream.
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Landing;
