import { cn } from "@/lib/utils";

/**
 * Standardized container component for dashboard screens
 * Ensures consistent width, spacing, and responsive behavior
 */
function DashboardContainer({
  children,
  className,
  size = "default",
  ...props
}) {
  const sizeClasses = {
    default: "max-w-7xl mx-auto",
    narrow: "max-w-4xl mx-auto",
    wide: "max-w-full px-4",
    full: "w-full",
  };

  return (
    <div
      className={cn(
        "w-full px-6 py-6 space-y-6",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default DashboardContainer;
