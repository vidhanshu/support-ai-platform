"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";

async function fetchApiHealth(): Promise<{ status: string; database: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const response = await fetch(`${baseUrl}/health`);

  if (!response.ok) {
    throw new Error("API health check failed");
  }

  return response.json() as Promise<{ status: string; database: string }>;
}

export default function AuthPage() {
  const healthQuery = useQuery({
    queryKey: ["api-health"],
    queryFn: fetchApiHealth,
    retry: false,
  });

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
          Phase 1 foundation shell. Auth, agents, and conversations come next.
        </p>
      </div>

      <div className="flex gap-3">
        <Button>Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="secondary">Secondary</Button>
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">API health</p>
        {healthQuery.isLoading ? (
          <p className="text-foreground">Checking…</p>
        ) : null}
        {healthQuery.isError ? (
          <p className="text-destructive">
            Unreachable — start the API and Postgres first.
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
          Refresh
        </Button>
      </div>
    </main>
  );
}
