import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * FilterPanel - Unified filter panel with dropdown and active filter chips
 * @param {React.ReactNode} children - Filter form controls
 * @param {Array} activeFilters - Array of active filter objects { key, label, value }
 * @param {Function} onClearFilter - Callback to clear individual filter
 * @param {Function} onClearAll - Callback to clear all filters
 * @param {string} className - Additional classes
 */
export function FilterPanel({
  children,
  activeFilters = [],
  onClearFilter,
  onClearAll,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const filterCount = activeFilters.length;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {filterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full"
                >
                  {filterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Filter Options</h4>
                {filterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onClearAll?.();
                      setIsOpen(false);
                    }}
                    className="h-auto p-1 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              {children}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {filterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="gap-1 pr-1 transition-smooth hover:bg-secondary/80"
            >
              <span className="text-xs">
                {filter.label}: {filter.value}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onClearFilter?.(filter.key)}
                className="h-auto p-0.5 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
