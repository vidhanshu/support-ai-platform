"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Globe, Type } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Label } from "@repo/ui/components/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { cn } from "@repo/ui/lib/utils";
import {
  useAttachKnowledgeSource,
  useKnowledgeSources,
} from "@/hooks/api";
import type { KnowledgeSource } from "@/lib/api";
import { formatBytes } from "@/lib/knowledge/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";

type AttachSourcesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  /** Knowledge source IDs already attached to this agent. */
  attachedIds: string[];
};

function sourceTitle(source: KnowledgeSource) {
  return (
    source.document?.originalFilename ||
    source.website?.rootUrl ||
    source.textSnippet?.title ||
    source.name
  );
}

export function AttachSourcesSheet({
  open,
  onOpenChange,
  agentId,
  attachedIds,
}: AttachSourcesSheetProps) {
  const sourcesQuery = useKnowledgeSources();
  const attach = useAttachKnowledgeSource(agentId);
  const [selected, setSelected] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attachedSet = useMemo(() => new Set(attachedIds), [attachedIds]);

  const available = useMemo(
    () =>
      (sourcesQuery.data ?? []).filter((source) => !attachedSet.has(source.id)),
    [sourcesQuery.data, attachedSet],
  );

  useEffect(() => {
    if (!open) return;
    setSelected([]);
  }, [open]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function onSubmit() {
    if (!selected.length) return;
    setIsSubmitting(true);
    try {
      for (const id of selected) {
        await attach.mutateAsync(id);
      }
      toastSuccess(
        selected.length === 1
          ? "Source attached"
          : `${selected.length} sources attached`,
      );
      onOpenChange(false);
    } catch (error) {
      toastApiError(error, "Unable to attach sources.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Attach data sources</SheetTitle>
          <SheetDescription>
            Choose existing workspace sources to link to this agent.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {sourcesQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading sources…</p>
          ) : available.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {(sourcesQuery.data?.length ?? 0) === 0
                ? "No workspace sources yet. Create one from Data sources."
                : "All workspace sources are already attached."}
            </p>
          ) : (
            <ul className="space-y-2">
              {available.map((source) => {
                const checked = selected.includes(source.id);
                const isWebsite = source.type === "WEBSITE";
                const isText = source.type === "TEXT_SNIPPET";
                return (
                  <li key={source.id}>
                    <Label
                      className={cn(
                        "flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 font-normal transition-colors hover:bg-muted/40",
                        checked && "border-primary/40 bg-muted/40",
                      )}
                      onClick={(event) => {
                        if (
                          (event.target as HTMLElement).closest(
                            '[data-slot="checkbox"]',
                          )
                        ) {
                          return;
                        }
                        toggle(source.id);
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(source.id)}
                        className="mt-0.5"
                      />
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                        {isWebsite ? (
                          <Globe className="size-4" />
                        ) : isText ? (
                          <Type className="size-4" />
                        ) : (
                          <FileText className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {sourceTitle(source)}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {isWebsite
                            ? "Website"
                            : isText
                              ? `Text${source.textSnippet ? ` · ${formatBytes(source.textSnippet.contentBytes)}` : ""}`
                              : `File${source.document ? ` · ${formatBytes(source.document.size)}` : ""}`}
                          {" · "}
                          {source.status.toLowerCase()}
                        </span>
                      </span>
                    </Label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <SheetFooter className="border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={
              isSubmitting || selected.length === 0 || available.length === 0
            }
          >
            {isSubmitting
              ? "Attaching…"
              : selected.length
                ? `Attach (${selected.length})`
                : "Attach"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
