"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { useCreateInvitation } from "@/hooks/api";
import { toastApiError, toastSuccess } from "@/lib/toast";
import {
  inviteMemberSchema,
  type InviteMemberValues,
} from "@/lib/workspace";

type InviteMembersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function InviteMembersSheet({
  open,
  onOpenChange,
}: InviteMembersSheetProps) {
  const createInvitation = useCreateInvitation();

  const form = useForm<InviteMemberValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      role: "MEMBER",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ email: "", role: "MEMBER" });
  }, [open, form]);

  function onSubmit(values: InviteMemberValues) {
    createInvitation.mutate(values, {
      onSuccess: () => {
        toastSuccess("Invitation sent");
        onOpenChange(false);
      },
      onError: (error) => {
        toastApiError(error, "Unable to send invitation.");
      },
    });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Invite members</SheetTitle>
          <SheetDescription>
            Send an email invite to join this workspace. They’ll need to sign in
            with the same email address to accept.
          </SheetDescription>
        </SheetHeader>

        <form
          id="invite-members-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto p-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    autoComplete="email"
                    className="h-10"
                    disabled={createInvitation.isPending}
                  />
                  {fieldState.invalid ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />

            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      if (value === "MEMBER" || value === "ADMIN") {
                        field.onChange(value);
                      }
                    }}
                    disabled={createInvitation.isPending}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEMBER">Member</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
            disabled={createInvitation.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-members-form"
            disabled={createInvitation.isPending}
          >
            {createInvitation.isPending ? "Sending…" : "Send invite"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
