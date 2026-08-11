"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { useCreateTextSnippet } from "@/hooks/api";
import { TEXT_SNIPPET_MAX_BYTES } from "@/lib/knowledge/constants";
import { toastApiError, toastSuccess } from "@/lib/toast";
import { RichTextEditor } from "./rich-text-editor";

function isEmptyHtml(html: string) {
  return (
    html
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/gi, " ")
      .trim().length === 0
  );
}

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be at most 200 characters" }),
  contentHtml: z
    .string()
    .refine((value) => !isEmptyHtml(value), {
      message: "Enter some text",
    })
    .refine(
      (value) =>
        isEmptyHtml(value) ||
        new TextEncoder().encode(value).length <= TEXT_SNIPPET_MAX_BYTES,
      { message: "Text snippet must be at most 1.0 MB" },
    ),
});

type FormValues = z.infer<typeof schema>;

type AddTextSnippetSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, newly created sources are also attached to this agent. */
  agentId?: string;
};

export function AddTextSnippetSheet({
  open,
  onOpenChange,
  agentId,
}: AddTextSnippetSheetProps) {
  const createSnippet = useCreateTextSnippet(agentId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      contentHtml: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ title: "", contentHtml: "" });
  }, [open, form]);

  function onSubmit(values: FormValues) {
    createSnippet.mutate(
      {
        title: values.title.trim(),
        contentHtml: values.contentHtml,
      },
      {
        onSuccess: () => {
          toastSuccess("Text snippet added");
          onOpenChange(false);
        },
        onError: (error) => {
          toastApiError(error, "Unable to add text snippet.");
        },
      },
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 sm:max-w-xl data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b">
          <SheetTitle>Add text snippet</SheetTitle>
          <SheetDescription>
            Paste or write knowledge that should be searchable by your agents.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-text-snippet-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="snippet-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="snippet-title"
                    placeholder="Ex: Refund requests"
                    autoComplete="off"
                    disabled={createSnippet.isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="contentHtml"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Content</FieldLabel>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    maxBytes={TEXT_SNIPPET_MAX_BYTES}
                    disabled={createSnippet.isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <SheetFooter className="border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createSnippet.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-text-snippet-form"
            disabled={createSnippet.isPending}
          >
            {createSnippet.isPending ? "Adding…" : "Add text snippet"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
