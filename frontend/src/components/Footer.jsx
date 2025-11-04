import { Link } from "react-router-dom";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/10 py-12 md:py-16">
      <div className="container-custom">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-12">
          <div>
            <h3 className="text-lg font-normal mb-4">Techmorph Technology</h3>
            <p className="">
              Revolutionizing multi-platform streaming with advanced
              computational offloading technology. Empowering content creators
              to focus on what matters most.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-normal mb-4">Platform</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className=" hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="#features"
                  className=" hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <Link
                  to="/auth"
                  className=" hover:text-foreground transition-colors"
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-normal mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/about"
                  className=" hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className=" hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className=" hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-normal mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/privacy"
                  className=" hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className=" hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className=" pt-8 flex flex-col md:flex-row justify-between items-start">
          <div className="flex flex-col space-y-4 mb-4 md:mb-0">
            <div className="flex flex-wrap items-center gap-3 opacity-70">
              <a
                href="https://www.producthunt.com/products/neustream?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-neustream"
                target="_blank"
                rel="noopener noreferrer"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1033369&theme=light&t=1762067006843"
                  alt="Neustream - Multi&#0045;platform&#0032;streaming | Product Hunt"
                  style={{ width: "120px", height: "26px" }}
                  width="120"
                  height="26"
                />
              </a>
              <a
                href="https://peerlist.io/farseen/project/neustream--multiplatform-streaming"
                target="_blank"
                rel="noreferrer"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://peerlist.io/api/v1/projects/embed/PRJHKKDDN7MNQBRKD1ORNA9KDB6B8G?showUpvote=true&theme=light"
                  alt="Neustream - Multi-Platform Streaming"
                  style={{ width: "auto", height: "26px" }}
                />
              </a>
              <a
                href="https://shipybara.com/projects/neustream"
                target="_blank"
                rel="noopener"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://shipybara.com/images/badges/shipybara-badge-light.svg"
                  alt="Featured on Shipybara"
                  width="75"
                  height="26"
                />
              </a>
              <a
                href="https://startupfa.me/s/neustream?utm_source=neustream.app"
                target="_blank"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://startupfa.me/badges/featured/default.webp"
                  alt="NeuStream - Featured on Startup Fame"
                  width="85"
                  height="26"
                />
              </a>
              <a
                href="https://twelve.tools"
                target="_blank"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://twelve.tools/badge0-white.svg"
                  alt="Featured on Twelve Tools"
                  width="100"
                  height="26"
                />
              </a>
              <a
                href="https://fazier.com/launches/neustream.app"
                target="_blank"
                className="transform transition-transform hover:scale-105 hover:opacity-100"
              >
                <img
                  src="https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=featured&theme=light"
                  width="120"
                  height="26"
                  alt="Fazier badge"
                />
              </a>
            </div>
            <p className="text-sm">
              © {currentYear} Techmorph Technology. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6 mt-auto">
            <a
              href="https://twitter.com/farsn_"
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:text-foreground"
            >
              <span className="sr-only">Twitter</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-twitter"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/neustream"
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:text-foreground"
            >
              <span className="sr-only">LinkedIn</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-linkedin"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a
              href="https://github.com/farseenmanekhan1232"
              target="_blank"
              rel="noopener noreferrer"
              className=" hover:text-foreground"
            >
              <span className="sr-only">GitHub</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-github"
              >
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
