"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Button, ButtonProps } from "@repo/ui/components/button";
import { LucideProps, Moon, Sun } from "lucide-react";

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
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const handleThemeChange = () => {
    setTheme(isDark ? "light" : "dark");
  };
  return (
    <Button variant="outline" onClick={handleThemeChange} {...props}>
      {isDark ? (
        <>
          {iconOnly ? (
            <Sun {...iconProps} />
          ) : (
            <span className="flex items-center gap-x-2">
              <Sun {...iconProps} /> Light
            </span>
          )}
        </>
      ) : (
        <>
          {iconOnly ? (
            <Moon {...iconProps} />
          ) : (
            <span className="flex items-center gap-x-2">
              <Moon {...iconProps} /> Dark
            </span>
          )}
        </>
      )}
    </Button>
  );
}
