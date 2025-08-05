import { WaitlistForm } from "@/components/waitlist-form"

export function CtaSection() {
  return (
    <section id="contact" className="section-padding bg-primary text-primary-foreground">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-dm-sans">
            Be First in Line for the Future of Streaming
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join our exclusive waitlist today and receive early access to our computational offloading technology, plus
            special launch pricing and personalized onboarding support.
          </p>
        </div>

        <WaitlistForm />
      </div>
    </section>
  )
}

