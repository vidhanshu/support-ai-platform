import { Suspense } from "react";
import { GuestGuard } from "@/components/auth/guest-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <GuestGuard>{children}</GuestGuard>
    </Suspense>
  );
}
