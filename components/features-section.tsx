import { Zap, BarChart3, Cpu, Shield, Palette, Globe } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Cpu className="h-10 w-10 text-primary" />,
      title: "Cloud-Powered Processing",
      description:
        "Our servers handle the heavy computational load of multi-streaming, reducing CPU usage on your machine by up to 60%.",
    },
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Zero-Lag Performance",
      description:
        "Maintain high frame rates in your games or creative applications while streaming to multiple platforms simultaneously.",
    },
    {
      icon: <Palette className="h-10 w-10 text-primary" />,
      title: "Creative Freedom",
      description:
        "Run resource-intensive applications alongside your streams without compromising quality or performance.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Unified Analytics Dashboard",
      description:
        "Track viewer engagement, growth metrics, and performance statistics across all platforms in one place.",
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "99.9% Uptime Guarantee",
      description:
        "Our distributed infrastructure ensures your streams stay live even if individual servers experience issues.",
    },
    {
      icon: <Globe className="h-10 w-10 text-primary" />,
      title: "Global CDN Integration",
      description:
        "Deliver high-quality streams to viewers worldwide with minimal latency through our optimized content delivery network.",
    },
  ]

  return (
    <section id="features" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for <span className="gradient-text">Professional Streamers</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our cloud-based computational offloading technology transforms your streaming workflow, giving you the power
            to do more with your existing hardware.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

