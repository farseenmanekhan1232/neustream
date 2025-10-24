import { useCallback } from "react";
import { Search, Command, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

function SidebarSearch({ searchQuery, setSearchQuery }) {
  const { state } = useSidebar();

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    const searchInput = document.querySelector("[data-sidebar-search]");
    if (searchInput) {
      searchInput.focus();
    }
  }, [setSearchQuery]);

  if (state === "collapsed") {
    return null;
  }

  return (
    <div className="mt-4 relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10 pr-8"
        data-sidebar-search
      />
      {searchQuery && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
          onClick={clearSearch}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
        <Command className="h-3 w-3 inline mr-1" />K
      </div>
    </div>
  );
}

export default SidebarSearch;