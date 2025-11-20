import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface Alternative {
  name: string;
  slug: string;
  tagline: string;
  logo?: string;
  startingPrice: string;
  freeOption: boolean;
}

export default function Alternatives() {
  const alternatives: Alternative[] = [
    {
      name: "Restream",
      slug: "restream",
      tagline: "Popular multi-streaming service",
      startingPrice: "$19/mo",
      freeOption: false,
    },
    {
      name: "OBS.Live",
      slug: "obs-live",
      tagline: "OBS-integrated streaming platform",
      startingPrice: "Free-$29/mo",
      freeOption: true,
    },
    {
      name: "StreamYard",
      slug: "streamyard",
      tagline: "Browser-based streaming studio",
      startingPrice: "$20/mo",
      freeOption: true,
    },
    {
      name: "Castr",
      slug: "castr",
      tagline: "Professional live streaming platform",
      startingPrice: "$29/mo",
      freeOption: false,
    },
  ];

  const whyNeuStream = [
    "Forever-free plan with 35 hours/month",
    "Cloud encoding with zero local performance impact",
    "Stream to unlimited platforms (Pro plan)",
    "Unified chat management across all platforms",
    "Advanced analytics included in all plans",
    "No forced upgrades or paywalls",
    "99.9% uptime guarantee",
    "24/7 support for Pro+ users",
  ];

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>
          Best Multistreaming Platform Alternatives 2024 | neustream
        </title>
        <meta
          name="description"
          content="Compare top multistreaming platform alternatives. Find the best solution for streaming to YouTube, Twitch, Facebook, and more simultaneously."
        />
        <meta
          name="keywords"
          content="multistreaming alternatives, restream alternative, obs.live alternative, stream to multiple platforms, live streaming software"
        />
        <meta
          property="og:title"
          content="Best Multistreaming Platform Alternatives 2024"
        />
        <meta
          property="og:description"
          content="Compare top multistreaming platforms and find the best solution for your streaming needs."
        />
        <link rel="canonical" href="https://neustream.app/alternatives" />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 md:space-y-12">
            <div className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="Neustream Logo"
                className="h-24 w-24 -mb-8 animate-oscillate"
              />
            </div>

            <div className="space-y-6 max-w-4xl">
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                Find Your Perfect
                <br />
                <span className="font-medium">Multistreaming Platform</span>
              </div>
              <p className="text-lg md:text-2xl font-light opacity-90 max-w-3xl mx-auto">
                Compare neustream with other platforms. More features, better
                pricing, superior performance.
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <Button
                asChild
                className="w-full min-h-[52px] text-lg py-7 px-10 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl transition-all hover:scale-105"
              >
                <Link to="/auth">
                  Try neustream Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why neustream Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Why Choose neustream?
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              More features. Better pricing. Superior performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {whyNeuStream.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base leading-relaxed">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alternatives Comparison */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Popular Alternatives
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              See how neustream stacks up
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {alternatives.map((alt) => (
              <div
                key={alt.slug}
                className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-normal mb-3">{alt.name}</h3>
                    <p className="text-lg opacity-80">{alt.tagline}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 py-4 border-t border-white/10">
                    <div>
                      <span className="text-sm opacity-70">Starting at:</span>
                      <div className="text-2xl font-normal mt-1">
                        {alt.startingPrice}
                      </div>
                    </div>
                    {alt.freeOption && (
                      <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm font-medium">
                        Free Option Available
                      </span>
                    )}
                  </div>

                  <Button
                    asChild
                    className="w-full h-12 text-base rounded-xl bg-white/90 text-black hover:bg-white font-normal"
                  >
                    <Link to={`/alternatives/${alt.slug}`}>
                      Compare in Detail
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Quick Comparison
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              Key features at a glance
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-5 text-left font-normal text-lg">
                      Feature
                    </th>
                    <th className="px-6 py-5 text-center font-normal text-lg bg-white/5">
                      neustream
                    </th>
                    <th className="px-6 py-5 text-center font-normal text-lg">
                      Restream
                    </th>
                    <th className="px-6 py-5 text-center font-normal text-lg">
                      OBS.Live
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/10">
                    <td className="px-6 py-5 font-normal">Free Plan</td>
                    <td className="px-6 py-5 text-center bg-white/5">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-red-400">✕</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-6 py-5 font-normal">Cloud Encoding</td>
                    <td className="px-6 py-5 text-center bg-white/5">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-6 py-5 font-normal">Unified Chat</td>
                    <td className="px-6 py-5 text-center bg-white/5">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <Check className="w-5 h-5 text-green-400 mx-auto" />
                    </td>
                    <td className="px-6 py-5 text-center opacity-60">
                      Limited
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-6 py-5 font-normal">Advanced Analytics</td>
                    <td className="px-6 py-5 text-center bg-white/5">
                      Included
                    </td>
                    <td className="px-6 py-5 text-center opacity-60">
                      Paid Add-on
                    </td>
                    <td className="px-6 py-5 text-center opacity-60">Basic</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-5 font-normal">Starting Price</td>
                    <td className="px-6 py-5 text-center font-semibold text-xl bg-white/5">
                      $0
                    </td>
                    <td className="px-6 py-5 text-center">$19/mo</td>
                    <td className="px-6 py-5 text-center">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight">
              Ready to Stream?
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed opacity-90">
              Join thousands of streamers who trust neustream.
            </p>
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
