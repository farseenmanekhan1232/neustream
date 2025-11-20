import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";

/**
 * ExpandableTableRow - Table row with expandable details section
 * @param {React.ReactNode} children - Main row content (TableCell components)
 * @param {React.ReactNode} expandedContent - Content to show when expanded
 * @param {number} colSpan - Number of columns for expanded content
 * @param {Function} onExpand - Optional callback when row expands
 */
export function ExpandableTableRow({
  children,
  expandedContent,
  colSpan,
  onExpand,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onExpand) {
      onExpand(newState);
    }
  };

  return (
    <>
      <TableRow
        className={cn(
          "transition-smooth cursor-pointer hover:bg-muted/50",
          isExpanded && "bg-muted/30",
          className
        )}
        onClick={handleToggle}
      >
        {children}
        <TableCell className="text-center w-12">
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200 text-muted-foreground mx-auto",
              isExpanded && "rotate-180"
            )}
          />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={colSpan} className="py-4 px-6 bg-muted/20">
            <div className="expandable">{expandedContent}</div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export default ExpandableTableRow;
