"use client"

import * as React from "react"
import {
  IconVideo,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconMessageCircle,
  IconSettings,
  IconHelp,
  IconSearch,
  IconUsers,
  IconBolt,
  IconEye,
  IconBroadcast,
  IconMicrophone,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "NeuStream User",
    email: "user@neustream.app",
    avatar: "/logo.png",
  },
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: IconDashboard,
      isActive: true,
    },
    {
      title: "Streaming",
      url: "/dashboard/streaming",
      icon: IconBroadcast,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "/dashboard/search",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }) {
  return (
    <Sidebar
    variant="sidebar"
    {...props}
  >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <IconVideo className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">NeuStream</span>
                  <span className="truncate text-xs">Streaming Platform</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}