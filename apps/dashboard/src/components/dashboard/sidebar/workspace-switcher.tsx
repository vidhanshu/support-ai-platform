"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import InitialsAvatar from "@/components/common/initials-avatar";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const { workspace: activeWorkspace, workspaces, isLoading } =
    useActiveWorkspace();

  const isActiveWorkspaceExists = Boolean(activeWorkspace);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="border"
            render={
              <SidebarMenuButton
                size="lg"
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
              />
            }
          >
            <InitialsAvatar name={activeWorkspace?.name ?? "S"} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {isLoading
                  ? "Loading…"
                  : isActiveWorkspaceExists
                    ? activeWorkspace!.name
                    : "Select a workspace"}
              </span>
              <span className="truncate text-xs">
                {isActiveWorkspaceExists ? "Workspace" : null}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-xs"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((workspace) => {
                return (
                  <DropdownMenuItem
                    nativeButton={false}
                    render={<Link href={`/dashboard/${workspace.slug}`} />}
                    key={workspace.id}
                    className="gap-2 p-2 group cursor-pointer"
                  >
                    <InitialsAvatar name={workspace.name} />
                    <span className="truncate" title={workspace.name}>
                      {workspace.name}
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href="/dashboard/create" />}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Create workspace
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
