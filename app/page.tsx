import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { ComingSoonBanner } from "@/components/coming-soon-banner"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <ComingSoonBanner />
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
         
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}

