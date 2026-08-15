"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Info } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useDeleteWorkspace,
  useUpdateWorkspace,
} from "@/hooks/api";
import { useActiveWorkspace } from "@/hooks/use-active-workspace";
import { clearWorkspaceId } from "@/lib/auth/tokens";
import { getErrorMessage } from "@/lib/api";
import { toastApiError, toastSuccess } from "@/lib/toast";
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceValues,
} from "@/lib/workspace";

export function GeneralSettingsView() {
  const router = useRouter();
  const { workspace, workspaceId, isLoading } = useActiveWorkspace();
  const updateWorkspace = useUpdateWorkspace(workspaceId ?? "");
  const deleteWorkspace = useDeleteWorkspace();
  const { confirm, confirmationDialog } = useConfirmDialog();

  const isOwner = workspace?.role === "OWNER";

  const form = useForm<UpdateWorkspaceValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  useEffect(() => {
    if (!workspace) return;
    form.reset({
      name: workspace.name,
      slug: workspace.slug,
    });
  }, [workspace, form]);

  function onSubmit(values: UpdateWorkspaceValues) {
    if (!workspaceId || !isOwner) return;

    const payload: { name?: string; slug?: string } = {};
    if (values.name !== workspace?.name) payload.name = values.name;
    if (values.slug !== workspace?.slug) payload.slug = values.slug;

    if (!payload.name && !payload.slug) {
      toastSuccess("No changes to save");
      return;
    }

    updateWorkspace.mutate(payload, {
      onSuccess: (updated) => {
        toastSuccess("Workspace updated");
        if (updated.slug !== workspace?.slug) {
          router.replace(`/dashboard/${updated.slug}/settings`);
        }
      },
      onError: (error) => {
        toastApiError(error, "Unable to update workspace.");
        const message = getErrorMessage(error, "Unable to update workspace.");
        if (message.toLowerCase().includes("url")) {
          form.setError("slug", { message });
        }
      },
    });
  }

  async function handleDelete() {
    if (!workspaceId || !isOwner) return;

    const confirmed = await confirm({
      title: "Delete workspace?",
      description:
        "This permanently deletes the workspace, agents, and uploaded data. This cannot be undone.",
      confirmLabel: "Delete",
      loadingLabel: "Deleting…",
      variant: "destructive",
      action: async () => {
        try {
          await deleteWorkspace.mutateAsync(workspaceId);
        } catch (error) {
          toastApiError(error, "Failed to delete workspace");
          throw error;
        }
      },
    });

    if (!confirmed) return;

    clearWorkspaceId();
    toastSuccess("Workspace deleted");
    router.replace("/dashboard");
  }

  if (isLoading || !workspace) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-56 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-10">
      <h1 className="text-3xl font-semibold tracking-tight">General</h1>

      <section className="rounded-xl border bg-card">
        <div className="space-y-6 p-6">
          <h2 className="text-base font-semibold">Workspace details</h2>

          <form
            id="workspace-details-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-name">
                      Workspace name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-name"
                      disabled={!isOwner || updateWorkspace.isPending}
                      className="h-10"
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : null}
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="workspace-slug">
                      Workspace URL
                    </FieldLabel>
                    <Input
                      {...field}
                      id="workspace-slug"
                      disabled={!isOwner || updateWorkspace.isPending}
                      className="h-10"
                      onChange={(event) => {
                        field.onChange(
                          event.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        );
                      }}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Info className="mt-0.5 size-3.5 shrink-0" />
                        Changing the workspace URL will redirect you to the new
                        address
                      </p>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </div>

        <div className="flex justify-end border-t px-6 py-4">
          <Button
            type="submit"
            form="workspace-details-form"
            disabled={!isOwner || updateWorkspace.isPending}
          >
            {updateWorkspace.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </section>

      {isOwner ? (
        <div className="space-y-6">
          <div className="relative flex items-center justify-center">
            <Separator />
            <span className="absolute bg-background px-3 text-xs font-semibold tracking-wide text-destructive uppercase">
              Danger zone
            </span>
          </div>

          <section className="rounded-xl border border-destructive/30 bg-card">
            <div className="space-y-2 p-6">
              <h2 className="text-base font-semibold">Delete workspace</h2>
              <p className="text-sm text-muted-foreground">
                Once you delete your workspace, there is no going back. Please
                be certain. All your uploaded data and trained agents will be
                deleted.
              </p>
            </div>
            <div className="flex justify-end border-t border-destructive/20 px-6 py-4">
              <Button
                type="button"
                variant="destructive"
                disabled={deleteWorkspace.isPending}
                onClick={() => void handleDelete()}
              >
                Delete
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmationDialog}
    </div>
  );
}
