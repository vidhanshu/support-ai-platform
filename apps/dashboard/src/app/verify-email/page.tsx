"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import Logo from "@/components/common/logo";
import { authApi, getErrorMessage } from "@/lib/api";
import {
  AUTH_DEFAULT_REDIRECT,
  AUTH_LOGIN_PATH,
  hasSession,
} from "@/lib/auth/tokens";
import { toastSuccess } from "@/lib/toast";

type VerifyStatus = "loading" | "success" | "error";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const started = useRef(false);

  const [status, setStatus] = useState<VerifyStatus>(
    token ? "loading" : "error",
  );
  const [errorMessage, setErrorMessage] = useState(
    token
      ? ""
      : "This verification link is missing a token. Request a new email from your account.",
  );

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    void authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        toastSuccess("Email verified");
        const target = hasSession()
          ? AUTH_DEFAULT_REDIRECT
          : `${AUTH_LOGIN_PATH}&verified=1`;
        window.setTimeout(() => {
          router.replace(target);
        }, 1500);
      })
      .catch((error: unknown) => {
        setStatus("error");
        setErrorMessage(
          getErrorMessage(
            error,
            "This verification link is invalid or has expired.",
          ),
        );
      });
  }, [token, router]);

  if (status === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Unable to verify email</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            nativeButton={false}
            render={<Link href={AUTH_LOGIN_PATH} />}
          >
            Go to login
          </Button>
          <Button
            type="button"
            variant="outline"
            nativeButton={false}
            render={<Link href="/auth?mode=signup" />}
          >
            Sign up
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email is confirmed. Redirecting you now…
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Almost done…
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verifying email</CardTitle>
        <CardDescription>
          We’re confirming your email address. This only takes a moment.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
        Verifying…
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
      <Logo />
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            Loading…
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
