"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { useLogin } from "@/hooks/api";

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: LoginValues) {
    login.mutate(values);
  }

  return (
    <form
      id="login-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
    >
      <FieldGroup>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email</FieldLabel>
              <Input
                {...field}
                id="login-email"
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
              <div className="flex items-center justify-between gap-2">
                <FieldLabel htmlFor="login-password">Password</FieldLabel>
                <Link
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  {...field}
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
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
        disabled={login.isPending}
      >
        {login.isPending ? "Logging in…" : "Login"}
      </Button>
    </form>
  );
}
