"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUp,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Slider } from "@repo/ui/components/slider";
import { Textarea } from "@repo/ui/components/textarea";
import { cn } from "@repo/ui/lib/utils";
import { MarkdownContent } from "@/components/common/markdown-content";
import { useAgent, usePlaygroundChat, useUpdateAgent } from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import {
  agentInstructionsSchema,
  AVAILABLE_AGENT_MODELS,
  DEFAULT_AGENT_GENERAL_PROMPT,
  DEFAULT_AGENT_GUARDRAILS_PROMPT,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_TEMPERATURE,
  resolveAgentModel,
  type AgentInstructionsValues,
} from "@/lib/agents";
import { formatBytes } from "@/lib/knowledge/constants";
import { formatResponseMs } from "@/lib/format";
import { toastApiError, toastSuccess } from "@/lib/toast";

type PlaygroundViewProps = {
  agentId: string;
};

function statusLabel(status: string | null) {
  if (!status) return null;
  const labels: Record<string, string> = {
    starting: "Starting…",
    started: "Starting…",
    retrieving: "Retrieving sources…",
    generating: "Generating…",
    first_token: "Writing reply…",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function trainingSummary(
  sources: Array<{ knowledgeSource: { status: string } }>,
) {
  if (!sources.length) {
    return { label: "No sources", tone: "muted" as const };
  }
  if (sources.some((s) => s.knowledgeSource.status === "FAILED")) {
    return { label: "Needs attention", tone: "destructive" as const };
  }
  if (
    sources.some(
      (s) =>
        s.knowledgeSource.status === "PENDING" ||
        s.knowledgeSource.status === "PROCESSING",
    )
  ) {
    return { label: "Training", tone: "amber" as const };
  }
  if (sources.every((s) => s.knowledgeSource.status === "READY")) {
    return { label: "Trained", tone: "ready" as const };
  }
  return { label: "Mixed", tone: "muted" as const };
}

export function PlaygroundView({ agentId }: PlaygroundViewProps) {
  const { workspaceSlug } = useActiveWorkspace();
  const agentQuery = useAgent(agentId);
  const updateAgent = useUpdateAgent(agentId);
  const chat = usePlaygroundChat(agentId);

  const form = useForm<AgentInstructionsValues>({
    resolver: zodResolver(agentInstructionsSchema),
    defaultValues: {
      generalPrompt: DEFAULT_AGENT_GENERAL_PROMPT,
      guardrailsPrompt: DEFAULT_AGENT_GUARDRAILS_PROMPT,
      model: DEFAULT_AGENT_MODEL,
      temperature: DEFAULT_AGENT_TEMPERATURE,
    },
  });

  useEffect(() => {
    if (!agentQuery.data) return;
    form.reset({
      generalPrompt:
        agentQuery.data.generalPrompt ?? DEFAULT_AGENT_GENERAL_PROMPT,
      guardrailsPrompt:
        agentQuery.data.guardrailsPrompt ?? DEFAULT_AGENT_GUARDRAILS_PROMPT,
      model: resolveAgentModel(agentQuery.data.model),
      temperature: agentQuery.data.temperature ?? DEFAULT_AGENT_TEMPERATURE,
    });
  }, [agentQuery.data, form]);

  const attachments = agentQuery.data?.knowledgeSources ?? [];
  const sourceStats = useMemo(() => {
    let files = 0;
    let links = 0;
    let totalBytes = 0;
    for (const item of attachments) {
      const source = item.knowledgeSource;
      if (source.type === "DOCUMENT") {
        files += 1;
        totalBytes += source.document?.size ?? 0;
      } else if (source.type === "WEBSITE") {
        links += source.website?.pagesCrawled || source.website?.pagesFound || 1;
      } else if (source.type === "TEXT_SNIPPET") {
        files += 1;
        totalBytes += source.textSnippet?.contentBytes ?? 0;
      }
    }
    return { files, links, totalBytes };
  }, [attachments]);

  const training = trainingSummary(attachments);
  const dataSourcesHref = workspaceSlug
    ? `/dashboard/${workspaceSlug}/agents/${agentId}/build/data-sources`
    : "#";
  const instructionsHref = workspaceSlug
    ? `/dashboard/${workspaceSlug}/agents/${agentId}/build/instructions`
    : "#";

  function onSave(values: AgentInstructionsValues) {
    updateAgent.mutate(
      {
        generalPrompt: values.generalPrompt,
        guardrailsPrompt: values.guardrailsPrompt,
        model: values.model,
        temperature: values.temperature,
      },
      {
        onSuccess: (agent) => {
          toastSuccess("Playground settings saved");
          form.reset({
            generalPrompt: agent.generalPrompt ?? values.generalPrompt,
            guardrailsPrompt:
              agent.guardrailsPrompt ?? values.guardrailsPrompt,
            model: resolveAgentModel(agent.model),
            temperature: agent.temperature ?? values.temperature,
          });
        },
        onError: (error) => {
          toastApiError(error, "Unable to save settings.");
        },
      },
    );
  }

  if (agentQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4 lg:h-[calc(100svh-2rem)] lg:overflow-hidden">
        <Skeleton className="h-8 w-40 shrink-0" />
        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl lg:h-full" />
        </div>
      </div>
    );
  }

  if (agentQuery.isError || !agentQuery.data) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        Unable to load playground.
      </div>
    );
  }

  const agent = agentQuery.data;

  return (
    <div className="flex flex-col gap-4 lg:h-[calc(100svh-2rem)] lg:overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Playground</h1>
          <p className="text-sm text-muted-foreground">
            Configure and test {agent.name} before you deploy.
          </p>
        </div>
        <Button
          type="button"
          disabled={!form.formState.isDirty || updateAgent.isPending}
          onClick={form.handleSubmit(onSave)}
        >
          {updateAgent.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)]">
        {/* Entire left column scrolls; cards keep natural height (no shrink/clip). */}
        <form
          onSubmit={form.handleSubmit(onSave)}
          className="min-h-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-1"
        >
          <div className="space-y-4 pb-2">
            <Card className="overflow-visible">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Controller
                  name="model"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Model</FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          if (value != null) field.onChange(value);
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_AGENT_MODELS.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                <Controller
                  name="temperature"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="gap-3">
                      <div className="flex items-center justify-between">
                        <FieldLabel>Temperature</FieldLabel>
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {field.value.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={(value) => {
                          const next = Array.isArray(value) ? value[0] : value;
                          if (typeof next === "number") field.onChange(next);
                        }}
                      />
                    </Field>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="overflow-visible">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Data sources</CardTitle>
                    <CardDescription>
                      Manage attach/detach on the Data sources page.
                    </CardDescription>
                  </div>
                  <Button
                    nativeButton={false}
                    render={<Link href={dataSourcesHref} />}
                    variant="outline"
                    size="sm"
                  >
                    Manage
                    <ExternalLink className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        training.tone === "ready" && "bg-emerald-500",
                        training.tone === "amber" && "bg-amber-500",
                        training.tone === "destructive" && "bg-destructive",
                        training.tone === "muted" && "bg-muted-foreground/50",
                      )}
                    />
                    {training.label}
                  </span>
                  <span className="text-muted-foreground">
                    {formatBytes(sourceStats.totalBytes)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <FileText className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium tabular-nums">
                        {sourceStats.files}
                      </p>
                      <p className="text-xs text-muted-foreground">Files</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
                    <Globe className="size-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium tabular-nums">
                        {sourceStats.links}
                      </p>
                      <p className="text-xs text-muted-foreground">Links</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-visible">
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Instructions</CardTitle>
                    <CardDescription>
                      Same prompts as Build → Instructions.
                    </CardDescription>
                  </div>
                  <Button
                    nativeButton={false}
                    render={<Link href={instructionsHref} />}
                    variant="ghost"
                    size="sm"
                  >
                    Open
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 overflow-visible p-0">
                <Controller
                  name="generalPrompt"
                  control={form.control}
                  render={({ field }) => (
                    <div>
                      <p className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
                        General
                      </p>
                      <Textarea
                        {...field}
                        rows={8}
                        placeholder="Describe the agent’s role…"
                        className="min-h-40 resize-y rounded-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  )}
                />
                <Controller
                  name="guardrailsPrompt"
                  control={form.control}
                  render={({ field }) => (
                    <div className="border-t">
                      <p className="border-b px-4 py-2 text-xs font-medium text-muted-foreground">
                        Guardrails
                      </p>
                      <Textarea
                        {...field}
                        rows={6}
                        placeholder="List hard rules…"
                        className="min-h-28 resize-y rounded-none border-0 bg-transparent px-4 py-3 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </form>

        <div className="min-h-0 lg:h-full">
          <ChatPreview
            agentName={agent.name}
            messages={chat.messages}
            status={chat.status}
            error={chat.error}
            isStreaming={chat.isStreaming}
            onSend={chat.sendMessage}
            onReset={chat.reset}
          />
        </div>
      </div>
    </div>
  );
}

function ChatPreview({
  agentName,
  messages,
  status,
  error,
  isStreaming,
  onSend,
  onReset,
}: {
  agentName: string;
  messages: ReturnType<typeof usePlaygroundChat>["messages"];
  status: string | null;
  error: string | null;
  isStreaming: boolean;
  onSend: (text: string) => void;
  onReset: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  return (
    <Card className="h-full min-h-[28rem] gap-0 py-0 lg:min-h-0 border-dashed bg-muted/30">
      <CardContent
        className={cn(
          "flex h-full min-h-0 flex-1 flex-col p-4 sm:p-6",
          "bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:18px_18px]",
        )}
      >
        <div className="relative mx-auto flex h-full min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{agentName}</p>
              <p className="text-xs text-muted-foreground">Playground preview</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onReset}
              disabled={isStreaming}
              aria-label="Reset conversation"
            >
              <RefreshCw className="size-4" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="mt-8 space-y-3 text-center">
                <p className="text-sm font-medium">
                  Hi! What can I help you with?
                </p>
                <p className="text-xs text-muted-foreground">
                  Ask a question to test retrieval and replies.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm",
                    message.role === "user"
                      ? "ml-auto whitespace-pre-wrap bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.role === "assistant" ? (
                    message.content ? (
                      <MarkdownContent content={message.content} />
                    ) : message.pending ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" />
                        Thinking…
                      </span>
                    ) : null
                  ) : (
                    message.content
                  )}
                  {message.role === "assistant" ? (
                    <AssistantMessageMeta message={message} />
                  ) : null}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 space-y-2 border-t p-3">
            {(status || error) && (
              <p
                className={cn(
                  "text-xs",
                  error ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {error ?? statusLabel(status)}
              </p>
            )}
            <ChatComposer disabled={isStreaming} onSend={onSend} />
            <p className="text-center text-[11px] text-muted-foreground">
              Powered by Support AI
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AssistantMessageMeta({
  message,
}: {
  message: ReturnType<typeof usePlaygroundChat>["messages"][number];
}) {
  const [elapsedMs, setElapsedMs] = useState(() =>
    message.startedAt ? Date.now() - message.startedAt : 0,
  );

  useEffect(() => {
    if (!message.pending || !message.startedAt) return;

    const tick = () => {
      setElapsedMs(Date.now() - message.startedAt!);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [message.pending, message.startedAt]);

  const timeLabel = message.pending
    ? formatResponseMs(elapsedMs)
    : message.responseMs != null
      ? formatResponseMs(message.responseMs)
      : null;

  const sourcesLabel =
    !message.pending && message.sources && message.sources.length > 0
      ? `${message.sources.length} source${message.sources.length === 1 ? "" : "s"} used`
      : null;

  if (!timeLabel && !sourcesLabel) return null;

  return (
    <p className="mt-2 border-t border-border/60 pt-2 text-[11px] text-muted-foreground tabular-nums">
      {[timeLabel, sourcesLabel].filter(Boolean).join(" · ")}
    </p>
  );
}

function ChatComposer({
  disabled,
  onSend,
}: {
  disabled: boolean;
  onSend: (text: string) => void;
}) {
  return (
    <form
      className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const message = String(data.get("message") ?? "");
        if (!message.trim() || disabled) return;
        onSend(message);
        form.reset();
      }}
    >
      <Input
        name="message"
        placeholder="Message…"
        disabled={disabled}
        autoComplete="off"
        className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <Button
        type="submit"
        size="icon-sm"
        disabled={disabled}
        aria-label="Send message"
        className="rounded-full"
      >
        {disabled ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArrowUp className="size-4" />
        )}
      </Button>
    </form>
  );
}
