import { Suspense } from "react";
import { AuthView } from "@/components/auth/auth-view";

function AuthFallback() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="mb-16 flex items-center justify-between">
          <div className="h-7 w-36 animate-pulse rounded bg-muted" />
          <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mx-auto w-full max-w-[400px] flex-1 space-y-4 pt-10">
          <div className="h-9 w-56 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
      <div className="hidden bg-primary lg:block" />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthView />
    </Suspense>
  );
}
