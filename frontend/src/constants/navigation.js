// Re-export from centralized route configuration
export {
  getDashboardNavigation as DASHBOARD_NAVIGATION,
  getPageTitle,
  getPageDescription,
} from "@/config/routes";

// Legacy function for backward compatibility
export const getNavigationItem = (pathname) => {
  const { getRouteByPath } = require("@/config/routes");
  return getRouteByPath(pathname);
};