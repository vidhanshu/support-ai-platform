"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Link2, Search } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import { useAgent, useDetachKnowledgeSource } from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import type { KnowledgeSource } from "@/lib/api";
import { formatBytes } from "@/lib/knowledge/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { AttachSourcesSheet } from "./attach-sources-sheet";
import { SourceList } from "./source-list";

type AgentDataSourcesViewProps = {
  agentId: string;
};

function sourceTitle(source: KnowledgeSource) {
  return (
    source.document?.originalFilename ||
    source.website?.rootUrl ||
    source.textSnippet?.title ||
    source.name
  );
}

export function AgentDataSourcesView({ agentId }: AgentDataSourcesViewProps) {
  const { workspaceSlug } = useActiveWorkspace();
  const agentQuery = useAgent(agentId);
  const detachSource = useDetachKnowledgeSource(agentId);
  const { confirm, confirmationDialog } = useConfirmDialog();

  const [attachOpen, setAttachOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "DOCUMENT" | "WEBSITE" | "TEXT_SNIPPET"
  >("all");

  const attached = useMemo(() => {
    return (
      agentQuery.data?.knowledgeSources?.map((item) => item.knowledgeSource) ??
      []
    );
  }, [agentQuery.data?.knowledgeSources]);

  const attachedIds = useMemo(
    () => attached.map((source) => source.id),
    [attached],
  );

  const sources = useMemo(() => {
    return attached.filter((source) => {
      if (filter !== "all" && source.type !== filter) return false;
      if (!search.trim()) return true;
      const haystack = [
        source.name,
        source.document?.originalFilename,
        source.website?.rootUrl,
        source.textSnippet?.title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [attached, filter, search]);

  const totalBytes = useMemo(() => {
    return attached.reduce((sum, source) => {
      return (
        sum +
        (source.document?.size ?? 0) +
        (source.textSnippet?.contentBytes ?? 0)
      );
    }, 0);
  }, [attached]);

  const workspaceSourcesHref = workspaceSlug
    ? `/dashboard/${workspaceSlug}/data-sources`
    : "#";

  async function handleDetach(id: string) {
    const source = attached.find((item) => item.id === id);
    if (!source) return;

    const confirmed = await confirm({
      title: "Detach data source?",
      description: (
        <>
          Unlink{" "}
          <span className="font-medium text-foreground">
            {sourceTitle(source)}
          </span>{" "}
          from {agentQuery.data?.name ?? "this agent"}. The source stays in the
          workspace library and can be attached again later.
        </>
      ),
      confirmLabel: "Detach",
      loadingLabel: "Detaching…",
      variant: "destructive",
      action: async () => {
        try {
          await detachSource.mutateAsync(id);
        } catch (error) {
          toastApiError(error, "Unable to detach source.");
          throw error;
        }
      },
    });
    if (confirmed) toastSuccess("Source detached");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data sources</h1>
          <p className="text-sm text-muted-foreground">
            Sources linked to {agentQuery.data?.name ?? "this agent"}. Upload
            new ones from the workspace library.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Linked size: {formatBytes(totalBytes)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => setAttachOpen(true)}>
          <Link2 className="size-4" />
          Attach sources
        </Button>
        <Button
          nativeButton={false}
          render={<Link href={workspaceSourcesHref} />}
          variant="outline"
        >
          Add data source
          <ExternalLink className="size-3.5" />
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search linked sources…"
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
        sources={sources as KnowledgeSource[]}
        isLoading={agentQuery.isLoading}
        emptyMessage="No sources linked yet. Attach an existing workspace source, or create a new one."
        onDetach={(id) => void handleDetach(id)}
        isMutating={detachSource.isPending}
      />

      <AttachSourcesSheet
        open={attachOpen}
        onOpenChange={setAttachOpen}
        agentId={agentId}
        attachedIds={attachedIds}
      />

      {confirmationDialog}
    </div>
  );
}
