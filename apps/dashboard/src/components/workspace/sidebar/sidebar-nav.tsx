"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ExternalLink, type LucideIcon } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui/components/sidebar";

export type SidebarNavSubItem = {
  title: string;
  url: string;
  /** Only match this path exactly (for section index routes). */
  exact?: boolean;
};

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  /** Opens in a new tab */
  external?: boolean;
  /** Only match this path exactly (for workspace root, etc.). */
  exact?: boolean;
  items?: SidebarNavSubItem[];
};

export type SidebarNavGroup = {
  label?: string;
  items: SidebarNavItem[];
  /** Hide group when the sidebar is collapsed to icons */
  hideOnIconCollapse?: boolean;
};

function isPathActive(
  pathname: string,
  url: string,
  exact?: boolean,
) {
  if (url === "#" || !url) return false;
  if (pathname === url) return true;
  if (exact) return false;
  return pathname.startsWith(`${url}/`);
}

function NavLinkButton({
  item,
  isActive,
}: {
  item: SidebarNavItem;
  isActive: boolean;
}) {
  const Icon = item.icon;

  if (item.external) {
    return (
      <SidebarMenuButton
        tooltip={item.title}
        isActive={isActive}
        render={
          <a href={item.url} target="_blank" rel="noopener noreferrer" />
        }
      >
        {Icon ? <Icon /> : null}
        <span>{item.title}</span>
        <ExternalLink className="ml-auto size-3.5 opacity-60" />
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton
      tooltip={item.title}
      isActive={isActive}
      render={<Link href={item.url} />}
    >
      {Icon ? <Icon /> : null}
      <span>{item.title}</span>
    </SidebarMenuButton>
  );
}

function NavItem({
  item,
  pathname,
}: {
  item: SidebarNavItem;
  pathname: string;
}) {
  const Icon = item.icon;
  const childActive = item.items?.some((sub) =>
    isPathActive(pathname, sub.url, sub.exact),
  );
  const selfActive = isPathActive(pathname, item.url, item.exact);
  const isActive = Boolean(childActive || selfActive);

  if (!item.items?.length) {
    return (
      <SidebarMenuItem>
        <NavLinkButton item={item} isActive={isActive} />
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible
      defaultOpen={isActive}
      className="group/collapsible"
      render={<SidebarMenuItem />}
    >
      <CollapsibleTrigger
        render={
          <SidebarMenuButton tooltip={item.title} isActive={isActive} />
        }
      >
        {Icon ? <Icon /> : null}
        <span>{item.title}</span>
        <ChevronRight className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {item.items.map((subItem) => (
            <SidebarMenuSubItem key={subItem.title}>
              <SidebarMenuSubButton
                isActive={isPathActive(pathname, subItem.url, subItem.exact)}
                render={<Link href={subItem.url} />}
              >
                <span>{subItem.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SidebarNav({ groups }: { groups: SidebarNavGroup[] }) {
  const pathname = usePathname();

  return (
    <>
      {groups.map((group, index) => (
        <SidebarGroup
          key={group.label ?? `group-${index}`}
          className={
            group.hideOnIconCollapse
              ? "group-data-[collapsible=icon]:hidden"
              : undefined
          }
        >
          {group.label ? (
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          ) : null}
          <SidebarMenu>
            {group.items.map((item) => (
              <NavItem key={item.title} item={item} pathname={pathname} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
