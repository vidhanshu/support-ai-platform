"use client";

import {
  Eye,
  FileText,
  Globe,
  Link2,
  MoreHorizontal,
  Trash2,
  Type,
  Unlink,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import type { KnowledgeSource } from "@/lib/api";
import { formatBytes, formatSourceDate } from "@/lib/knowledge/constants";

type SourceListProps = {
  sources: KnowledgeSource[];
  isLoading?: boolean;
  emptyMessage?: string;
  /** Workspace slug — used to link agent chips when showing attachments. */
  workspaceSlug?: string;
  showAgents?: boolean;
  onPreview?: (source: KnowledgeSource) => void;
  onDelete?: (id: string) => void;
  onDetach?: (id: string) => void;
  onAttachToAgents?: (source: KnowledgeSource) => void;
  isMutating?: boolean;
};

function statusClass(status: string) {
  switch (status) {
    case "READY":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    case "FAILED":
      return "bg-destructive/10 text-destructive";
    case "PROCESSING":
    case "PENDING":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function sourceMeta(source: KnowledgeSource) {
  if (source.type === "DOCUMENT" && source.document) {
    return `${formatSourceDate(source.createdAt)} · ${formatBytes(source.document.size)}`;
  }
  if (source.type === "WEBSITE" && source.website) {
    const pages = source.website.pagesCrawled || source.website.pagesFound;
    const crawled = source.website.lastCrawledAt
      ? `Last crawled ${formatSourceDate(source.website.lastCrawledAt)}`
      : "Crawl in progress";
    return `${pages} links · ${crawled}`;
  }
  if (source.type === "TEXT_SNIPPET" && source.textSnippet) {
    return `${formatSourceDate(source.createdAt)} · ${formatBytes(source.textSnippet.contentBytes)}`;
  }
  return formatSourceDate(source.createdAt);
}

function sourceIcon(source: KnowledgeSource) {
  if (source.type === "WEBSITE") return <Globe className="size-4" />;
  if (source.type === "TEXT_SNIPPET") return <Type className="size-4" />;
  return <FileText className="size-4" />;
}

function sourceKindLabel(source: KnowledgeSource) {
  if (source.type === "WEBSITE") return "Website";
  if (source.type === "TEXT_SNIPPET") return "Text";
  return "File";
}

function sourceTitle(source: KnowledgeSource) {
  return (
    source.document?.originalFilename ||
    source.website?.rootUrl ||
    source.textSnippet?.title ||
    source.name
  );
}

export function SourceList({
  sources,
  isLoading,
  emptyMessage = "No data sources yet.",
  workspaceSlug,
  showAgents = false,
  onPreview,
  onDelete,
  onDetach,
  onAttachToAgents,
  isMutating,
}: SourceListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (!sources.length) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sources.map((source) => {
        const title = sourceTitle(source);
        const agents = source.agents ?? [];
        const hasMenu = Boolean(
          onPreview || onDelete || onDetach || onAttachToAgents,
        );

        return (
          <li
            key={source.id}
            className="flex items-center gap-4 rounded-xl border bg-card p-4"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
              {sourceIcon(source)}
            </span>

            <div className="min-w-0 flex-1">
              {onPreview ? (
                <button
                  type="button"
                  onClick={() => onPreview(source)}
                  className="block max-w-full truncate text-left font-medium hover:underline"
                >
                  {title}
                </button>
              ) : (
                <p className="truncate font-medium">{title}</p>
              )}
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {sourceMeta(source)}
              </p>
              {showAgents ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {agents.length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      Not linked to any agent
                    </span>
                  ) : (
                    agents.map((link) => {
                      const href = workspaceSlug
                        ? `/dashboard/${workspaceSlug}/agents/${link.agent.id}/build/data-sources`
                        : undefined;
                      const chip = (
                        <span className="inline-flex items-center rounded-full border bg-background px-2 py-0.5 text-xs">
                          {link.agent.name}
                        </span>
                      );
                      return href ? (
                        <Link
                          key={link.id}
                          href={href}
                          className="hover:opacity-80"
                        >
                          {chip}
                        </Link>
                      ) : (
                        <span key={link.id}>{chip}</span>
                      );
                    })
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                  statusClass(source.status),
                )}
              >
                {source.status.toLowerCase()}
              </span>
              <span className="hidden rounded-full border px-2.5 py-1 text-xs text-muted-foreground sm:inline-flex">
                {sourceKindLabel(source)}
              </span>

              {hasMenu ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <MoreHorizontal />
                    <span className="sr-only">Source actions</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    {onPreview ? (
                      <DropdownMenuItem
                        disabled={isMutating}
                        onClick={() => onPreview(source)}
                      >
                        <Eye />
                        Preview
                      </DropdownMenuItem>
                    ) : null}
                    {onAttachToAgents ? (
                      <DropdownMenuItem
                        disabled={isMutating}
                        onClick={() => onAttachToAgents(source)}
                      >
                        <Link2 />
                        Attach to agents
                      </DropdownMenuItem>
                    ) : null}
                    {onDetach ? (
                      <DropdownMenuItem
                        disabled={isMutating}
                        onClick={() => onDetach(source.id)}
                      >
                        <Unlink />
                        Detach
                      </DropdownMenuItem>
                    ) : null}
                    {onDelete ? (
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={isMutating}
                        onClick={() => onDelete(source.id)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
