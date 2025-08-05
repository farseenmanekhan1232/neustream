"use client"

import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"

export function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
      <Menu className="h-6 w-6" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

