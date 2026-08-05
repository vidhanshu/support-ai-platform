"use client";

import { useParams, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";
import { getSidebarNavGroups } from "./nav-config";
import { NavUser } from "./nav-user";
import { SidebarNav } from "./sidebar-nav";
import { WorkspaceSwitcher } from "./workspace-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const params = useParams<{
    workspaceSlug?: string;
    agentId?: string;
  }>();

  const groups = getSidebarNavGroups({
    pathname,
    workspaceSlug:
      typeof params.workspaceSlug === "string"
        ? params.workspaceSlug
        : undefined,
    agentId: typeof params.agentId === "string" ? params.agentId : undefined,
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent className="bg-background">
        <SidebarNav groups={groups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
