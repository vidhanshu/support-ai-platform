import { mountWidget } from "./mount";
import type { SupportAIWidgetConfig, SupportAIWidgetHandle } from "./types";

export type { SupportAIWidgetConfig, SupportAIWidgetHandle, WidgetPosition } from "./types";

let active: SupportAIWidgetHandle | null = null;

function readScriptDataset(): Partial<SupportAIWidgetConfig> {
  const script =
    document.currentScript instanceof HTMLScriptElement
      ? document.currentScript
      : document.querySelector<HTMLScriptElement>("script[data-agent-id][data-api-key]");

  if (!script) return {};

  const dataset = script.dataset;
  return {
    agentId: dataset.agentId,
    apiKey: dataset.apiKey,
    apiUrl: dataset.apiUrl,
    primaryColor: dataset.primaryColor,
    title: dataset.title,
    greeting: dataset.greeting,
    position:
      dataset.position === "bottom-left" || dataset.position === "bottom-right"
        ? dataset.position
        : undefined,
  };
}

/**
 * Mount the floating chat widget. Calling again destroys the previous instance.
 */
export function init(config: SupportAIWidgetConfig): SupportAIWidgetHandle {
  active?.destroy();
  active = mountWidget(config);
  return active;
}

/** Destroy the current widget instance, if any. */
export function destroy() {
  active?.destroy();
  active = null;
}

export { mountWidget };

declare global {
  interface Window {
    SupportAI?: {
      init: typeof init;
      destroy: typeof destroy;
      mountWidget: typeof mountWidget;
    };
  }
}

if (typeof window !== "undefined") {
  window.SupportAI = { init, destroy, mountWidget };

  // Auto-init when loaded via <script data-agent-id data-api-key data-api-url>
  queueMicrotask(() => {
    const fromScript = readScriptDataset();
    if (fromScript.agentId && fromScript.apiKey && fromScript.apiUrl) {
      init(fromScript as SupportAIWidgetConfig);
    }
  });
}
