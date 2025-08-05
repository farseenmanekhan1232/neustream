import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      description: "Perfect for new streamers looking to expand their reach",
      features: [
        "Stream to 3 platforms simultaneously",
        "Basic analytics dashboard",
        "720p streaming quality",
        "Email support",
        "5 hours of cloud recording per month",
      ],
      cta: "Start Streaming",
      popular: false,
    },
    {
      name: "Pro",
      price: "$79",
      description: "For growing streamers who need more power and flexibility",
      features: [
        "Stream to 5 platforms simultaneously",
        "Advanced analytics and insights",
        "1080p streaming quality",
        "Priority email and chat support",
        "20 hours of cloud recording per month",
        "Custom RTMP destinations",
        "Overlays and stream graphics",
      ],
      cta: "Go Pro",
      popular: true,
    },
    {
      name: "Business",
      price: "$199",
      description: "For professional streamers and organizations",
      features: [
        "Unlimited multi-streaming",
        "Comprehensive analytics suite",
        "4K streaming quality",
        "24/7 priority support",
        "Unlimited cloud recording",
        "White-label service",
        "API access for custom integrations",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ]

  return (
    <section id="pricing" className="section-padding bg-muted/30">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your <span className="gradient-text">Streaming Plan</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Flexible options to support your streaming journey, from newcomers to established professionals.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card rounded-xl p-8 border ${plan.popular ? "ring-2 ring-primary shadow-lg relative" : "shadow-sm"}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-1">/month</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

