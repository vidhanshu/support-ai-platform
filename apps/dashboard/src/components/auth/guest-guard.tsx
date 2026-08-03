"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AUTH_DEFAULT_REDIRECT,
  hasSession,
} from "@/lib/auth/tokens";
import { LoaderCircle } from "lucide-react";

type GuestGuardProps = {
  children: React.ReactNode;
};

/**
 * Protects guest-only routes (login/register).
 * Authenticated users are sent to the app (or `next` if safe).
 */
export function GuestGuard({ children }: GuestGuardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (hasSession()) {
      const next = searchParams.get("next");
      const target =
        next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/auth")
          ? next
          : AUTH_DEFAULT_REDIRECT;
      router.replace(target);
      return;
    }
    setReady(true);
  }, [router, searchParams]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">
          <LoaderCircle className="size-6 animate-spin"/>
        </p>
      </div>
    );
  }

  return children;
}
