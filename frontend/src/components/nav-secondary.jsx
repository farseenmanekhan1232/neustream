"use client"

import * as React from "react"
import { Link, useLocation } from "react-router-dom"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}) {
  const location = useLocation()

  const isActive = (url) => {
    return location.pathname.startsWith(url)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <span className="text-sm font-medium text-sidebar-foreground/70 px-2 py-1">
          System
        </span>
      </SidebarMenuItem>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={isActive(item.url)}
            tooltip={item.title}
            size="sm"
          >
            <Link to={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}