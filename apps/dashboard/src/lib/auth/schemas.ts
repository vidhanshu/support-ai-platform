import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email is required.")
      .email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must be at most 72 characters."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(64, "Name must be at most 64 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type CreateWorkspaceValues = z.infer<typeof createWorkspaceSchema>;
