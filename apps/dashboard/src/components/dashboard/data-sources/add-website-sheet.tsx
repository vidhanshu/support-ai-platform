"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
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
import { useCreateWebsite } from "@/hooks/api";
import { toastApiError, toastSuccess } from "@/lib/toast";

const schema = z.object({
  url: z
    .string()
    .trim()
    .url({ message: "Enter a valid URL (including https://)" }),
  name: z.string().trim().max(100).optional(),
  maxPages: z.coerce.number().int().min(1).max(200).optional(),
});

type FormValues = z.infer<typeof schema>;

type AddWebsiteSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, newly created sources are also attached to this agent. */
  agentId?: string;
};

export function AddWebsiteSheet({
  open,
  onOpenChange,
  agentId,
}: AddWebsiteSheetProps) {
  const createWebsite = useCreateWebsite(agentId);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      url: "",
      name: "",
      maxPages: 50,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ url: "", name: "", maxPages: 50 });
  }, [open, form]);

  function onSubmit(values: FormValues) {
    createWebsite.mutate(
      {
        url: values.url,
        name: values.name?.trim() || undefined,
        maxPages: values.maxPages,
      },
      {
        onSuccess: () => {
          toastSuccess("Website crawl started");
          onOpenChange(false);
        },
        onError: (error) => {
          toastApiError(error, "Unable to add website.");
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
          <SheetTitle>Add website</SheetTitle>
          <SheetDescription>
            Crawl a website into the workspace knowledge library.
          </SheetDescription>
        </SheetHeader>

        <form
          id="add-website-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-4"
        >
          <FieldGroup>
            <Controller
              name="url"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="website-url">Website URL</FieldLabel>
                  <Input
                    {...field}
                    id="website-url"
                    placeholder="https://example.com"
                    autoComplete="url"
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="website-name">Display name</FieldLabel>
                  <Input
                    {...field}
                    id="website-name"
                    placeholder="Optional — defaults to hostname"
                  />
                  <FieldDescription>Optional</FieldDescription>
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name="maxPages"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="website-max-pages">Max pages</FieldLabel>
                  <Input
                    {...field}
                    id="website-max-pages"
                    type="number"
                    min={1}
                    max={200}
                  />
                  <FieldDescription>
                    Caps how many pages are crawled (max 200).
                  </FieldDescription>
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
            disabled={createWebsite.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-website-form"
            disabled={createWebsite.isPending}
          >
            {createWebsite.isPending ? "Adding…" : "Add website source"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
