import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Video,
  Radio,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to NeuStream!",
    description:
      "Let's set up your first stream in just a few simple steps. This will help you get started quickly.",
    icon: Zap,
  },
  {
    title: "Create Your Stream Source",
    description:
      "First, you need to create a stream source. This is what you'll connect your broadcasting software to (like OBS or Streamlabs).",
    icon: Video,
    action: {
      label: "Add Stream Source",
      href: "/dashboard/streaming",
    },
  },
  {
    title: "Add Streaming Platforms",
    description:
      "Connect your streaming platforms like YouTube, Twitch, or Facebook. You can add multiple platforms to multistream!",
    icon: Radio,
    action: {
      label: "Configure Platforms",
      href: "/dashboard/streaming",
    },
  },
  {
    title: "You're All Set!",
    description:
      "Your stream is ready to go! Start your stream in your broadcasting software and watch it appear on all your connected platforms.",
    icon: CheckCircle,
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  currentStep?: number;
}

export default function OnboardingTour({
  isOpen,
  onClose,
  onComplete,
  currentStep = 0,
}: OnboardingTourProps) {
  const [step, setStep] = useState(currentStep);
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();

  const progress = ((step + 1) / onboardingSteps.length) * 100;
  const currentStepData = onboardingSteps[step];
  const Icon = currentStepData.icon;
  const isLastStep = step === onboardingSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simulate completion
    await new Promise((resolve) => setTimeout(resolve, 500));
    onComplete();
    setIsCompleting(false);
    onClose();
  };

  const handleAction = () => {
    if (currentStepData.action?.href) {
      navigate(currentStepData.action.href);
    } else if (currentStepData.action?.onClick) {
      currentStepData.action.onClick();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-left text-xl">
                {currentStepData.title}
              </DialogTitle>
              <div className="mt-2">
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-muted-foreground mt-1">
                  Step {step + 1} of {onboardingSteps.length}
                </p>
              </div>
            </div>
          </div>
          <DialogDescription className="text-left text-base leading-relaxed">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {step === 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">What you'll learn:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>How to create your first stream source</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>How to add multiple streaming platforms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>How to start streaming to all platforms</span>
                </li>
              </ul>
            </div>
          )}

          {step === 1 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-2">
                💡 Quick Tip
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Stream sources act as a central hub. Your broadcasting software
                connects here, and we handle the rest!
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <h4 className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-2">
                🎯 Pro Tip
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                You can start with one platform and add more later. No limits on
                how many you add!
              </p>
            </div>
          )}

          {isLastStep && (
            <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-sm text-green-900 dark:text-green-100 mb-2">
                🎉 You're Ready!
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                Need help later? Check out our{" "}
                <a
                  href="/help"
                  className="underline font-medium hover:no-underline"
                >
                  setup guide
                </a>{" "}
                anytime.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStepData.action && !isLastStep && (
              <Button variant="outline" size="sm" onClick={handleAction}>
                {currentStepData.action.label}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              disabled={isCompleting}
              className={cn("min-w-[80px]")}
            >
              {isCompleting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLastStep ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const completed = localStorage.getItem("neustream_onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    } else {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
    localStorage.setItem("neustream_onboarding_completed", "true");
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    setShowOnboarding(false);
    localStorage.removeItem("neustream_onboarding_completed");
  };

  return {
    hasCompletedOnboarding,
    showOnboarding,
    setShowOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
