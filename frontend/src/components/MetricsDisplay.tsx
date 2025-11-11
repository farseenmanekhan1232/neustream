import { useState, useEffect, ReactNode } from "react";

interface Metrics {
  cpu: number;
  fps: number;
  bitrate: number;
}

interface MetricCardProps {
  label: string;
  value: number;
  formatter: (value: number) => ReactNode;
  colorClass: string;
}

const MetricsDisplay = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    cpu: 15,
    fps: 60,
    bitrate: 4800,
  });

  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    // Start the simulation after a short delay to avoid immediate animation
    const startTimer = setTimeout(() => {
      setIsActive(true);
    }, 500);

    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setMetrics((prev) => ({
        // CPU: 8-25% range with realistic fluctuations
        cpu: Math.max(8, Math.min(12, prev.cpu + (Math.random() - 0.5) * 6)),
        // FPS: 58-62 range (very stable, minimal variation)
        fps: Math.max(58, Math.min(62, 60 + (Math.random() - 0.5) * 2)),
        // Bitrate: 4200-4800 kbps range with gradual changes
        bitrate: Math.max(
          4800,
          Math.min(6500, prev.bitrate + (Math.random() - 0.5) * 200),
        ),
      }));
    }, 500); // Update every 1.5 seconds for smooth, realistic changes

    return () => clearInterval(interval);
  }, [isActive]);

  const formatCpu = (value: number): ReactNode => (
    <>
      {`${value.toFixed(1)}`}
      <span className="max-md:text-xs">%</span>
    </>
  );
  const formatFps = (value: number): ReactNode => (
    <>
      {`${Math.round(value)} `} <span className="max-md:text-xs"> FPS</span>
    </>
  );
  const formatBitrate = (value: number): ReactNode => (
    <>
      {`${Math.round(value)} `}
      <span className="max-md:text-xs">kbps</span>
    </>
  );

  const MetricCard = ({
    label,
    value,
    formatter,
    colorClass,
  }: MetricCardProps) => (
    <div className="bg-white rounded-lg px-2.5 py-3 lg:p-4  transition-all duration-300 hover:border-gray-600">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs md:text-sm font-medium">
          {label}
        </span>
        <div
          className={`w-2 h-2 rounded-full ${colorClass} animate-pulse`}
        ></div>
      </div>
      <div className="text-lg md:text-2xl font-mono font-bold text-black/70">
        {formatter(value)}
      </div>
      <div className="mt-1 h-1 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClass.replace("bg-", "bg-opacity-80 bg-")} transition-all duration-1000 ease-out`}
          style={{
            width: `${Math.min(100, (value / (label === "CPU Usage" ? 100 : label === "Frame Rate" ? 70 : 6000)) * 100)}%`,
          }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-1 lg:gap-4">
        <MetricCard
          label="CPU Usage"
          value={metrics.cpu}
          formatter={formatCpu}
          colorClass="bg-blue-500"
        />
        <MetricCard
          label="Frame Rate"
          value={metrics.fps}
          formatter={formatFps}
          colorClass="bg-green-500"
        />
        <MetricCard
          label="Bitrate"
          value={metrics.bitrate}
          formatter={formatBitrate}
          colorClass="bg-purple-500"
        />
      </div>
    </div>
  );
};

export default MetricsDisplay;
