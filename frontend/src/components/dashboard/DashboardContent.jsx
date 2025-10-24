import { Suspense, memo } from "react";
import { Outlet } from "react-router-dom";
import { DashboardOverviewSkeleton } from "@/components/LoadingSkeletons";
import DashboardContainer from "./DashboardContainer";
import { ScrollArea } from "@/components/ui/scroll-area";

const DashboardContent = memo(function DashboardContent() {
  return (
    <main className="flex-1 overflow-y-auto">
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardContainer>
          <Outlet />
        </DashboardContainer>
      </Suspense>
    </main>
  );
});

export default DashboardContent;
