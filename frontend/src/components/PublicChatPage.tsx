import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import PublicChat from "./PublicChat";
import { Card, CardContent } from "./ui/card";

function PublicChatPage() {
  const { sourceId } = useParams();
  const [searchParams] = useSearchParams();
  const [isValidSource, setIsValidSource] = useState<boolean | null>(null);

  // URL parameters for OBS customization
  const backgroundColor = searchParams.get("background") || "default";
  const rawMode = searchParams.get("raw") === "true";
  const transparent = searchParams.get("transparent") === "true";
  const showHeader = searchParams.get("header") !== "false";

  // Validate source ID (basic validation - in production, you'd want to check if it exists)
  useEffect(() => {
    if (sourceId && sourceId.length > 0) {
      setIsValidSource(true);
    } else {
      setIsValidSource(false);
    }
  }, [sourceId]);

  // Determine background style based on parameters
  const getBackgroundStyle = () => {
    if (transparent) {
      return { backgroundColor: "transparent" };
    }

    if (backgroundColor === "green") {
      return { backgroundColor: "#10b981" }; // Tailwind green-500
    }

    return {}; // Use default card background
  };

  if (isValidSource === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (!isValidSource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h3 className="text-xl font-semibold mb-2">Invalid Stream Source</h3>
          <p className="text-muted-foreground mb-4">
            Please check your stream source ID and try again.
          </p>
        </div>
      </div>
    );
  }

  if (rawMode) {
    return (
      <div className="min-h-screen p-4" style={getBackgroundStyle()}>
        <PublicChat
          sourceId={sourceId}
          showHeader={false}
          backgroundColor={backgroundColor}
          transparent={transparent}
          rawMode={true}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 flex items-center justify-center"
      style={getBackgroundStyle()}
    >
      <Card className="w-full max-w-md h-[600px]">
        <CardContent className="p-0 h-full">
          <PublicChat
            sourceId={sourceId}
            showHeader={showHeader}
            backgroundColor={backgroundColor}
            transparent={transparent}
            rawMode={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default PublicChatPage;
