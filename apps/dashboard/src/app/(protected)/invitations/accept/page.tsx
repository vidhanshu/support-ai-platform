"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useAcceptInvitation } from "@/hooks/api";
import { ApiError, getErrorMessage } from "@/lib/api";
import {
  AUTH_LOGIN_PATH,
  hasSession,
  redirectToLogin,
  setWorkspaceId,
} from "@/lib/auth/tokens";
import { toastApiError, toastSuccess } from "@/lib/toast";

const CREATE_WORKSPACE_PATH = "/dashboard/create";
const ERROR_REDIRECT_MS = 2500;

type AcceptStatus = "idle" | "loading" | "success" | "error";

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const accept = useAcceptInvitation();
  const started = useRef(false);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<AcceptStatus>(
    token ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(
    token
      ? ""
      : "This invite link is missing a token. Ask your admin to resend the invitation.",
  );

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    setStatus("loading");
    setErrorMessage("");

    void accept
      .mutateAsync(token)
      .then((result) => {
        setStatus("success");
        setWorkspaceId(result.workspaceId);
        toastSuccess(`Joined ${result.name}`);
        router.replace(`/dashboard/${result.slug}`);
      })
      .catch((error: unknown) => {
        const message = getErrorMessage(
          error,
          "This invitation may be expired or meant for a different email.",
        );
        setStatus("error");
        setErrorMessage(message);
        toastApiError(error, message);

        const isUnauthorized =
          error instanceof ApiError && error.status === 401;

        if (isUnauthorized || !hasSession()) {
          redirectTimer.current = setTimeout(() => {
            redirectToLogin({
              next: `/invitations/accept?token=${encodeURIComponent(token)}`,
            });
          }, ERROR_REDIRECT_MS);
          return;
        }

        redirectTimer.current = setTimeout(() => {
          router.replace(CREATE_WORKSPACE_PATH);
        }, ERROR_REDIRECT_MS);
      });
    // Intentionally run once per token — mutateAsync identity is unstable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function goToFallback() {
    if (redirectTimer.current) clearTimeout(redirectTimer.current);

    if (!hasSession()) {
      const next = token
        ? `/invitations/accept?token=${encodeURIComponent(token)}`
        : CREATE_WORKSPACE_PATH;
      router.replace(
        `${AUTH_LOGIN_PATH}&next=${encodeURIComponent(next)}`,
      );
      return;
    }

    router.replace(CREATE_WORKSPACE_PATH);
  }

  if (status === "error") {
    const loggedIn = hasSession();
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {token ? "Unable to accept invite" : "Invalid invitation"}
          </CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground">
            Redirecting to {loggedIn ? "create workspace" : "login"}…
          </p>
          <Button type="button" onClick={goToFallback}>
            {loggedIn ? "Create workspace" : "Go to login"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Accepting invitation</CardTitle>
        <CardDescription>
          We’re adding you to the workspace. This only takes a moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Joining workspace…
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitationPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading…
          </div>
        }
      >
        <AcceptInvitationContent />
      </Suspense>
    </div>
  );
}
