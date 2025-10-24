import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";

function DashboardLayout() {
  return (
    <ErrorBoundary>
      <SidebarProvider
        defaultOpen={true}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        }}
      >
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Enhanced Sidebar */}
          <DashboardSidebar />

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <DashboardHeader />

            {/* Main Content Area */}
            <DashboardContent />
          </div>

          {/* Toast Notifications */}
          <Toaster position="top-right" richColors closeButton />
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default DashboardLayout;