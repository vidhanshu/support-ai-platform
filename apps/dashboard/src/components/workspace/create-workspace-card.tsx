import { useCreateWorkspace } from "@/hooks/api";
import { createWorkspaceSchema, CreateWorkspaceValues } from "@/lib/workspace";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, useForm } from "react-hook-form";

const CreateWorkspaceCard = () => {
  const router = useRouter();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const form = useForm<CreateWorkspaceValues>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (values: CreateWorkspaceValues) => {
    createWorkspace(values, {
      onSuccess: (data) => {
        router.push(`/dashboard/${data.slug}`);
      },
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="rounded-full flex items-center justify-center border size-12">
          <Users className="size-6" />
        </div>
        <CardTitle>Create workspace</CardTitle>
        <CardDescription>
          This is your workspace's visible name within Support AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="create-workspace-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-workspace-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-workspace-name"
                    placeholder="My workspace"
                    className="h-10"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="xl">
              Create
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateWorkspaceCard;
