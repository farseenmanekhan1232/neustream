import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navigationGroups = [
  {
    title: "Streaming",
    items: [
      {
        id: "overview",
        label: "Overview",
        shortcut: "1",
      },
      {
        id: "streaming",
        label: "Configuration",
        shortcut: "2",
      },
      {
        id: "preview",
        label: "Stream Preview",
        shortcut: "3",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        id: "subscription",
        label: "Subscription",
        shortcut: "4",
      },
      {
        id: "analytics",
        label: "Analytics",
        shortcut: "5",
      },
      {
        id: "settings",
        label: "Settings",
        shortcut: "6",
      },
    ],
  },
];

function SidebarKeyboardShortcuts({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Search</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="px-2 py-1 bg-muted rounded">⌘</kbd>
              <kbd className="px-2 py-1 bg-muted rounded">K</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Navigation</p>
            {navigationGroups
              .flatMap((group) => group.items)
              .map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{item.label}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <kbd className="px-2 py-1 bg-muted rounded">⌘</kbd>
                    <kbd className="px-2 py-1 bg-muted rounded">
                      {index + 1}
                    </kbd>
                  </div>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Show shortcuts</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">?</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Close</span>
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SidebarKeyboardShortcuts;