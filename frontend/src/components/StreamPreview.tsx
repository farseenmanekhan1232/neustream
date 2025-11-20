import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  PictureInPicture,
  Wifi,
  WifiOff,
  AlertCircle,
  VideoOff,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Spinner } from "./ui/spinner";
import { Progress } from "./ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

const StreamPreview = ({ streamKey, isActive }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const timeoutRef = useRef(null);
  const retryCountRef = useRef(0);
  const healthCheckRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);
  const [streamHealth, setStreamHealth] = useState("unknown"); // 'healthy', 'unhealthy', 'unknown'
  const [retryCount, setRetryCount] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Construct HLS URL - use nginx SSL proxy on port 443
  const hlsUrl = `https://stream.neustream.app/hls/live/${streamKey}/index.m3u8`;
  const mediaMtxApiUrl = `https://stream.neustream.app/api/v2/paths/${streamKey}/`;

  // HLS Health Check function
  const checkHlsHealth = async () => {
    try {
      const _ = await fetch(hlsUrl, {
        method: "HEAD",
        mode: "no-cors", // Handle CORS issues
      });
      return true; // If no error thrown, assume healthy
    } catch {
      // Try MediaMTX API as fallback health check
      try {
        const apiResponse = await fetch(mediaMtxApiUrl);
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          return data.source && data.source.ready; // Check if MediaMTX shows stream as ready
        }
      } catch (apiError) {
        console.log("MediaMTX API health check failed:", apiError);
      }
      return false;
    }
  };

  // Exponential backoff retry function
  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    setStreamHealth("unknown");

    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (healthCheckRef.current) {
      clearTimeout(healthCheckRef.current);
    }

    // Increment retry count
    const newRetryCount = retryCountRef.current + 1;
    retryCountRef.current = newRetryCount;
    setRetryCount(newRetryCount);

    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const backoffDelay = Math.min(Math.pow(2, newRetryCount - 1) * 1000, 10000);

    // Perform health check before retry
    const isHealthy = await checkHlsHealth();
    setStreamHealth(isHealthy ? "healthy" : "unhealthy");

    // If unhealthy, wait longer before retry
    const delay = isHealthy ? backoffDelay : Math.max(backoffDelay, 5000);

    setTimeout(() => {
      // Trigger re-initialization by forcing the effect to run again
      const video = videoRef.current;
      if (video) {
        video.src = "";
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      }
    }, delay);
  };

  // Set timeout and health monitoring
  useEffect(() => {
    if (isLoading && isActive) {
      // Reset and start progress animation
      setLoadingProgress(0);
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 5, 90));
      }, 200);

      // Start health check after 2 seconds
      healthCheckRef.current = setTimeout(async () => {
        const isHealthy = await checkHlsHealth();
        setStreamHealth(isHealthy ? "healthy" : "unhealthy");

        if (!isHealthy) {
          setError(
            "Stream health check failed. The stream may not be fully processed yet.",
          );
          setIsLoading(false);
          clearInterval(progressInterval);
        }
      }, 2000);

      // Set a timeout to handle cases where stream doesn't load
      timeoutRef.current = setTimeout(() => {
        setError(
          "Stream connection timeout. This usually means the stream is not broadcasting or HLS processing is delayed. Please start your streaming software first.",
        );
        setIsLoading(false);
        setStreamHealth("unhealthy");
        clearInterval(progressInterval);
      }, 20000); // 20 second timeout (increased from 15s)

      return () => {
        clearInterval(progressInterval);
      };
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (healthCheckRef.current) {
        clearTimeout(healthCheckRef.current);
      }
    };
  }, [isLoading, isActive]);

  useEffect(() => {
    if (!streamKey || !isActive) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);
    setStreamHealth("unknown");
    // Reset retry count on fresh load
    retryCountRef.current = 0;
    setRetryCount(0);

    // Load HLS.js dynamically
    const loadHls = async () => {
      try {
        const Hls = (await import("hls.js")).default;

        if (Hls.isSupported()) {
          // Clean up existing instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false, // Disable low latency for better compatibility
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            debug: false, // Enable debug logging in development
            // Add improved retry configuration
            fragLoadingTimeOut: 20000, // 20 seconds
            fragLoadingMaxRetry: 5, // Increased retry count
            manifestLoadingTimeOut: 15000, // 15 seconds
            manifestLoadingMaxRetry: 5, // Increased retry count
            levelLoadingTimeOut: 15000, // 15 seconds
            levelLoadingMaxRetry: 5, // Increased retry count
          });

          hlsRef.current = hls;

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoadingProgress(100);
            setIsLoading(false);
            setStreamHealth("healthy");
            // Auto-start with muted playback
            video.play().catch((err) => {
              console.log("Auto-play failed, user interaction required:", err);
            });
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            console.error("HLS Error:", data);
            if (data.fatal) {
              let errorMessage = "";
              let errorType = "";

              switch (data.details) {
                case Hls.ErrorDetails.MANIFEST_LOAD_ERROR:
                  if (data.response && data.response.code === 404) {
                    errorMessage =
                      "Stream endpoint not found (404). The stream may not be configured yet or is still starting up.";
                    errorType = "MANIFEST_404";
                  } else if (data.response && data.response.code === 403) {
                    errorMessage =
                      "Access denied (403). The stream may be private or not ready.";
                    errorType = "MANIFEST_403";
                  } else if (data.response && data.response.code === 0) {
                    errorMessage =
                      "Network error or CORS issue. The HLS endpoint may not be accessible from your browser.";
                    errorType = "MANIFEST_NETWORK";
                  } else {
                    errorMessage =
                      "Stream manifest unavailable. The stream may be starting up or not fully processed.";
                    errorType = "MANIFEST_UNAVAILABLE";
                  }
                  break;
                case Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT:
                  errorMessage =
                    "Stream manifest loading timed out. HLS processing may be delayed, please retry.";
                  errorType = "MANIFEST_TIMEOUT";
                  break;
                case Hls.ErrorDetails.MANIFEST_PARSING_ERROR:
                  errorMessage =
                    "Stream manifest is invalid or corrupted. This may be a temporary issue.";
                  errorType = "MANIFEST_PARSE";
                  break;
                case Hls.ErrorDetails.LEVEL_LOAD_ERROR:
                  errorMessage =
                    "Could not load stream quality levels. The stream quality configuration may be incomplete.";
                  errorType = "LEVEL_LOAD";
                  break;
                case Hls.ErrorDetails.LEVEL_LOAD_TIMEOUT:
                  errorMessage =
                    "Stream quality loading timed out. Try refreshing or checking your connection.";
                  errorType = "LEVEL_TIMEOUT";
                  break;
                case Hls.ErrorDetails.FRAG_LOAD_ERROR:
                  errorMessage =
                    "Could not load stream segments. The stream may be intermittent or connection unstable.";
                  errorType = "FRAGMENT_LOAD";
                  break;
                case Hls.ErrorDetails.FRAG_LOAD_TIMEOUT:
                  errorMessage =
                    "Stream segment loading timed out. Your connection may be slow or the stream unstable.";
                  errorType = "FRAGMENT_TIMEOUT";
                  break;
                default:
                  errorMessage =
                    "Stream playback error. The stream may not be active or there may be connection issues.";
                  errorType = "UNKNOWN";
              }

              // Update stream health based on error type
              if (
                errorType.includes("TIMEOUT") ||
                errorType.includes("NETWORK")
              ) {
                setStreamHealth("unhealthy");
              } else if (
                errorType.includes("404") ||
                errorType.includes("UNAVAILABLE")
              ) {
                setStreamHealth("unknown");
              }

              setError({
                message: errorMessage,
                type: errorType,
                retryable:
                  !errorType.includes("PARSE") && !errorType.includes("403"),
              });
              setIsLoading(false);
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          // Safari native HLS support
          video.src = hlsUrl;
          video.addEventListener("loadedmetadata", () => {
            setLoadingProgress(100);
            setIsLoading(false);
            setStreamHealth("healthy");
            video.play().catch((err) => {
              console.log("Auto-play failed, user interaction required:", err);
            });
          });

          video.addEventListener("error", () => {
            const errorCode = video.error ? video.error.code : "unknown";
            let errorMessage = "Safari HLS playback failed. ";
            let errorType = "SAFARI_ERROR";

            switch (errorCode) {
              case 1:
                errorMessage += "Loading was aborted.";
                break;
              case 2:
                errorMessage += "Network error occurred.";
                errorType = "SAFARI_NETWORK";
                break;
              case 3:
                errorMessage += "Stream decoding failed.";
                errorType = "SAFARI_DECODE";
                break;
              case 4:
                errorMessage += "Stream not found or not supported.";
                errorType = "SAFARI_NOT_FOUND";
                break;
              default:
                errorMessage += "Unknown playback error occurred.";
            }

            setStreamHealth("unhealthy");
            setError({
              message: errorMessage,
              type: errorType,
              retryable: errorCode !== 3 && errorCode !== 4,
            });
            setIsLoading(false);
          });
        } else {
          setError({
            message:
              "Your browser does not support HLS playback. Please try using Chrome, Firefox, Safari, or Edge.",
            type: "BROWSER_NOT_SUPPORTED",
            retryable: false,
          });
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load HLS.js:", err);
        setError({
          message:
            "Failed to load video player library. Please refresh the page.",
          type: "HLS_LIBRARY_ERROR",
          retryable: true,
        });
        setIsLoading(false);
      }
    };

    loadHls();

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamKey, isActive, hlsUrl]); // Remove error dependency to prevent infinite loops

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error("Play failed:", err);
        });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (!videoRef.current) return;

    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "m":
        e.preventDefault();
        toggleMute();
        break;
      case "f":
        e.preventDefault();
        toggleFullscreen();
        break;
      case "p":
        e.preventDefault();
        togglePiP();
        break;
      case "Escape":
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        break;
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((err) => {
        console.error("Fullscreen failed:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Handle picture-in-picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture-in-Picture failed:", err);
    }
  };

  // Update playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  if (!isActive) {
    return (
      <Card className="aspect-video bg-muted">
        <CardContent className="h-full flex items-center justify-center p-6">
          <div className="text-center text-muted-foreground">
            <VideoOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Stream is offline</p>
            <p className="text-sm">Start streaming to see preview</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card
        className="relative group h-full w-full bg-black overflow-hidden border-0"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="application"
        aria-label="Stream preview player"
      >
        <CardContent className="p-0 h-full">
          <div
            className="relative h-full"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              muted={isMuted}
              onClick={togglePlay}
              aria-label="Stream video player"
              role="application"
            />

            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                <Card className="max-w-sm w-full mx-4 bg-black/90 border-border">
                  <CardContent className="p-6">
                    <div className="text-center text-white space-y-4">
                      <Spinner size="xl" className="mx-auto" />
                      <div
                        className="space-y-3"
                        role="status"
                        aria-live="polite"
                      >
                        <p className="font-medium">Loading stream...</p>
                        <Progress
                          value={loadingProgress}
                          className="w-full h-2"
                          aria-label={`Loading progress: ${loadingProgress}%`}
                          aria-valuenow={loadingProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                        <p className="text-xs text-muted-foreground">
                          {loadingProgress < 30
                            ? "Connecting to stream..."
                            : loadingProgress < 60
                              ? "Loading media..."
                              : loadingProgress < 90
                                ? "Buffering..."
                                : "Almost ready..."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
                <Card className="max-w-md w-full">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <div className="flex items-center justify-center mb-2">
                          {error.type?.includes("NETWORK") ||
                          error.type?.includes("TIMEOUT") ? (
                            <WifiOff className="h-8 w-8" />
                          ) : error.type?.includes("404") ||
                            error.type?.includes("NOT_FOUND") ? (
                            <AlertCircle className="h-8 w-8" />
                          ) : (
                            <AlertCircle className="h-8 w-8" />
                          )}
                        </div>
                        <AlertDescription className="text-sm text-center">
                          {error.message || error}
                        </AlertDescription>
                      </Alert>

                      {/* Stream Health Indicator */}
                      {streamHealth !== "unknown" && (
                        <div className="flex justify-center">
                          <Badge
                            variant={
                              streamHealth === "healthy"
                                ? "default"
                                : "secondary"
                            }
                            className="px-3 py-1"
                          >
                            {streamHealth === "healthy" ? (
                              <div className="flex items-center">
                                <Wifi className="h-3 w-3 mr-1" />
                                Stream connection healthy
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <WifiOff className="h-3 w-3 mr-1" />
                                Stream connection unhealthy
                              </div>
                            )}
                          </Badge>
                        </div>
                      )}

                      <div
                        className="flex gap-2 justify-center"
                        role="group"
                        aria-label="Error actions"
                      >
                        {error.retryable !== false && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRetry}
                            className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            aria-label={`${retryCount > 0 ? `Retry loading stream (attempt ${retryCount})` : "Retry loading stream"}`}
                          >
                            {retryCount > 0
                              ? `Retry (${retryCount})`
                              : "Retry Loading"}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setError(null)}
                          className="focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          aria-label="Dismiss error message"
                        >
                          Dismiss
                        </Button>
                      </div>

                      {/* Contextual help based on error type */}
                      <Alert className="bg-muted border-muted">
                        <AlertDescription className="text-xs text-muted-foreground">
                          {error.type?.includes("404") && (
                            <>
                              The stream may still be starting up. HLS
                              processing can take up to 30 seconds after
                              beginning to broadcast.
                            </>
                          )}
                          {error.type?.includes("NETWORK") && (
                            <>
                              Check your internet connection and browser console
                              for CORS errors.
                            </>
                          )}
                          {error.type?.includes("TIMEOUT") && (
                            <>
                              The stream may be slow to respond or your
                              connection may be unstable.
                            </>
                          )}
                          {!error.type && (
                            <>
                              Make sure your streaming software (OBS,
                              Streamlabs, etc.) is actively broadcasting to the
                              correct RTMP URL.
                            </>
                          )}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Video Controls */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? "opacity-100" : "opacity-0"
              }`}
              role="toolbar"
              aria-label="Video player controls"
            >
              <div className="flex items-center justify-between text-white">
                {/* Left Controls */}
                <div
                  className="flex items-center space-x-2"
                  role="group"
                  aria-label="Playback controls"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePlay}
                        className="text-white hover:text-white hover:bg-white/20 focus:ring-2 focus:ring-white/50"
                        aria-label={isPlaying ? "Pause stream" : "Play stream"}
                        aria-pressed={isPlaying}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlaying ? "Pause" : "Play"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleMute}
                        className="text-white hover:text-white hover:bg-white/20 focus:ring-2 focus:ring-white/50"
                        aria-label={isMuted ? "Unmute stream" : "Mute stream"}
                        aria-pressed={isMuted}
                      >
                        {isMuted ? (
                          <VolumeX className="h-4 w-4" />
                        ) : (
                          <Volume2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isMuted ? "Unmute" : "Mute"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Right Controls */}
                <div
                  className="flex items-center space-x-2"
                  role="group"
                  aria-label="Display controls"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={togglePiP}
                        className="text-white hover:text-white hover:bg-white/20 focus:ring-2 focus:ring-white/50"
                        aria-label="Picture in Picture mode"
                      >
                        <PictureInPicture className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Picture in Picture</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="text-white hover:text-white hover:bg-white/20 focus:ring-2 focus:ring-white/50"
                        aria-label="Fullscreen mode"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Fullscreen</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Live Indicator with Health Status */}
            <div
              className="absolute top-4 left-4"
              aria-live="polite"
              aria-label="Stream status"
            >
              <Badge
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm font-medium"
                aria-label="Live stream"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="h-2 w-2 bg-white rounded-full animate-pulse"
                    aria-hidden="true"
                  ></div>
                  <span>LIVE</span>
                  {streamHealth !== "unknown" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center ml-2 cursor-help"
                          aria-label={`Stream connection: ${streamHealth}`}
                        >
                          {streamHealth === "healthy" ? (
                            <Wifi
                              className="h-3 w-3 text-green-300"
                              aria-hidden="true"
                            />
                          ) : (
                            <WifiOff
                              className="h-3 w-3 text-yellow-300 animate-pulse"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {streamHealth === "healthy"
                            ? "Stream connection healthy"
                            : "Stream connection issues"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </Badge>
            </div>

            {/* Click to play overlay (when paused) */}
            {!isPlaying && !isLoading && !error && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
                onClick={togglePlay}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    togglePlay();
                  }
                }}
                aria-label="Click to play stream"
              >
                <div className="text-white text-center">
                  <div className="h-16 w-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <p className="font-medium">Click to play</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default StreamPreview;
