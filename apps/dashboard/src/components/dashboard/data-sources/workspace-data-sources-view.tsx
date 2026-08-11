"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useDeleteKnowledgeSource,
  useKnowledgeSources,
} from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { KnowledgeSource } from "@/lib/api";
import { formatBytes } from "@/lib/knowledge/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { AddFileSheet } from "./add-file-sheet";
import { AddSourceCards } from "./add-source-cards";
import { AddTextSnippetSheet } from "./add-text-snippet-sheet";
import { AddWebsiteSheet } from "./add-website-sheet";
import { AttachToAgentsSheet } from "./attach-to-agents-sheet";
import { SourceList } from "./source-list";

function sourceTitle(source: KnowledgeSource) {
  return (
    source.document?.originalFilename ||
    source.website?.rootUrl ||
    source.textSnippet?.title ||
    source.name
  );
}

export function WorkspaceDataSourcesView() {
  const { workspaceSlug } = useActiveWorkspace();
  const sourcesQuery = useKnowledgeSources();
  const deleteSource = useDeleteKnowledgeSource();
  const { confirm, confirmationDialog } = useConfirmDialog();

  const [fileOpen, setFileOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [textOpen, setTextOpen] = useState(false);
  const [attachSource, setAttachSource] = useState<KnowledgeSource | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "DOCUMENT" | "WEBSITE" | "TEXT_SNIPPET"
  >("all");

  const sources = useMemo(() => {
    return (sourcesQuery.data ?? []).filter((source) => {
      if (filter !== "all" && source.type !== filter) return false;
      if (!search.trim()) return true;
      const haystack = [
        source.name,
        source.document?.originalFilename,
        source.website?.rootUrl,
        source.textSnippet?.title,
        ...(source.agents?.map((link) => link.agent.name) ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [sourcesQuery.data, filter, search]);

  const totalBytes = useMemo(() => {
    return (sourcesQuery.data ?? []).reduce((sum, source) => {
      return (
        sum +
        (source.document?.size ?? 0) +
        (source.textSnippet?.contentBytes ?? 0)
      );
    }, 0);
  }, [sourcesQuery.data]);

  async function handleDelete(id: string) {
    const source = (sourcesQuery.data ?? []).find((item) => item.id === id);
    if (!source) return;

    const linkedCount = source.agents?.length ?? 0;
    const linkedNote =
      linkedCount > 0
        ? ` It is currently linked to ${linkedCount} agent${linkedCount === 1 ? "" : "s"} and will be removed from them.`
        : "";

    const confirmed = await confirm({
      title: "Delete data source?",
      description: (
        <>
          Permanently delete{" "}
          <span className="font-medium text-foreground">
            {sourceTitle(source)}
          </span>
          .{linkedNote} This cannot be undone.
        </>
      ),
      confirmLabel: "Delete",
      loadingLabel: "Deleting…",
      variant: "destructive",
      action: async () => {
        try {
          await deleteSource.mutateAsync(id);
        } catch (error) {
          toastApiError(error, "Unable to delete source.");
          throw error;
        }
      },
    });
    if (confirmed) toastSuccess("Source deleted");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data sources</h1>
          <p className="text-sm text-muted-foreground">
            Upload and manage workspace knowledge. Attach sources to any agent.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Total size: {formatBytes(totalBytes)}
        </p>
      </div>

      <AddSourceCards
        onSelect={(id) => {
          if (id === "files") setFileOpen(true);
          if (id === "website") setWebsiteOpen(true);
          if (id === "text") setTextOpen(true);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search sources or agents…"
            className="pl-8"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(value) => {
            if (
              value === "all" ||
              value === "DOCUMENT" ||
              value === "WEBSITE" ||
              value === "TEXT_SNIPPET"
            ) {
              setFilter(value);
            }
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="DOCUMENT">Files</SelectItem>
            <SelectItem value="WEBSITE">Websites</SelectItem>
            <SelectItem value="TEXT_SNIPPET">Text snippets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SourceList
        sources={sources}
        isLoading={sourcesQuery.isLoading}
        emptyMessage="No data sources yet. Add a PDF, website, or text snippet to get started."
        workspaceSlug={workspaceSlug}
        showAgents
        onDelete={(id) => void handleDelete(id)}
        onAttachToAgents={setAttachSource}
        isMutating={deleteSource.isPending}
      />

      <AddFileSheet open={fileOpen} onOpenChange={setFileOpen} />
      <AddWebsiteSheet open={websiteOpen} onOpenChange={setWebsiteOpen} />
      <AddTextSnippetSheet open={textOpen} onOpenChange={setTextOpen} />
      <AttachToAgentsSheet
        open={Boolean(attachSource)}
        onOpenChange={(open) => {
          if (!open) setAttachSource(null);
        }}
        source={attachSource}
      />

      {confirmationDialog}
    </div>
  );
}
