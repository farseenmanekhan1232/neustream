import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, ChevronDownIcon } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);

  const isActivePath = (path) => location.pathname === path;

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("neustream_user") || "null");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">NeuStream</span>
          </Link>
          <nav className="hidden md:flex gap-6 ml-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActivePath("/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Features
            </a>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              onClick={() => setIsLegalDropdownOpen(!isLegalDropdownOpen)}
              onBlur={() =>
                setTimeout(() => setIsLegalDropdownOpen(false), 200)
              }
            >
              Legal
              <ChevronDownIcon className="h-4 w-4" />
            </button>
            {isLegalDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
                <div className="py-1">
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Cancellations and Refunds
                  </a>
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/contact_us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            )}
          </div>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors text-primary border p-2 rounded hover:border-black`}
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container-custom py-4 flex flex-col gap-4">
            <Link
              to="/"
              className="px-2 py-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="#features"
              className="px-2 py-2 text-sm font-medium hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            {user ? (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <span className="text-sm text-muted-foreground px-2 py-2">
                  {user.email}
                </span>
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <span className="text-xs text-muted-foreground px-2 py-1 font-semibold">
                    Legal
                  </span>
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/refund"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cancellations and Refunds
                  </a>
                  <a
                    href="https://merchant.razorpay.com/policy/QOJnHOnzHjv8ab/contact_us"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Contact Us
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Button variant="ghost" className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    Log in
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    Get Started
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
