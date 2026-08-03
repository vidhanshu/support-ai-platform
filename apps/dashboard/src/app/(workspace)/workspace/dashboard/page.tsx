"use client";

import { Button } from "@repo/ui/components/button";
import { useHealth, useMe, useWorkspaces } from "@/hooks/api";
import { getErrorMessage } from "@/lib/api";

export default function WorkspaceDashboardPage() {
  const healthQuery = useHealth();
  const meQuery = useMe();
  const workspacesQuery = useWorkspaces();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="space-y-3">
        <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Support AI Platform
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground">
          {meQuery.data
            ? `Signed in as ${meQuery.data.email}`
            : "Loading your session…"}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">API health</p>
        {healthQuery.isLoading ? (
          <p className="text-foreground">Checking…</p>
        ) : null}
        {healthQuery.isError ? (
          <p className="text-destructive">
            {getErrorMessage(
              healthQuery.error,
              "Unreachable — start the API and Postgres first.",
            )}
          </p>
        ) : null}
        {healthQuery.data ? (
          <p className="text-foreground">
            {healthQuery.data.status} · database {healthQuery.data.database}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          onClick={() => void healthQuery.refetch()}
        >
          Refresh health
        </Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Workspaces</p>
        {workspacesQuery.isLoading ? (
          <p className="text-foreground">Loading workspaces…</p>
        ) : null}
        {workspacesQuery.isError ? (
          <p className="text-destructive">
            {getErrorMessage(
              workspacesQuery.error,
              "Could not load workspaces.",
            )}
          </p>
        ) : null}
        {workspacesQuery.data?.length ? (
          <ul className="space-y-2">
            {workspacesQuery.data.map((workspace) => (
              <li
                key={workspace.id}
                className="rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{workspace.name}</span>
                <span className="text-muted-foreground"> · {workspace.slug}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {workspacesQuery.data && workspacesQuery.data.length === 0 ? (
          <p className="text-muted-foreground">No workspaces yet.</p>
        ) : null}
      </div>
    </main>
  );
}
