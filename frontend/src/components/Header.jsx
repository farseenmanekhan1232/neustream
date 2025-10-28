import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActivePath = (path) => location.pathname === path;

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("neustream_user") || "null");

  return (
    <header className="sticky top-0 z-50 w-full bg-header-teal-gradient">
      <div className="container-custom flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="NeuStream Logo" className="w-8 h-8 " />
            <span className="text-xl font-normal">NeuStream</span>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <nav className="hidden md:flex gap-6 ml-6 opacity-75 ">
            <Link to="/" className={`text-sm font-medium transition-colors`}>
              Home
            </Link>
            <a
              href="#features"
              className="text-sm font-medium  transition-colors hover:text-foreground"
            >
              Features
            </a>
            <Link
              to="/privacy"
              className="text-sm font-medium  transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
          </nav>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors bg-white text-black px-5 py-3 rounded-xl`}
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
          className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
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
          <div className="container-custom py-4 flex flex-col gap-2">
            <Link
              to="/"
              className="px-4 py-3 text-sm font-medium hover:text-primary rounded-lg hover:bg-white/10 transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <a
              href="#features"
              className="px-4 py-3 text-sm font-medium hover:text-primary rounded-lg hover:bg-white/10 transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <Link
              to="/privacy"
              className="px-4 py-3 text-sm font-medium hover:text-primary rounded-lg hover:bg-white/10 transition-colors min-h-[44px] flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy
            </Link>
            {user ? (
              <div className="flex flex-col gap-2 pt-2 border-t">
                <span className="text-sm  px-2 py-2">{user.email}</span>
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
