import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import DashboardContent from "@/components/dashboard/DashboardContent";
import ErrorBoundary from "@/components/dashboard/ErrorBoundary";

function DashboardLayout() {
  return (
    <ErrorBoundary>
      <SidebarProvider
        style={{
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        }}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <DashboardContent />
              </div>
            </div>
          </div>
        </SidebarInset>
        <Toaster position="top-right" richColors closeButton />
      </SidebarProvider>
    </ErrorBoundary>
  );
}

export default DashboardLayout;
