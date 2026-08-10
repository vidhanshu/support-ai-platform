"use client";

import { useEffect, useState, type ReactNode } from "react";
import { UpgradePlanDialog } from "./upgrade-plan-dialog";
import { registerPlanUpgradeHandler } from "@/lib/billing/plan-upgrade";

type PlanUpgradeProviderProps = {
  children: ReactNode;
};

export function PlanUpgradeProvider({ children }: PlanUpgradeProviderProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "You've reached a limit on your current plan.",
  );

  useEffect(() => {
    registerPlanUpgradeHandler((options) => {
      setMessage(
        options.message || "You've reached a limit on your current plan.",
      );
      setOpen(true);
    });

    return () => {
      registerPlanUpgradeHandler(null);
    };
  }, []);

  return (
    <>
      {children}
      <UpgradePlanDialog
        open={open}
        onOpenChange={setOpen}
        message={message}
      />
    </>
  );
}
