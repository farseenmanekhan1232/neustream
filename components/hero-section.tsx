"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-10">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="text-xs font-semibold uppercase tracking-wide">Coming Soon</span>
            <span className="mx-2">|</span>
            <span className="text-muted-foreground">Launch Date: Q2 2025</span>
          </div>

          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight lg:leading-tight">
              Stream Without <span className="gradient-text">Hardware Limitations</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-dm-sans">
              NeuStream offloads computational burden from your system, letting you stream to multiple platforms
              simultaneously without sacrificing performance or creative quality.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button
              size="lg"
              className="w-full"
              onClick={() => document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" })}
            >
              Join the Waitlist
            </Button>
            <Button size="lg" variant="outline" className="w-full group">
              <span>Watch Demo</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="pt-8 md:pt-12">
            <p className="text-sm text-muted-foreground mb-4">Seamlessly integrate with your favorite platforms</p>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-70">
              {["Twitch", "YouTube", "Facebook", "TikTok", "Instagram"].map((platform) => (
                <div key={platform} className="text-lg font-semibold font-dm-sans">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

