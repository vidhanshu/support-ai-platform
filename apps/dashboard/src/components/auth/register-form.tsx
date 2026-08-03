"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { registerSchema, type RegisterValues } from "@/lib/auth/schemas";
import { useRegister } from "@/hooks/api";

export function RegisterForm() {
  const register = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterValues) {
    register.mutate({
      email: values.email,
      password: values.password,
    });
  }

  return (
    <form
      id="register-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-email">Email</FieldLabel>
              <Input
                {...field}
                id="register-email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                aria-invalid={fieldState.invalid}
                className="h-10"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-password">Password</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={fieldState.invalid}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <FieldDescription>At least 8 characters.</FieldDescription>
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="confirmPassword"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="register-confirm-password">
                Confirm password
              </FieldLabel>
              <Input
                {...field}
                id="register-confirm-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={fieldState.invalid}
                className="h-10"
              />
              {fieldState.invalid && (
                <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />
      </FieldGroup>

      <Button
        type="submit"
        size="lg"
        className="h-10 w-full"
        disabled={register.isPending}
      >
        {register.isPending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
