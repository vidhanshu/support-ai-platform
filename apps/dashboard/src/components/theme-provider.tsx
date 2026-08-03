"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useIsClient } from "usehooks-ts";
import { Button, type ButtonProps } from "@repo/ui/components/button";
import { type LucideProps, Moon, Sun } from "lucide-react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeToggle({
  iconOnly = false,
  iconProps,
  ...props
}: { iconOnly?: boolean; iconProps?: LucideProps } & ButtonProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  // Same placeholder on server + first client paint (theme is unknown until hydrated).
  if (!isClient) {
    return (
      <Button variant="outline" disabled aria-hidden {...props}>
        <Sun {...iconProps} className="opacity-0" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      {...props}
    >
      {isDark ? (
        iconOnly ? (
          <Sun {...iconProps} />
        ) : (
          <span className="flex items-center gap-x-2">
            <Sun {...iconProps} /> Light
          </span>
        )
      ) : iconOnly ? (
        <Moon {...iconProps} />
      ) : (
        <span className="flex items-center gap-x-2">
          <Moon {...iconProps} /> Dark
        </span>
      )}
    </Button>
  );
}
