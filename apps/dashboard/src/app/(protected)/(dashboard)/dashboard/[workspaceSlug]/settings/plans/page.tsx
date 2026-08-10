import { Suspense } from "react";
import { PlansSettingsView } from "@/components/dashboard/settings/plans-settings-view";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PlansSettingsView />
    </Suspense>
  );
}
