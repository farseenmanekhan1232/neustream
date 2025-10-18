import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  PictureInPicture,
  Loader2,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "./ui/button";

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

  // Construct HLS URL - use nginx SSL proxy on port 443
  const hlsUrl = `https://stream.neustream.app/hls/${streamKey}/index.m3u8`;
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
      // Start health check after 2 seconds
      healthCheckRef.current = setTimeout(async () => {
        const isHealthy = await checkHlsHealth();
        setStreamHealth(isHealthy ? "healthy" : "unhealthy");

        if (!isHealthy) {
          setError(
            "Stream health check failed. The stream may not be fully processed yet."
          );
          setIsLoading(false);
        }
      }, 2000);

      // Set a timeout to handle cases where stream doesn't load
      timeoutRef.current = setTimeout(() => {
        setError(
          "Stream connection timeout. This usually means the stream is not broadcasting or HLS processing is delayed. Please start your streaming software first."
        );
        setIsLoading(false);
        setStreamHealth("unhealthy");
      }, 20000); // 20 second timeout (increased from 15s)
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
      video.play().then(() => setIsPlaying(true));
    } else {
      video.pause();
      setIsPlaying(false);
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
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="h-12 w-12 mx-auto mb-4 opacity-50">
            <svg
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p>Stream is offline</p>
          <p className="text-sm">Start streaming to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group aspect-video bg-black rounded-lg overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Loading stream...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white p-4 max-w-md">
            <div className="flex items-center justify-center mb-4">
              {error.type?.includes("NETWORK") ||
              error.type?.includes("TIMEOUT") ? (
                <WifiOff className="h-8 w-8 text-red-400" />
              ) : error.type?.includes("404") ||
                error.type?.includes("NOT_FOUND") ? (
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-400" />
              )}
            </div>
            <p className="text-red-400 mb-4 text-sm">
              {error.message || error}
            </p>

            {/* Stream Health Indicator */}
            {streamHealth !== "unknown" && (
              <div className="flex items-center justify-center mb-3 text-xs">
                {streamHealth === "healthy" ? (
                  <div className="flex items-center text-green-400">
                    <Wifi className="h-3 w-3 mr-1" />
                    Stream connection healthy
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-400">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Stream connection unhealthy
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-center">
              {error.retryable !== false && (
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  {retryCount > 0 ? `Retry (${retryCount})` : "Retry Loading"}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Dismiss
              </Button>
            </div>

            {/* Contextual help based on error type */}
            <p className="text-xs text-gray-400 mt-4">
              {error.type?.includes("404") && (
                <>
                  The stream may still be starting up. HLS processing can take
                  up to 30 seconds after beginning to broadcast.
                </>
              )}
              {error.type?.includes("NETWORK") && (
                <>
                  Check your internet connection and browser console for CORS
                  errors.
                </>
              )}
              {error.type?.includes("TIMEOUT") && (
                <>
                  The stream may be slow to respond or your connection may be
                  unstable.
                </>
              )}
              {!error.type && (
                <>
                  Make sure your streaming software (OBS, Streamlabs, etc.) is
                  actively broadcasting to the correct RTMP URL.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between text-white">
          {/* Left Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlay}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePiP}
              className="text-white hover:text-white hover:bg-white/20"
              title="Picture in Picture"
            >
              <PictureInPicture className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:text-white hover:bg-white/20"
              title="Fullscreen"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Live Indicator with Health Status */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
          <span>LIVE</span>
          {streamHealth !== "unknown" && (
            <div className="flex items-center ml-2">
              {streamHealth === "healthy" ? (
                <Wifi
                  className="h-3 w-3 text-green-300"
                  title="Stream connection healthy"
                />
              ) : (
                <WifiOff
                  className="h-3 w-3 text-yellow-300 animate-pulse"
                  title="Stream connection issues"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Click to play overlay (when paused) */}
      {!isPlaying && !isLoading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30"
          onClick={togglePlay}
        >
          <div className="text-white text-center">
            <div className="h-16 w-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <Play className="h-8 w-8 ml-1" />
            </div>
            <p>Click to play</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamPreview;
