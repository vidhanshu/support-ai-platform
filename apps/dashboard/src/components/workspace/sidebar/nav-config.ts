import {
  Activity,
  BarChart3,
  BookUser,
  Bot,
  ChartNoAxesColumn,
  Contact,
  Gift,
  HelpCircle,
  Play,
  Rocket,
  Settings,
  Settings2,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { SidebarNavGroup } from "./sidebar-nav";

export type SidebarMode = "no-workspace" | "workspace" | "agent";

export type SidebarNavContext = {
  workspaceSlug?: string;
  agentId?: string;
  pathname: string;
};

function workspaceBase(slug: string) {
  return `/dashboard/${slug}`;
}

function agentBase(slug: string, agentId: string) {
  return `${workspaceBase(slug)}/agents/${agentId}`;
}

/** Create-workspace / account shell: Account, Help, Refer */
export function getNoWorkspaceNav(): SidebarNavGroup[] {
  return [
    {
      items: [
        {
          title: "Account settings",
          url: "/account",
          icon: Settings,
        },
        {
          title: "Help",
          url: "/help",
          icon: HelpCircle,
        },
        {
          title: "Refer",
          url: "/refer",
          icon: Gift,
        },
      ],
    },
  ];
}

/** Workspace home: Agents root, Usage, Workspace settings */
export function getWorkspaceNav(workspaceSlug: string): SidebarNavGroup[] {
  const base = workspaceBase(workspaceSlug);

  return [
    {
      items: [
        {
          title: "Agents",
          url: base,
          icon: Bot,
          exact: true,
        },
        {
          title: "Usage",
          url: `${base}/usage`,
          icon: ChartNoAxesColumn,
        },
        {
          title: "Workspace settings",
          url: `${base}/settings`,
          icon: Settings2,
          items: [
            { title: "General", url: `${base}/settings`, exact: true },
            { title: "Members", url: `${base}/settings/members` },
            { title: "Plans", url: `${base}/settings/plans` },
            { title: "Billing", url: `${base}/settings/billing` },
          ],
        },
      ],
    },
  ];
}

/** Agent selected: Chatbase-style agent navigation */
export function getAgentNav(
  workspaceSlug: string,
  agentId: string,
): SidebarNavGroup[] {
  const base = agentBase(workspaceSlug, agentId);
  const build = `${base}/build`;

  return [
    {
      items: [
        {
          title: "Backstage",
          url: `${base}/backstage`,
          icon: Sparkles,
        },
        {
          title: "Playground",
          url: `${base}/playground`,
          icon: Play,
        },
        {
          title: "Build",
          url: build,
          icon: Wrench,
          items: [
            { title: "Instructions", url: `${build}/instructions` },
            { title: "Data sources", url: `${build}/data-sources` },
            { title: "Actions", url: `${build}/actions` },
            { title: "Widgets", url: `${build}/widgets` },
            { title: "Procedures", url: `${build}/procedures` },
            { title: "Suggestions", url: `${build}/suggestions` },
          ],
        },
        {
          title: "Activity",
          url: `${base}/activity`,
          icon: Activity,
          items: [
            {
              title: "Overview",
              url: `${base}/activity`,
              exact: true,
            },
            {
              title: "Conversations",
              url: `${base}/activity/conversations`,
            },
          ],
        },
        {
          title: "Analytics",
          url: `${base}/analytics`,
          icon: BarChart3,
          items: [
            {
              title: "Overview",
              url: `${base}/analytics`,
              exact: true,
            },
            { title: "Reports", url: `${base}/analytics/reports` },
          ],
        },
        {
          title: "Contacts",
          url: `${base}/contacts`,
          icon: Contact,
        },
        {
          title: "Channels",
          url: `${base}/channels`,
          icon: Rocket,
        },
      ],
    },
    {
      items: [
        {
          title: "Documentation",
          url: "https://docs.supportai.dev",
          icon: BookUser,
          external: true,
        },
      ],
    },
  ];
}

export function resolveSidebarMode({
  workspaceSlug,
  agentId,
  pathname,
}: SidebarNavContext): SidebarMode {
  if (agentId || /\/agents\/[^/]+/.test(pathname)) {
    return "agent";
  }
  if (workspaceSlug && !pathname.includes("/dashboard/create")) {
    return "workspace";
  }
  return "no-workspace";
}

export function getSidebarNavGroups(ctx: SidebarNavContext): SidebarNavGroup[] {
  const mode = resolveSidebarMode(ctx);

  switch (mode) {
    case "agent": {
      const slug = ctx.workspaceSlug;
      const agentId =
        ctx.agentId ??
        ctx.pathname.match(/\/agents\/([^/]+)/)?.[1];
      if (!slug || !agentId) return getNoWorkspaceNav();
      return getAgentNav(slug, agentId);
    }
    case "workspace":
      return getWorkspaceNav(ctx.workspaceSlug!);
    case "no-workspace":
    default:
      return getNoWorkspaceNav();
  }
}
