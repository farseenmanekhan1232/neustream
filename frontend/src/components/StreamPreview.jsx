import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, PictureInPicture, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const StreamPreview = ({ streamKey, isActive }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showControls, setShowControls] = useState(false);

  // Construct HLS URL - use your media server domain
  const hlsUrl = `https://stream.neustream.app:8888/${streamKey}/index.m3u8`;

  useEffect(() => {
    if (!streamKey || !isActive) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setError(null);

    // Load HLS.js dynamically
    const loadHls = async () => {
      try {
        const Hls = (await import('hls.js')).default;

        if (Hls.isSupported()) {
          // Clean up existing instance
          if (hlsRef.current) {
            hlsRef.current.destroy();
          }

          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5
          });

          hlsRef.current = hls;

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false);
            // Auto-start with muted playback
            video.play().catch(err => {
              console.log('Auto-play failed, user interaction required:', err);
            });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data);
            if (data.fatal) {
              setError('Stream load failed. Please check if the stream is active.');
              setIsLoading(false);
            }
          });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          video.src = hlsUrl;
          video.addEventListener('loadedmetadata', () => {
            setIsLoading(false);
            video.play().catch(err => {
              console.log('Auto-play failed, user interaction required:', err);
            });
          });

          video.addEventListener('error', () => {
            setError('Stream load failed. Please check if the stream is active.');
            setIsLoading(false);
          });

        } else {
          setError('Your browser does not support HLS playback.');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to load HLS.js:', err);
        setError('Failed to load video player.');
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
  }, [streamKey, isActive, hlsUrl]);

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
      video.requestFullscreen().catch(err => {
        console.error('Fullscreen failed:', err);
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
      console.error('Picture-in-Picture failed:', err);
    }
  };

  // Update playing state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  if (!isActive) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="h-12 w-12 mx-auto mb-4 opacity-50">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
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
          <div className="text-center text-white p-4">
            <p className="text-red-400 mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
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
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="text-white hover:text-white hover:bg-white/20"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
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

      {/* Live Indicator */}
      <div className="absolute top-4 left-4">
        <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
          <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
          <span>LIVE</span>
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