import { Helmet } from "react-helmet-async";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Us - Neustream</title>
        <meta
          name="description"
          content="Learn about Neustream's mission to revolutionize multistreaming and our commitment to content creators."
        />
        <meta
          name="keywords"
          content="about neustream, multistreaming, live streaming, content creators, streaming platform"
        />
        <meta property="og:title" content="About Us - Neustream" />
        <meta
          property="og:description"
          content="Learn about Neustream's mission to revolutionize multistreaming and our commitment to content creators."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About Us - Neustream" />
        <meta
          name="twitter:description"
          content="Learn about Neustream's mission to revolutionize multistreaming and our commitment to content creators."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-4xl font-normal text-center mb-8">
            About Neustream
          </h1>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  Neustream is on a mission to revolutionize
                  multistreaming by providing content creators with a powerful,
                  intuitive platform to broadcast their content across multiple
                  streaming platforms simultaneously. We believe that great
                  content deserves maximum reach, and technical limitations
                  shouldn't hold creators back from connecting with their
                  audience wherever they are.
                </p>
                <p>
                  Founded by streaming enthusiasts and technology experts,
                  Neustream combines cutting-edge technology with a
                  deep understanding of what content creators need to succeed in
                  today's digital landscape.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  Neustream's service was born from a
                  simple observation: content creators were struggling with the
                  technical complexity of reaching audiences across multiple
                  platforms. Juggling different streaming software, managing
                  multiple accounts, and maintaining consistent quality across
                  platforms was becoming a barrier to growth.
                </p>
                <p className="mb-4">
                  Our team of developers and streaming enthusiasts set out to
                  solve this problem by creating a platform that handles the
                  technical heavy lifting, allowing creators to focus on what
                  they do best – creating engaging content.
                </p>
                <p>
                  Today, Neustream's service serves
                  thousands of content creators worldwide, helping them reach
                  millions of viewers across YouTube, Twitch, Facebook,
                  LinkedIn, and other major streaming platforms.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Technology</h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  At the core of Neustream's service is our
                  advanced computational offloading technology, which ensures
                  smooth, high-quality streaming across all platforms without
                  putting additional strain on the creator's hardware.
                </p>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Key Features:
                </h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Simultaneous streaming to multiple platforms</li>
                  <li>Low-latency transcoding and optimization</li>
                  <li>Real-time analytics and performance monitoring</li>
                  <li>Cross-platform chat aggregation</li>
                  <li>Advanced routing and load balancing</li>
                  <li>Enterprise-grade security and reliability</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Creator First
                  </h3>
                  <p className="text-muted-foreground">
                    Every decision we make is guided by what's best for content
                    creators. We're constantly gathering feedback and improving
                    our platform based on your needs.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Reliability
                  </h3>
                  <p className="text-muted-foreground">
                    We understand that every stream matters. Our infrastructure
                    is built for maximum uptime and performance, ensuring your
                    content reaches your audience without interruptions.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Innovation
                  </h3>
                  <p className="text-muted-foreground">
                    We're always pushing the boundaries of what's possible in
                    multistreaming. Our R&D team continuously explores new
                    technologies to improve your streaming experience.
                  </p>
                </div>
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Accessibility
                  </h3>
                  <p className="text-muted-foreground">
                    We believe powerful streaming tools should be accessible to
                    everyone, regardless of their technical expertise or budget.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  The Neustream team consists of passionate streaming
                  enthusiasts, experienced software engineers, and dedicated
                  support professionals who share a common goal: empowering
                  content creators to achieve their full potential.
                </p>
                <p>
                  With backgrounds in streaming technology, cloud
                  infrastructure, and user experience design, our team brings
                  together the expertise needed to deliver a world-class
                  multistreaming platform.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Join Our Community
              </h2>
              <div className="text-muted-foreground">
                <p className="mb-4">
                  We're more than just a platform – we're a community of
                  creators who believe in the power of great content. Join
                  thousands of streamers who are already using Neustream to
                  expand their reach and grow their audience.
                </p>
                <p>
                  Have questions or want to learn more? Reach out to our team or
                  check out our documentation to get started with multistreaming
                  today.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
