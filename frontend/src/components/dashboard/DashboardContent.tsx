import { Suspense, memo } from "react";
import { Outlet } from "react-router-dom";
import { DashboardOverviewSkeleton } from "@/components/LoadingSkeletons";

const DashboardContent = memo(function DashboardContent() {
  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <Outlet />
      </Suspense>
    </div>
  );
});

export default DashboardContent;
