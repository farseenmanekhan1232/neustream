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
  obsLive: boolean | string;
  category: string;
}

export default function OBSLiveAlternative() {
  const comparisonData: ComparisonRow[] = [
    // Pricing
    {
      feature: "Free Plan Available",
      neustream: true,
      obsLive: true,
      category: "pricing",
    },
    {
      feature: "Starting Price",
      neustream: "$0/mo",
      obsLive: "$0/mo",
      category: "pricing",
    },
    {
      feature: "Free Streaming Hours",
      neustream: "35 hours/month",
      obsLive: "10 hours/month",
      category: "pricing",
    },
    
    // Features
    {
      feature: "Cloud Encoding",
      neustream: true,
      obsLive: true,
      category: "features",
    },
    {
      feature: "Unlimited Destinations (Pro)",
      neustream: true,
      obsLive: "Limited (5 max)",
      category: "features",
    },
    {
      feature: "Unified Chat Management",
      neustream: true,
      obsLive: "Limited",
      category: "features",
    },
    {
      feature: "Advanced Analytics",
      neustream: true,
      obsLive: "Basic",
      category: "features",
    },
    {
      feature: "OBS Integration",
      neustream: true,
      obsLive: true,
      category: "features",
    },
    
    // Platform Support
    {
      feature: "YouTube Support",
      neustream: true,
      obsLive: true,
      category: "platforms",
    },
    {
      feature: "Twitch Support",
      neustream: true,
      obsLive: true,
      category: "platforms",
    },
    {
      feature: "Facebook Support",
      neustream: true,
      obsLive: true,
      category: "platforms",
    },
    {
      feature: "LinkedIn Support",
      neustream: true,
      obsLive: false,
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
          Best OBS.Live Alternative 2024 - neustream | Free Multistreaming
        </title>
        <meta
          name="description"
          content="Looking for an OBS.Live alternative? neustream offers more free hours, unlimited destinations, and advanced analytics. Compare features and pricing."
        />
        <meta
          name="keywords"
          content="obs.live alternative, obs live alternative, obs multistreaming, neustream vs obs.live, multistreaming platform"
        />
        <meta
          property="og:title"
          content="Best OBS.Live Alternative 2024 - neustream"
        />
        <meta
          property="og:description"
          content="Looking for an OBS.Live alternative? neustream offers more free hours, unlimited destinations, and advanced analytics."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link
          rel="canonical"
          href="https://neustream.app/alternatives/obs-live"
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
                OBS.Live Alternative
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal tracking-tighter leading-tight sm:leading-tight md:leading-tight lg:leading-tight">
                The Best <span className="font-medium">OBS.Live Alternative</span>
                <br />
                for 2024
              </div>
              <p className="text-lg md:text-2xl font-light opacity-90 max-w-3xl mx-auto">
                Get 3.5x more free hours, unlimited destinations, and advanced
                analytics. neustream delivers everything OBS.Live does, and more.
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
              More free hours, better features, unlimited growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <DollarSign className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">3.5x More Free Hours</h3>
              <p className="opacity-80 leading-relaxed">
                neustream offers 35 hours/month free compared to OBS.Live's 10
                hours. Perfect for growing streamers who need more flexibility.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">Unlimited Destinations</h3>
              <p className="opacity-80 leading-relaxed">
                Stream to unlimited platforms on Pro plan. OBS.Live limits you
                to 5 destinations even on paid plans.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-normal mb-4">
                LinkedIn Support
              </h3>
              <p className="opacity-80 leading-relaxed">
                Stream to LinkedIn along with YouTube, Twitch, and Facebook.
                OBS.Live doesn't support LinkedIn streaming.
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
                      OBS.Live
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
                        {renderValue(row.obsLive)}
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
                  Create your free account with 35 hours of streaming. More than
                  3x what OBS.Live offers.
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
                  Add all your streaming platforms including YouTube, Twitch,
                  Facebook, and LinkedIn.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center text-xl font-medium">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-normal mb-3">
                  Update OBS Settings
                </h3>
                <p className="opacity-80 leading-relaxed">
                  Replace your OBS.Live server URL with neustream's RTMP URL.
                  Same OBS setup, better platform.
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
                  Start streaming with more free hours and unlimited growth
                  potential.
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
              Ready to Make the Switch?
            </h2>
            <p className="text-2xl lg:text-3xl leading-relaxed opacity-90">
              Join thousands of streamers who've upgraded to neustream.
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
              35 hours free streaming • No credit card required • Unlimited destinations on Pro
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
