import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MessageSquare, HelpCircle, Github, Twitter } from "lucide-react";
import { apiService } from "@/services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("");

    try {
      const response = await apiService.post("/contact", formData);

      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });

      console.log("Contact submission successful:", response);
    } catch (error) {
      console.error("Contact submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us - Neustream</title>
        <meta name="description" content="Get in touch with the Neustream team for support, questions, or feedback about our multistreaming platform." />
        <meta name="keywords" content="contact neustream, support, help, customer service, streaming support" />
        <meta property="og:title" content="Contact Us - Neustream" />
        <meta property="og:description" content="Get in touch with the Neustream team for support, questions, or feedback about our multistreaming platform." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Us - Neustream" />
        <meta name="twitter:description" content="Get in touch with the Neustream team for support, questions, or feedback about our multistreaming platform." />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-normal mb-4">Contact Us</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have questions about Neustream? Need help with your streams? We're here to help.
            Reach out through any of the channels below or send us a message.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm font-medium mb-1 block">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-medium mb-1 block">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="text-sm font-medium mb-1 block">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium mb-1 block">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Tell us more about your question or issue..."
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>

                {submitStatus === "success" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md dark:bg-green-900/20 dark:border-green-800">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </div>
                )}

                {submitStatus === "error" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
                    <p className="text-red-800 dark:text-red-200 text-sm">
                      Oops! Something went wrong. Please try again later.
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Get in Touch
                </CardTitle>
                <CardDescription>
                  Choose the best way to reach us for your specific needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">farseen@neustream.app</p>
                    <p className="text-sm text-muted-foreground">For general support and inquiries</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">Help Center</h4>
                    <p className="text-sm text-muted-foreground">Check our FAQ for quick answers</p>
                    <a href="/faq" className="text-sm text-primary hover:underline">
                      Visit FAQ →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Hours</CardTitle>
                <CardDescription>
                  Our team is available to help you during these hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="text-muted-foreground">9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="text-muted-foreground">10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="text-muted-foreground">Limited Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
                <CardDescription>
                  Stay updated with the latest features and announcements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <a
                    href="https://twitter.com/neustream"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                  <a
                    href="https://github.com/neustream"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span className="text-sm">GitHub</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-normal mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mb-6">
            Find quick answers to common questions about Neustream.
          </p>
          <Button asChild variant="outline">
            <a href="/faq">Browse FAQ</a>
          </Button>
        </div>
      </div>
    </div>
  );
}