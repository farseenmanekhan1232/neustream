import { ArrowRightLeft, BarChart3, Cog, Key, Shield, Zap } from "lucide-react"

export function FeatureSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything You Need for RTMP Streaming
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              NeuStream provides a comprehensive set of tools to manage, process, and distribute your RTMP streams with
              ease.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Unified Stream Key</h3>
            <p className="text-center text-muted-foreground">
              Use a single RTMP URL and stream key to manage multiple destinations.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <ArrowRightLeft className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Multi-Destination Streaming</h3>
            <p className="text-center text-muted-foreground">
              Stream to multiple platforms simultaneously with custom configurations.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Cog className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Custom Quality Settings</h3>
            <p className="text-center text-muted-foreground">
              Configure individual quality settings for each destination.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Stream Analytics</h3>
            <p className="text-center text-muted-foreground">
              Monitor performance metrics and viewer statistics in real-time.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Secure Streaming</h3>
            <p className="text-center text-muted-foreground">
              End-to-end encryption and secure authentication for your streams.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
            <div className="rounded-full bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Low Latency</h3>
            <p className="text-center text-muted-foreground">
              Optimized for minimal delay between source and destination.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

