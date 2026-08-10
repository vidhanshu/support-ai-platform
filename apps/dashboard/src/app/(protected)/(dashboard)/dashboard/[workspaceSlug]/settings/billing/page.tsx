import { Suspense } from "react";
import { BillingSettingsView } from "@/components/dashboard/settings/billing-settings-view";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <BillingSettingsView />
    </Suspense>
  );
}
