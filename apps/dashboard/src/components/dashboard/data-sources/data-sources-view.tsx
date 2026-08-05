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
import { useAgent, useDeleteKnowledgeSource } from "@/hooks/api";
import type { KnowledgeSource } from "@/lib/api";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { AddFileSheet } from "./add-file-sheet";
import { AddSourceCards } from "./add-source-cards";
import { AddWebsiteSheet } from "./add-website-sheet";
import { SourceList } from "./source-list";

type DataSourcesViewProps = {
  agentId: string;
};

export function DataSourcesView({ agentId }: DataSourcesViewProps) {
  const agentQuery = useAgent(agentId);
  const deleteSource = useDeleteKnowledgeSource(agentId);

  const [fileOpen, setFileOpen] = useState(false);
  const [websiteOpen, setWebsiteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "DOCUMENT" | "WEBSITE">("all");

  const sources = useMemo(() => {
    const attached =
      agentQuery.data?.knowledgeSources?.map((item) => item.knowledgeSource) ??
      [];
    return attached.filter((source) => {
      if (filter !== "all" && source.type !== filter) return false;
      if (!search.trim()) return true;
      const haystack = [
        source.name,
        source.document?.originalFilename,
        source.website?.rootUrl,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search.trim().toLowerCase());
    });
  }, [agentQuery.data?.knowledgeSources, filter, search]);

  const totalBytes = useMemo(() => {
    return (
      agentQuery.data?.knowledgeSources?.reduce((sum, item) => {
        return sum + (item.knowledgeSource.document?.size ?? 0);
      }, 0) ?? 0
    );
  }, [agentQuery.data?.knowledgeSources]);

  function handleDelete(id: string) {
    deleteSource.mutate(id, {
      onSuccess: () => toastSuccess("Source deleted"),
      onError: (error) => toastApiError(error, "Unable to delete source."),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Data sources</h1>
          <p className="text-sm text-muted-foreground">
            Attach files and websites this agent can use for answers.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Total size: {(totalBytes / 1024).toFixed(0)} KB
        </p>
      </div>

      <AddSourceCards
        onSelect={(id) => {
          if (id === "files") setFileOpen(true);
          if (id === "website") setWebsiteOpen(true);
        }}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search..."
            className="pl-8"
          />
        </div>
        <Select
          value={filter}
          onValueChange={(value) => {
            if (value === "all" || value === "DOCUMENT" || value === "WEBSITE") {
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
          </SelectContent>
        </Select>
      </div>

      <SourceList
        sources={sources as KnowledgeSource[]}
        isLoading={agentQuery.isLoading}
        onDelete={handleDelete}
        isDeleting={deleteSource.isPending}
      />

      <AddFileSheet
        open={fileOpen}
        onOpenChange={setFileOpen}
        agentId={agentId}
      />
      <AddWebsiteSheet
        open={websiteOpen}
        onOpenChange={setWebsiteOpen}
        agentId={agentId}
      />
    </div>
  );
}
