"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "@repo/ui/components/sonner";
import { TooltipProvider } from "@repo/ui/components/tooltip";
import { PlanUpgradeProvider } from "@/components/dashboard/billing/plan-upgrade-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlanUpgradeProvider>{children}</PlanUpgradeProvider>
      </TooltipProvider>
      <Toaster richColors position="top-right" closeButton />
    </QueryClientProvider>
  );
}
