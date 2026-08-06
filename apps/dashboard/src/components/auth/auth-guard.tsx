"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AUTH_LOGIN_PATH, hasSession } from "@/lib/auth/tokens";
import { LoaderCircle } from "lucide-react";

type AuthGuardProps = {
  children: React.ReactNode;
};

/**
 * Protects private routes. Unauthenticated users are sent to login.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasSession()) {
      const search = searchParams.toString();
      const next = encodeURIComponent(
        search ? `${pathname}?${search}` : pathname,
      );
      router.replace(`${AUTH_LOGIN_PATH}&next=${next}`);
      return;
    }
    setReady(true);
  }, [pathname, router, searchParams]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-6 animate-spin" />
      </div>
    );
  }

  return children;
}
