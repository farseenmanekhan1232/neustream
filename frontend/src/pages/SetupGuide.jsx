import { Link } from "react-router-dom";
import {
  Play,
  Settings,
  Radio,
  Upload,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StreamingDemo from "./components/StreamingDemo";

const SetupGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <HelpCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Getting Started</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stream to multiple platforms at once. Set up in 3 simple steps.
            </p>
            <Button asChild size="lg">
              <Link to="/dashboard/streaming">
                Start Streaming Now
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Quick Overview */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <CardTitle className="text-xl">Create Source</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Set up your stream in OBS or other broadcasting software
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <CardTitle className="text-xl">Add Platforms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect YouTube, Twitch, Facebook, or any RTMP platform
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <CardTitle className="text-xl">Go Live</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Start streaming to all platforms simultaneously
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Step-by-Step Guide</h2>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                Create Your Stream Source
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-medium">What you need:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Broadcasting software (OBS, Streamlabs, etc.)
                  </li>
                  <li className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    Your NeuStream stream key (we'll provide this)
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Pro tip:</strong> Use a wired internet connection for the most stable stream.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                Add Your Platforms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Popular Platforms:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">YT</div>
                      <span className="text-sm">YouTube Live</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">TW</div>
                      <span className="text-sm">Twitch</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">FB</div>
                      <span className="text-sm">Facebook</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium">How it works:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      Click "Add Destination" in your dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      Choose your platform
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      Sign in and authorize NeuStream
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                Start Streaming
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">You're ready to go live!</h4>
                <div className="space-y-2 text-sm text-green-800">
                  <p>1. Start your broadcast in OBS/Streamlabs</p>
                  <p>2. Monitor your stream in the NeuStream dashboard</p>
                  <p>3. Engage with viewers across all platforms</p>
                </div>
              </div>
              <Button asChild className="w-full">
                <Link to="/dashboard/streaming">
                  <Play className="h-4 w-4 mr-2" />
                  Go to Streaming Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Demo */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Try It Out</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            Practice with our interactive demo before going live. No account required.
          </p>
          <StreamingDemo />
        </div>

        {/* Need Help */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Need More Help?</h3>
              <p className="text-muted-foreground">
                Our support team is here to help you succeed with multi-platform streaming.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Help Center
                </Button>
                <Button>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SetupGuide;