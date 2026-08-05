"use client";

import Logo from "@/components/common/logo";
import { SidebarTrigger } from "@repo/ui/components/sidebar";

/** Brand row + collapse control (Chatbase-style). Logo hides when sidebar is icon-collapsed. */
export function SidebarBrand() {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <Logo className="min-w-0 flex-1 truncate text-lg leading-none tracking-tight group-data-[collapsible=icon]:hidden" />
      <SidebarTrigger className="shrink-0" />
    </div>
  );
}
