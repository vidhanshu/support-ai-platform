"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useAgents, useAttachSourceToAgents } from "@/hooks/api";
import type { KnowledgeSource } from "@/lib/api";
import { toastApiError, toastSuccess } from "@/lib/toast";

type AttachToAgentsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: KnowledgeSource | null;
};

export function AttachToAgentsSheet({
  open,
  onOpenChange,
  source,
}: AttachToAgentsSheetProps) {
  const agentsQuery = useAgents();
  const attach = useAttachSourceToAgents();
  const [selected, setSelected] = useState<string[]>([]);

  const linkedIds = useMemo(
    () => new Set((source?.agents ?? []).map((link) => link.agentId)),
    [source?.agents],
  );

  const availableAgents = useMemo(
    () => (agentsQuery.data ?? []).filter((agent) => !linkedIds.has(agent.id)),
    [agentsQuery.data, linkedIds],
  );

  useEffect(() => {
    if (!open) return;
    setSelected([]);
  }, [open, source?.id]);

  function toggle(agentId: string) {
    setSelected((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId],
    );
  }

  function onSubmit() {
    if (!source || selected.length === 0) return;
    attach.mutate(
      { knowledgeSourceId: source.id, agentIds: selected },
      {
        onSuccess: () => {
          toastSuccess(
            selected.length === 1
              ? "Attached to agent"
              : `Attached to ${selected.length} agents`,
          );
          onOpenChange(false);
        },
        onError: (error) => {
          toastApiError(error, "Unable to attach source.");
        },
      },
    );
  }

  const title =
    source?.document?.originalFilename ||
    source?.website?.rootUrl ||
    source?.name ||
    "Data source";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Attach to agents</SheetTitle>
          <SheetDescription>
            Link <span className="font-medium text-foreground">{title}</span> to
            one or more agents in this workspace.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          {agentsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading agents…</p>
          ) : availableAgents.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              {agentsQuery.data?.length
                ? "Already attached to every agent in this workspace."
                : "Create an agent first, then attach this source."}
            </p>
          ) : (
            <ul className="space-y-2">
              {availableAgents.map((agent) => {
                const checked = selected.includes(agent.id);
                return (
                  <li key={agent.id}>
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
                        toggle(agent.id);
                      }}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(agent.id)}
                        className="mt-0.5"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {agent.name}
                        </span>
                        {agent.description ? (
                          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                            {agent.description}
                          </span>
                        ) : null}
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
            disabled={attach.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={
              attach.isPending ||
              selected.length === 0 ||
              !source ||
              availableAgents.length === 0
            }
          >
            {attach.isPending
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
