import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";
import {
  Check,
  X,
  ArrowRight,
  Zap,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface ComparisonRow {
  feature: string;
  neustream: boolean | string;
  streamyard: boolean | string;
  category: string;
}

export default function StreamYardAlternative() {
  const comparisonData: ComparisonRow[] = [
    // Pricing
    {
      feature: "Free Plan Available",
      neustream: true,
      streamyard: true,
      category: "pricing",
    },
    {
      feature: "Starting Paid Price",
      neustream: "$9/mo",
      streamyard: "$20/mo",
      category: "pricing",
    },
    {
      feature: "Free Streaming Hours",
      neustream: "35 hours/month",
      streamyard: "20 hours/month",
      category: "pricing",
    },
    
    // Features
    {
      feature: "Cloud Encoding",
      neustream: true,
      streamyard: true,
      category: "features",
    },
    {
      feature: "OBS Integration",
      neustream: true,
      streamyard: false,
      category: "features",
    },
    {
      feature: "Browser-Based",
      neustream: true,
      streamyard: true,
      category: "features",
    },
    {
      feature: "Unified Chat Management",
      neustream: true,
      streamyard: true,
      category: "features",
    },
    {
      feature: "Advanced Analytics",
      neustream: true,
      streamyard: "Limited",
      category: "features",
    },
    {
      feature: "Custom RTMP",
      neustream: true,
      streamyard: "Pro only",
      category: "features",
    },
    
    // Platform Support
    {
      feature: "Simultaneous Platforms (Free)",
      neustream: "3",
      streamyard: "3",
      category: "platforms",
    },
    {
      feature: "LinkedIn Support",
      neustream: true,
      streamyard: true,
      category: "platforms",
    },
  ];

  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-400 mx-auto" />
      );
    }
    return <span>{value}</span>;
  };

  return (
    <div className="min-h-screen bg-teal-gradient text-white">
      <Helmet>
        <title>
          Best StreamYard Alternative 2024 - neustream | Lower Pricing
        </title>
        <meta
          name="description"
          content="Looking for a StreamYard alternative? neustream offers better pricing, more free hours, and OBS integration. Compare features and start free today."
        />
        <meta
          name="keywords"
          content="streamyard alternative, streamyard competitor, browser streaming, neustream vs streamyard, multistreaming platform"
        />
        <meta
          property="og:title"
          content="Best StreamYard Alternative 2024 - neustream"
        />
        <meta
          property="og:description"
          content="Looking for a StreamYard alternative? neustream offers better pricing, more free hours, and OBS integration."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href="https://neustream.app/alternatives/streamyard"
        />
      </Helmet>

      <Header />

      {/* Hero Section */}
      <section className="py-12 px-4 sm:py-16 sm:px-6 lg:py-24 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8 sm:space-y-10 md:space-y-12">
            <div className="inline-flex items-center">
              <img
                src="/logo.png"
                alt="neustream Logo"
                className="h-24 w-24 -mb-8 animate-oscillate"
              />
            </div>

            <div className="space-y-6 max-w-4xl">
              <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium border border-white/20">
                StreamYard Alternative
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                The Best <span className="font-medium">StreamYard Alternative</span>
                <br />
                for 2024
              </div>
              <p className="text-lg md:text-2xl font-light opacity-90 max-w-3xl mx-auto">
                Get better pricing, OBS integration, and professional features.
                neustream delivers everything StreamYard does, for less.
              </p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-md">
              <Button
                asChild
                className="w-full min-h-[52px] text-lg py-7 px-10 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl transition-all hover:scale-105"
              >
                <Link to="/auth">
                  Start Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Switch Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Why Streamers Are Switching
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              Better pricing, more flexibility, professional features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Better Pricing</h3>
              <p className="opacity-80 leading-relaxed">
                Start at $9/mo vs StreamYard's $20/mo. Save over 50% while
                getting all the features you need.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">OBS Integration</h3>
              <p className="opacity-80 leading-relaxed">
                Full OBS support for advanced streamers. StreamYard is
                browser-only with limited customization.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">
                More Free Hours
              </h3>
              <p className="opacity-80 leading-relaxed">
                35 hours/month free vs StreamYard's 20 hours. Perfect for
                regular streamers who need more time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Feature Comparison
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              See how neustream stacks up
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
                      StreamYard
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-white/10 last:border-0"
                    >
                      <td className="px-6 py-5 font-normal">{row.feature}</td>
                      <td className="px-6 py-5 text-center bg-white/5">
                        {renderValue(row.neustream)}
                      </td>
                      <td className="px-6 py-5 text-center opacity-80">
                        {renderValue(row.streamyard)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Migration Guide */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-normal leading-tight mb-8">
              Switching is Easy
            </h2>
            <p className="text-xl md:text-2xl opacity-80">
              Migrate in just a few simple steps
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">
                  Sign Up for neustream
                </h3>
                <p className="opacity-80 leading-relaxed">
                  Create your free account. Get 35 hours/month free - 75% more
                  than StreamYard offers.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">
                  Connect Your Platforms
                </h3>
                <p className="opacity-80 leading-relaxed">
                  Link YouTube, Twitch, Facebook, and LinkedIn. Same platforms,
                  better pricing.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">
                  Choose Your Setup
                </h3>
                <p className="opacity-80 leading-relaxed">
                  Use our browser interface like StreamYard, or connect OBS for
                  advanced control. Your choice.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">Go Live!</h3>
                <p className="opacity-80 leading-relaxed">
                  Start streaming with better pricing and more professional
                  features.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-normal leading-tight">
              Ready to Save Money?
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed opacity-90">
              Join streamers who switched and saved over 50%.
            </p>
            <Button
              asChild
              className="w-full sm:w-min mx-auto text-xl py-8 px-12 bg-white text-black rounded-3xl font-light hover:bg-white shadow-2xl relative transition-all hover:scale-105"
            >
              <Link to="/auth">
                Start Free Now
                <span className="absolute -top-3 -right-3 bg-red-500 text-white text-base font-bold px-3 py-1.5 rounded-full">
                  <span className="animate-pulse">LIVE</span>
                </span>
              </Link>
            </Button>
            <p className="text-base opacity-70">
              35 hours free streaming • $9/mo paid plans • No credit card required
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
