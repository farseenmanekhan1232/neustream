import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
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
        {/* Enhanced Sidebar */}
        <DashboardSidebar />

        {/* Main Content Area - Using SidebarInset for proper width handling */}
        <SidebarInset className="flex flex-col h-screen">
          {/* Header */}
          <DashboardHeader />

          {/* Main Content */}
          <DashboardContent />
        </SidebarInset>

        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default DashboardLayout;
