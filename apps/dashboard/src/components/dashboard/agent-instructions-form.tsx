"use client";

import { useEffect } from "react";
import { Controller, useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldLabel } from "@repo/ui/components/field";
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
import { useAgent, useUpdateAgent } from "@/hooks/api";
import {
  agentInstructionsSchema,
  AVAILABLE_AGENT_MODELS,
  DEFAULT_AGENT_GENERAL_PROMPT,
  DEFAULT_AGENT_GUARDRAILS_PROMPT,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_TEMPERATURE,
  type AgentInstructionsValues,
} from "@/lib/agents";
import { toastApiError, toastSuccess } from "@/lib/toast";

type AgentInstructionsFormProps = {
  agentId: string;
};

export function AgentInstructionsForm({ agentId }: AgentInstructionsFormProps) {
  const agentQuery = useAgent(agentId);
  const updateAgent = useUpdateAgent(agentId);

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
      model: DEFAULT_AGENT_MODEL,
      temperature:
        agentQuery.data.temperature ?? DEFAULT_AGENT_TEMPERATURE,
    });
  }, [agentQuery.data, form]);

  const isDirty = form.formState.isDirty;

  function onSubmit(values: AgentInstructionsValues) {
    updateAgent.mutate(
      {
        generalPrompt: values.generalPrompt,
        guardrailsPrompt: values.guardrailsPrompt,
        model: values.model,
        temperature: values.temperature,
      },
      {
        onSuccess: (agent) => {
          toastSuccess("Instructions saved");
          form.reset({
            generalPrompt: agent.generalPrompt ?? values.generalPrompt,
            guardrailsPrompt:
              agent.guardrailsPrompt ?? values.guardrailsPrompt,
            model: DEFAULT_AGENT_MODEL,
            temperature: agent.temperature ?? values.temperature,
          });
        },
        onError: (error) => {
          toastApiError(error, "Unable to save instructions.");
        },
      },
    );
  }

  if (agentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (agentQuery.isError || !agentQuery.data) {
    return (
      <div className="rounded-xl border p-8 text-center text-muted-foreground">
        Unable to load agent instructions.
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Instructions</h1>
          <p className="text-sm text-muted-foreground">
            Define how {agentQuery.data.name} should behave.
          </p>
        </div>
        <Button type="submit" disabled={!isDirty || updateAgent.isPending}>
          {updateAgent.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <PromptEditorCard
            title="General"
            description="Business context, role, and core behavior."
            name="generalPrompt"
            control={form.control}
            placeholder="Describe the agent’s role and business context…"
          />
          <PromptEditorCard
            title="Guardrails"
            description="Hard rules the agent must always follow."
            name="guardrailsPrompt"
            control={form.control}
            placeholder="List safety and style rules…"
          />
        </div>

        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>Model configuration</CardTitle>
            <CardDescription>
              Choose the model and response creativity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reserved</span>
                    <span>Creative</span>
                  </div>
                </Field>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function PromptEditorCard({
  title,
  description,
  name,
  control,
  placeholder,
}: {
  title: string;
  description: string;
  name: "generalPrompt" | "guardrailsPrompt";
  control: Control<AgentInstructionsValues>;
  placeholder: string;
}) {
  return (
    <Card>
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              placeholder={placeholder}
              className="min-h-56 resize-y rounded-none border-0 bg-transparent px-4 py-4 shadow-none focus-visible:ring-0"
            />
          )}
        />
        <p className="border-t px-4 py-2 text-xs text-muted-foreground">
          Enter ↵ for new paragraph
        </p>
      </CardContent>
    </Card>
  );
}
