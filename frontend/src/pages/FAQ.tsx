import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, Zap, Shield, Users } from "lucide-react";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      category: "Getting Started",
      icon: <Zap className="h-5 w-5" />,
      questions: [
        {
          question: "What is Neustream?",
          answer:
            "Neustream is a multistreaming platform that allows you to broadcast your live content simultaneously to multiple streaming platforms like YouTube, Twitch, Facebook, and LinkedIn from a single source.",
        },
        {
          question: "How do I get started with Neustream?",
          answer:
            "Simply sign up for an account, connect your streaming accounts, configure your stream settings, and start multistreaming. Our guided setup process makes it easy to get started in minutes.",
        },
        {
          question: "What platforms can I stream to?",
          answer:
            "Currently, Neustream supports YouTube, Twitch, Facebook, and LinkedIn. We're constantly adding new platforms based on user demand.",
        },
        {
          question: "Do I need special software or hardware?",
          answer:
            "No! Neustream handles all the technical complexity. You just need your normal streaming software (like OBS, Streamlabs, etc.) and an internet connection.",
        },
      ],
    },
    {
      category: "Pricing & Billing",
      icon: <Shield className="h-5 w-5" />,
      questions: [
        {
          question: "Is there a free trial?",
          answer:
            "Yes! We offer a free trial period for new users to test our platform. Check our current plans page for the latest trial information.",
        },
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept all major credit cards, debit cards, and digital payment methods through our secure payment processing system.",
        },
        {
          question: "Can I change or cancel my subscription?",
          answer:
            "Yes, you can upgrade, downgrade, or cancel your subscription at any time through your dashboard. Changes take effect at the next billing cycle.",
        },
        {
          question: "Are there any hidden fees?",
          answer:
            "No hidden fees. The price you see is the price you pay. All platform features included in your plan are available without additional charges.",
        },
      ],
    },
    {
      category: "Technical Support",
      icon: <HelpCircle className="h-5 w-5" />,
      questions: [
        {
          question: "What internet speed do I need?",
          answer:
            "We recommend at least 10 Mbps upload speed for HD streaming. For 4K streaming, you'll need 25+ Mbps upload speed. Your connection should be stable for best results.",
        },
        {
          question: "What if one platform goes down?",
          answer:
            "Neustream has built-in redundancy. If one streaming platform experiences issues, your stream will continue on other platforms without interruption.",
        },
        {
          question: "Can I stream from mobile devices?",
          answer:
            "Yes! You can stream from mobile devices using compatible streaming apps that connect to Neustream. We also have mobile apps planned for the future.",
        },
        {
          question: "How do I troubleshoot connection issues?",
          answer:
            "Check our troubleshooting guide in the help center, verify your internet speed, ensure all platform connections are active, and contact support if issues persist.",
        },
      ],
    },
    {
      category: "Features & Limits",
      icon: <Users className="h-5 w-5" />,
      questions: [
        {
          question: "Is there a limit to viewers?",
          answer:
            "No, Neustream doesn't limit your viewers. The only limits are those set by the individual streaming platforms you're streaming to.",
        },
        {
          question: "Can I monetize my streams?",
          answer:
            "Absolutely! You can monetize your streams according to each platform's individual monetization policies. Neustream doesn't interfere with your earnings.",
        },
        {
          question: "Do you support chat integration?",
          answer:
            "Yes, we aggregate chat messages from all connected platforms into one unified chat interface, making it easier to interact with your entire audience.",
        },
        {
          question: "Can I record my streams?",
          answer:
            "Stream recording depends on the settings of each platform you're streaming to. Most platforms offer recording options that work alongside Neustream.",
        },
      ],
    },
  ];

  const filteredFAQs = faqData
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>FAQ - Neustream</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about Neustream's multistreaming platform, pricing, features, and support."
        />
        <meta
          name="keywords"
          content="FAQ, neustream help, multistreaming questions, streaming support, customer service"
        />
        <meta property="og:title" content="FAQ - Neustream" />
        <meta
          property="og:description"
          content="Find answers to frequently asked questions about Neustream's multistreaming platform, pricing, features, and support."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="FAQ - Neustream" />
        <meta
          name="twitter:description"
          content="Find answers to frequently asked questions about Neustream's multistreaming platform, pricing, features, and support."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Find quick answers to common questions about Neustream's
            multistreaming platform.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search FAQ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No questions found matching your search.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFAQs.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {category.icon}
                    {category.category}
                  </CardTitle>
                  <CardDescription>
                    {category.questions.length} question
                    {category.questions.length !== 1 ? "s" : ""} in this
                    category
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${index}-${faqIndex}`}
                      >
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contact Support */}
        <Card className="mt-12">
          <CardContent className="pt-6">
            <div className="text-center">
              <HelpCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our support team is
                here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Contact Support
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                >
                  Go to Dashboard
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Resources */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Getting Started Guide</CardTitle>
              <CardDescription>
                Step-by-step tutorial to help you start multistreaming.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/docs/getting-started"
                className="text-primary hover:underline text-sm"
              >
                Read Guide →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Settings</CardTitle>
              <CardDescription>
                Learn how to configure different streaming platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/docs/platforms"
                className="text-primary hover:underline text-sm"
              >
                Configure Platforms →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Troubleshooting</CardTitle>
              <CardDescription>
                Common issues and how to resolve them quickly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="/docs/troubleshooting"
                className="text-primary hover:underline text-sm"
              >
                Fix Issues →
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
