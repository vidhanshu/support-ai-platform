import { toast } from "sonner";
import { getErrorMessage, isPlanLimitError } from "@/lib/api";
import { openPlanUpgradeModal } from "@/lib/billing/plan-upgrade";

export function toastApiError(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  if (isPlanLimitError(error)) {
    openPlanUpgradeModal({ message });
    return;
  }

  toast.error(message);
}

export function toastSuccess(message: string) {
  toast.success(message);
}
