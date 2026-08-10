import { toast } from "sonner";
import { getErrorMessage, isPlanLimitError } from "@/lib/api";

export function toastApiError(error: unknown, fallback: string) {
  const message = getErrorMessage(error, fallback);

  if (isPlanLimitError(error)) {
    toast.error(message, {
      action: {
        label: "View plans",
        onClick: () => {
          const match = window.location.pathname.match(
            /^\/dashboard\/[^/]+/,
          );
          if (match) {
            window.location.href = `${match[0]}/settings/plans`;
          }
        },
      },
    });
    return;
  }

  toast.error(message);
}

export function toastSuccess(message: string) {
  toast.success(message);
}
