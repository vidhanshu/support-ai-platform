"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Skeleton } from "@repo/ui/components/skeleton";
import NotFound from "@/components/common/not-found";
import { CreateAgentDialog } from "@/components/dashboard/create-agent-dialog";
import { useAgents } from "@/hooks/api";
import Image from "next/image";

export default function AgentsPage() {
  const params = useParams<{ workspaceSlug: string }>();
  const { data: agents, isLoading, isError } = useAgents();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      {isLoading ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-muted-foreground">
            Unable to load agents. Please try again.
          </p>
        </div>
      ) : !agents?.length ? (
        <NotFound onCreateClick={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
              <p className="text-sm text-muted-foreground">
                Manage AI agents in this workspace.
              </p>
            </div>
            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Plus />
              Add agent
            </Button>
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/dashboard/${params.workspaceSlug}/agents/${agent.id}/playground`}
                  className="block rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                >
                  <div className="space-y-2">
                    <div className="relative aspect-auto w-full max-w-md h-40 rounded-md overflow-hidden">
                      <Image
                        fill
                        src="/no-agents.webp"
                        alt="No agents"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      {agent.description ? (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {agent.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {agent.model ?? "llama3.1"}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CreateAgentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
