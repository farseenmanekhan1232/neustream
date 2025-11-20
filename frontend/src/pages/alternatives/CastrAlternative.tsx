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
  castr: boolean | string;
  category: string;
}

export default function CastrAlternative() {
  const comparisonData: ComparisonRow[] = [
    // Pricing
    {
      feature: "Free Plan Available",
      neustream: true,
      castr: false,
      category: "pricing",
    },
    {
      feature: "Starting Price",
      neustream: "$0/mo",
      castr: "$29/mo",
      category: "pricing",
    },
    {
      feature: "Entry-Level Paid Plan",
      neustream: "$9/mo",
      castr: "$29/mo",
      category: "pricing",
    },
    
    // Features
    {
      feature: "Cloud Encoding",
      neustream: true,
      castr: true,
      category: "features",
    },
    {
      feature: "Unlimited Destinations (Pro)",
      neustream: true,
      castr: "5 max",
      category: "features",
    },
    {
      feature: "Unified Chat Management",
      neustream: true,
      castr: true,
      category: "features",
    },
    {
      feature: "Advanced Analytics",
      neustream: true,
      castr: true,
      category: "features",
    },
    {
      feature: "Free Tier Hours",
      neustream: "35/month",
      castr: "None",
      category: "features",
    },
    {
      feature: "OBS Integration",
      neustream: true,
      castr: true,
      category: "features",
    },
    
    // Platform Support
    {
      feature: "YouTube Support",
      neustream: true,
      castr: true,
      category: "platforms",
    },
    {
      feature: "Twitch Support",
      neustream: true,
      castr: true,
      category: "platforms",
    },
    {
      feature: "LinkedIn Support",
      neustream: true,
      castr: "Limited",
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
          Best Castr Alternative 2024 - neustream | Start Free
        </title>
        <meta
          name="description"
          content="Looking for a Castr alternative? neustream offers a free plan, better pricing starting at $9/mo, and unlimited destinations. Compare features today."
        />
        <meta
          name="keywords"
          content="castr alternative, castr competitor, multistreaming platform, neustream vs castr, live streaming software"
        />
        <meta
          property="og:title"
          content="Best Castr Alternative 2024 - neustream"
        />
        <meta
          property="og:description"
          content="Looking for a Castr alternative? neustream offers a free plan, better pricing, and unlimited destinations."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href="https://neustream.app/alternatives/castr"
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
                Castr Alternative
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                The Best <span className="font-medium">Castr Alternative</span>
                <br />
                for 2024
              </div>
              <p className="text-lg md:text-2xl font-light opacity-90 max-w-3xl mx-auto">
                Start free, pay less, stream more. neustream delivers professional
                multistreaming without Castr's high entry price.
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
              Free plan, better pricing, unlimited destinations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Start for Free</h3>
              <p className="opacity-80 leading-relaxed">
                neustream has a free plan with 35 hours/month. Castr charges
                $29/mo minimum with no free option.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Unlimited Destinations</h3>
              <p className="opacity-80 leading-relaxed">
                Stream to unlimited platforms on Pro plan. Castr limits you to
                5 destinations even on paid tiers.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">
                70% Lower Entry Price
              </h3>
              <p className="opacity-80 leading-relaxed">
                Paid plans start at $9/mo vs Castr's $29/mo. Same professional
                features, much better pricing.
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
                      Castr
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
                        {renderValue(row.castr)}
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
                  Create your free account. No $29/mo minimum like Castr -
                  actually free forever.
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
                  Link all your streaming destinations. Same platforms, better
                  pricing structure.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">
                  Update Your Streaming Software
                </h3>
                <p className="opacity-80 leading-relaxed">
                  Replace your Castr RTMP URL with neustream's. Simple
                  one-time setup in OBS or your preferred software.
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
                  Start streaming with lower costs and more flexibility. Cancel
                  your Castr subscription.
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
              Ready to Save $29/Month?
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed opacity-90">
              Start free today. No minimum payment required.
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
              35 hours free streaming • Paid plans from $9/mo • No credit card required
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
