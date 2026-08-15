"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Copy, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useAgentApiKeys,
  useCreateAgentApiKey,
  useRevokeAgentApiKey,
} from "@/hooks/api";
import { API_BASE_URL } from "@/lib/api";
import { toastApiError, toastSuccess } from "@/lib/toast";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  allowedOrigins: z
    .string()
    .min(1, "Add at least one origin")
    .refine(
      (value) =>
        value
          .split(/[\n,]+/)
          .map((o) => o.trim())
          .filter(Boolean)
          .every((o) => /^https?:\/\/[^/\s]+$/.test(o)),
      "Origins must look like https://example.com (no path)",
    ),
  rateLimitRpm: z.coerce.number().int().min(1).max(1000).optional(),
});

type CreateKeyValues = z.infer<typeof createKeySchema>;

type AgentApiKeysViewProps = {
  agentId: string;
};

export function AgentApiKeysView({ agentId }: AgentApiKeysViewProps) {
  const keysQuery = useAgentApiKeys(agentId);
  const createKey = useCreateAgentApiKey(agentId);
  const revokeKey = useRevokeAgentApiKey(agentId);
  const { confirm, confirmationDialog } = useConfirmDialog();
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const form = useForm<CreateKeyValues>({
    resolver: zodResolver(createKeySchema),
    defaultValues: {
      name: "",
      allowedOrigins: "http://localhost:3000",
      rateLimitRpm: 60,
    },
  });

  async function onCreate(values: CreateKeyValues) {
    const allowedOrigins = values.allowedOrigins
      .split(/[\n,]+/)
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean);

    try {
      const created = await createKey.mutateAsync({
        name: values.name.trim(),
        allowedOrigins,
        rateLimitRpm: values.rateLimitRpm,
      });
      setCreatedSecret(created.secret);
      form.reset({
        name: "",
        allowedOrigins: values.allowedOrigins,
        rateLimitRpm: values.rateLimitRpm ?? 60,
      });
      toastSuccess("API key created");
    } catch (error) {
      toastApiError(error, "Failed to create API key");
    }
  }

  async function onRevoke(keyId: string, name: string) {
    const ok = await confirm({
      title: "Revoke API key?",
      description: `“${name}” will stop working immediately.`,
      confirmLabel: "Revoke",
      loadingLabel: "Revoking…",
      variant: "destructive",
      action: async () => {
        try {
          await revokeKey.mutateAsync(keyId);
        } catch (error) {
          toastApiError(error, "Failed to revoke key");
          throw error;
        }
      },
    });
    if (ok) toastSuccess("API key revoked");
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toastSuccess("Copied");
    } catch {
      toastApiError(new Error("Clipboard unavailable"), "Could not copy");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">API keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Per-agent keys for the public chat API. The website SDK will use these
          next.
        </p>
      </div>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Public endpoints</h2>
        <div className="space-y-2 font-mono text-xs text-muted-foreground">
          <p>
            GET {API_BASE_URL}/public/agents/{agentId}
          </p>
          <p>
            POST {API_BASE_URL}/public/agents/{agentId}/chat
          </p>
          <p>Auth: Authorization: Bearer sak_… or X-Api-Key</p>
        </div>
      </section>

      {createdSecret ? (
        <section className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/5 p-6">
          <h2 className="text-base font-semibold">Copy your secret key</h2>
          <p className="text-sm text-muted-foreground">
            This is shown only once. Store it securely.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-md bg-background px-3 py-2 text-xs">
              {createdSecret}
            </code>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => void copyText(createdSecret)}
            >
              <Copy className="size-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCreatedSecret(null)}
          >
            Done
          </Button>
        </section>
      ) : null}

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Create API key</h2>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void onCreate(values))}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Name</FieldLabel>
                  <Input placeholder="Production site" {...field} />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="allowedOrigins"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Allowed origins</FieldLabel>
                  <Input
                    placeholder="https://example.com, http://localhost:3000"
                    {...field}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated. Browser requests must match one of these.
                  </p>
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="rateLimitRpm"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Rate limit (requests / minute)</FieldLabel>
                  <Input type="number" min={1} max={1000} {...field} />
                  {fieldState.error ? (
                    <FieldError>{fieldState.error.message}</FieldError>
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" disabled={createKey.isPending}>
            <KeyRound className="size-4" />
            {createKey.isPending ? "Creating…" : "Create key"}
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-base font-semibold">Active keys</h2>
        {keysQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : keysQuery.data?.length ? (
          <ul className="divide-y">
            {keysQuery.data.map((key) => (
              <li
                key={key.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium">{key.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {key.keyPrefix}…
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {key.allowedOrigins.join(", ")} · {key.rateLimitRpm} rpm
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void onRevoke(key.id, key.name)}
                >
                  <Trash2 className="size-4" />
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No API keys yet.</p>
        )}
      </section>

      {confirmationDialog}
    </div>
  );
}
