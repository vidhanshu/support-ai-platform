export type PlanUpgradeOptions = {
  /** API / user-facing reason, e.g. "Your FREE plan allows up to 1 agents." */
  message: string;
};

type PlanUpgradeHandler = (options: PlanUpgradeOptions) => void;

let handler: PlanUpgradeHandler | null = null;

/** Called by PlanUpgradeProvider on mount. */
export function registerPlanUpgradeHandler(next: PlanUpgradeHandler | null) {
  handler = next;
}

/** Open the upgrade modal from anywhere (toasts, catch blocks, etc.). */
export function openPlanUpgradeModal(options: PlanUpgradeOptions) {
  if (handler) {
    handler(options);
    return;
  }

  // Fallback if provider isn't mounted yet
  const match = window.location.pathname.match(/^\/dashboard\/[^/]+/);
  if (match) {
    window.location.href = `${match[0]}/settings/plans`;
  }
}
