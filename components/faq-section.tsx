"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "How exactly does the computational offloading technology work?",
      answer:
        "Our technology creates a secure connection between your streaming software and our cloud infrastructure. When you start a stream, we handle the resource-intensive tasks of encoding, transcoding, and distributing your content to multiple platforms, while your local machine only needs to send a single high-quality stream to our servers.",
    },
    {
      question: "What kind of performance improvements can I expect?",
      answer:
        "Based on our beta testing, users typically see a 40-60% reduction in CPU usage and up to 30% improvement in local application performance. This varies depending on your hardware specifications and streaming configuration.",
    },
    {
      question: "What are the minimum system requirements?",
      answer:
        "NeuStream works with any system that can run standard streaming software. For optimal performance, we recommend at least a 10Mbps upload connection, Windows 10/11 or macOS 11+, and 8GB of RAM. Our technology is specifically designed to benefit users with mid-range hardware who want to achieve professional-level multi-streaming.",
    },
    {
      question: "When will NeuStream be officially launched?",
      answer:
        "We're targeting a Q2 2025 launch for our computational offloading feature. Waitlist members will receive early access starting in Q1 2025, with priority given to professional streamers and content creators.",
    },
    {
      question: "What will the pricing structure be?",
      answer:
        "We'll offer tiered pricing based on streaming quality and the number of simultaneous platforms. Exact pricing will be announced closer to launch, but waitlist members will receive special early-bird discounts and the option to lock in introductory rates for an extended period.",
    },
    {
      question: "Is my stream content secure when using your service?",
      answer:
        "Absolutely. We use end-to-end encryption for all stream data, and our infrastructure is built with security as a priority. We never store your actual stream content on our servers beyond the temporary processing required for distribution.",
    },
  ]

  return (
    <section id="faq" className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Learn more about our revolutionary computational offloading technology and upcoming launch.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-dm-sans text-lg">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}

