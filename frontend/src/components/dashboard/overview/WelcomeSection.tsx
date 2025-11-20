import { memo } from "react";
import { Link } from "react-router-dom";
import { Plus, HelpCircle, MonitorSpeaker, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  email?: string;
  displayName?: string;
}

interface Source {
  id: string;
  name: string;
  status: string;
}

interface WelcomeSectionProps {
  user?: User | null;
  sources: Source[];
  activeSources: number;
  totalDestinationsAcrossSources: number;
}

const WelcomeSection = memo(function WelcomeSection({
  user,
  sources,
  activeSources,
  totalDestinationsAcrossSources,
}: WelcomeSectionProps) {
  const isNewUser = sources.length === 0;

  const getUserName = () => {
    return user?.email?.split("@")[0] || "User";
  };

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 w-full">
      <CardHeader>
        <CardTitle className="text-2xl max-sm:text-xl">
          {isNewUser
            ? `Welcome to neustream, ${getUserName()}!`
            : `Welcome back, ${getUserName()}!`}
        </CardTitle>
        <CardDescription>
          {isNewUser
            ? "Let's get you set up for multi-platform streaming in just a few steps."
            : "Your streaming setup is ready. Check your stats and manage your destinations below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isNewUser ? (
          <div className="flex max-md:flex-col gap-2 items-center space-x-4">
            <Button asChild>
              <Link to="/dashboard/streaming">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Stream Source
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/help">
                <HelpCircle className="h-4 w-4 mr-2" />
                View Setup Guide
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <MonitorSpeaker className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {sources.length} Stream Source
                  {sources.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeSources.length} active
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Radio className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {totalDestinationsAcrossSources} Destination
                  {totalDestinationsAcrossSources !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Across all sources
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activeSources.length > 0
                    ? "bg-green-500/20"
                    : "bg-gray-500/20"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    activeSources.length > 0
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {activeSources.length > 0 ? "Streaming" : "Ready"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeSources.length > 0
                    ? `${activeSources.length} source${
                        activeSources.length !== 1 ? "s" : ""
                      } live`
                    : "All sources offline"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export default WelcomeSection;
