import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Battery, RotateCcw, Zap, ZapOff } from "lucide-react";

const CamcorderViewfinder = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const formatDate = (date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date
      .getDate()
      .toString()
      .padStart(2, "0")} ${date.getFullYear()}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const batteryLevel = 85;
  const isRecording = true;

  // Mobile View - Smartphone Camera UI
  if (isMobile) {
    return (
      <div className="absolute inset-0 pointer-events-none z-[60]">
        {/* Vignette overlay for smartphone camera effect */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)",
          }}
        />

        {/*REC Indicator - Top Center */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <motion.div
            className="flex items-center gap-2"
            animate={{
              opacity: isRecording ? [1, 0.4, 1] : 1,
            }}
            transition={{
              duration: 0.8,
              repeat: isRecording ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <div className="w-2 h-2 bg-red-600 rounded-full" />
            <span className="text-red-600 font-bold text-sm tracking-wider">
              REC
            </span>
          </motion.div>
        </div>

        {/* Camera Modes - Bottom */}
        <div className="absolute bottom-28 left-0 right-0">
          <div className="flex justify-center items-center gap-8">
            <div className="text-white/60 text-sm">PHOTO</div>
            <div className="text-white text-base font-semibold border-b-2 border-white pb-1">
              VIDEO
            </div>
            <div className="text-white/60 text-sm">MORE</div>
          </div>
        </div>

        {/* Shutter Button - Bottom Center */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-red-600" />
          </div>
        </div>

        {/* Thumbnail - Bottom Left */}
        <div className="absolute bottom-8 left-6">
          <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/30">
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-white text-xs">▶</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop View - Camcorder Viewfinder UI
  return (
    <div className="absolute inset-0 pointer-events-none z-[60]">
      {/* Vignette overlay for viewfinder effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)",
        }}
      />

      {/* 3x3 Grid Overlay */}
      <div className="absolute inset-0">
        {/* Vertical lines */}
        <div className="absolute left-1/3 top-0 w-px h-full bg-white/50" />
        <div className="absolute left-2/3 top-0 w-px h-full bg-white/50" />
        {/* Horizontal lines */}
        <div className="absolute top-1/3 left-0 h-px w-full bg-white/50" />
        <div className="absolute top-2/3 left-0 h-px w-full bg-white/50" />
      </div>

      {/* Corner Brackets - Top Left */}
      <div className="absolute top-12 left-12">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-12 h-1 bg-white" />
          <div className="absolute top-0 left-0 w-1 h-12 bg-white" />
        </div>
      </div>

      {/* Corner Brackets - Top Right */}
      <div className="absolute top-12 right-12">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 right-0 w-12 h-1 bg-white" />
          <div className="absolute top-0 right-0 w-1 h-12 bg-white" />
        </div>
      </div>

      {/* Corner Brackets - Bottom Left */}
      <div className="absolute bottom-12 left-12">
        <div className="relative w-24 h-24">
          <div className="absolute bottom-0 left-0 w-12 h-1 bg-white" />
          <div className="absolute bottom-0 left-0 w-1 h-12 bg-white" />
        </div>
      </div>

      {/* Corner Brackets - Bottom Right */}
      <div className="absolute bottom-12 right-12">
        <div className="relative w-24 h-24">
          <div className="absolute bottom-0 right-0 w-12 h-1 bg-white" />
          <div className="absolute bottom-0 right-0 w-1 h-12 bg-white" />
        </div>
      </div>

      {/* REC Indicator - Top Left */}
      <div className="absolute top-16 left-40 flex items-center gap-3">
        <motion.div
          className="flex items-center gap-3"
          animate={{
            opacity: isRecording ? [1, 0.4, 1] : 1,
          }}
          transition={{
            duration: 0.8,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
        >
          <div className="w-4 h-4 bg-red-600 rounded-full" />
          <span className="text-red-600 font-bold text-2xl tracking-wider">
            REC
          </span>
        </motion.div>
      </div>

      {/* Battery Indicator - Top Right */}
      <div className="absolute top-16 right-40 flex items-center gap-2">
        <div className="flex items-center gap-2">
          <Battery className="w-8 h-8 text-white" />
          <span className="text-white font-mono text-lg">{batteryLevel}%</span>
        </div>
      </div>

      {/* Time and Date - Bottom Left */}
      <div className="absolute bottom-16 left-48">
        <div className="text-white font-mono text-sm">
          {formatDate(currentTime)}
        </div>
        <div className="text-white font-mono text-lg font-bold mt-1">
          {formatTime(currentTime)}
        </div>
      </div>

      {/* Additional Viewfinder Info - Bottom Right */}
      <div className="absolute bottom-16 right-48">
        <div className="text-white font-mono text-sm text-right">
          <div>1080p 60fps</div>
          <div className="text-white text-lg mt-1">1.0x</div>
        </div>
      </div>
    </div>
  );
};

export default CamcorderViewfinder;
