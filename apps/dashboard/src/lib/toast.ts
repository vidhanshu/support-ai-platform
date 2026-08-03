import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";

export function toastApiError(error: unknown, fallback: string) {
  toast.error(getErrorMessage(error, fallback));
}

export function toastSuccess(message: string) {
  toast.success(message);
}
