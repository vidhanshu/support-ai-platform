"use client";

import {
  BookOpen,
  Bot,
  Frame,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { WorkspaceSwitcher } from "./workspace-switcher";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/workspace/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "History", url: "#" },
        { title: "Starred", url: "#" },
        { title: "Settings", url: "#" },
      ],
    },
    {
      title: "Agents",
      url: "/workspace/agents",
      icon: Bot,
      items: [
        { title: "All agents", url: "/workspace/agents" },
        { title: "Create agent", url: "/workspace/agents/new" },
      ],
    },
    {
      title: "Knowledge",
      url: "/workspace/knowledge",
      icon: BookOpen,
      items: [
        { title: "Sources", url: "/workspace/knowledge" },
        { title: "Documents", url: "/workspace/knowledge/documents" },
      ],
    },
    {
      title: "Settings",
      url: "/workspace/settings",
      icon: Settings2,
      items: [
        { title: "General", url: "/workspace/settings" },
        { title: "Members", url: "/workspace/settings/members" },
        { title: "Billing", url: "/workspace/settings/billing" },
      ],
    },
  ],
  agents: [
    { name: "Support Agent", url: "#", icon: Frame },
    { name: "Sales Agent", url: "#", icon: PieChart },
    { name: "Docs Agent", url: "#", icon: Map },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.agents} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
