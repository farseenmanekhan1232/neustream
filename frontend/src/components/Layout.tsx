import { Outlet } from "react-router-dom";
import ErrorBoundary from "./dashboard/ErrorBoundary";
import { Toaster } from "sonner";

export default function Layout() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background font-sans antialiased">
        <main className="relative">
          <Outlet />
        </main>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}
