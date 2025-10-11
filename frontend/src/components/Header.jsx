import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon } from "lucide-react";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

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
