"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { useCreateAgent } from "@/hooks/api";
import {
  createAgentSchema,
  DEFAULT_AGENT_MODEL,
  DEFAULT_AGENT_SYSTEM_PROMPT,
  DEFAULT_AGENT_TEMPERATURE,
  type CreateAgentValues,
} from "@/lib/agents";
import { toastApiError, toastSuccess } from "@/lib/toast";

type CreateAgentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateAgentDialog({
  open,
  onOpenChange,
}: CreateAgentDialogProps) {
  const router = useRouter();
  const params = useParams<{ workspaceSlug?: string }>();
  const createAgent = useCreateAgent();

  const form = useForm<CreateAgentValues>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: DEFAULT_AGENT_SYSTEM_PROMPT,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: "",
      description: "",
      systemPrompt: DEFAULT_AGENT_SYSTEM_PROMPT,
    });
  }, [open, form]);

  function onSubmit(values: CreateAgentValues) {
    createAgent.mutate(
      {
        name: values.name,
        description: values.description?.trim() || undefined,
        systemPrompt:
          values.systemPrompt?.trim() || DEFAULT_AGENT_SYSTEM_PROMPT,
        model: DEFAULT_AGENT_MODEL,
        temperature: DEFAULT_AGENT_TEMPERATURE,
      },
      {
        onSuccess: (agent) => {
          toastSuccess("Agent created");
          onOpenChange(false);
          const slug = params.workspaceSlug;
          if (slug) {
            router.push(`/dashboard/${slug}/agents/${agent.id}/playground`);
          }
        },
        onError: (error) => {
          toastApiError(error, "Unable to create agent. Please try again.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" showCloseButton>
        <DialogHeader>
          <DialogTitle>Create agent</DialogTitle>
          <DialogDescription>
            Set up a new AI support agent for this workspace. Model is fixed to{" "}
            {DEFAULT_AGENT_MODEL}.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-agent-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-agent-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-agent-name"
                    placeholder="Customer Support Agent"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-agent-description">
                    Description
                  </FieldLabel>
                  <Input
                    {...field}
                    id="create-agent-description"
                    placeholder="Handles billing and account questions"
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>Optional</FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="systemPrompt"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-agent-system-prompt">
                    System prompt
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="create-agent-system-prompt"
                    rows={8}
                    className="min-h-40 resize-y"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Instructions that shape how the agent responds.
                  </FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createAgent.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-agent-form"
            disabled={createAgent.isPending}
          >
            {createAgent.isPending ? "Creating…" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
