import Image from "next/image"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "I used to struggle with frame drops when streaming to multiple platforms. With NeuStream's beta, I can now stream to Twitch, YouTube, and Facebook simultaneously while maintaining 144 FPS in my games.",
      author: "Alex Chen",
      role: "Professional Esports Streamer",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "The difference is night and day. My CPU usage dropped from 85% to under 40% when using NeuStream, and I can finally run my design software alongside my streams without any performance issues.",
      author: "Samantha Lee",
      role: "Creative Content Creator",
      avatar: "/placeholder.svg?height=80&width=80",
    },
    {
      quote:
        "As someone who streams business webinars across multiple platforms, reliability is everything. NeuStream's beta has not only improved my system's performance but has given me peace of mind with its consistent uptime.",
      author: "Michael Johnson",
      role: "Business Coach & Educator",
      avatar: "/placeholder.svg?height=80&width=80",
    },
  ]

  return (
    <section id="testimonials" className="section-padding">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="gradient-text">Beta Testers Say</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Early access users are already experiencing the benefits of our computational offloading technology.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-xl p-6 border shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>
              <blockquote className="mb-6">
                <p className="italic">"{testimonial.quote}"</p>
              </blockquote>
              <div className="flex items-center">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.author}
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <div>
                  <div className="font-bold">{testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

