import z from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1, { message: "Workspace name is required" }),
});

export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;

export const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Workspace name must be at least 2 characters" }),
  slug: z
    .string()
    .trim()
    .min(2, { message: "Workspace URL must be at least 2 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Use lowercase letters, numbers, and hyphens (e.g. my-workspace)",
    }),
});

export type UpdateWorkspaceValues = z.infer<typeof updateWorkspaceSchema>;

export const inviteMemberSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Enter a valid email address" }),
  role: z.enum(["MEMBER", "ADMIN"]),
});

export type InviteMemberValues = z.infer<typeof inviteMemberSchema>;
