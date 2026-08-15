export type WidgetPosition = "bottom-right" | "bottom-left";

export type SupportAIWidgetConfig = {
  agentId: string;
  apiKey: string;
  /** API base including `/v1`. */
  apiUrl: string;
  /** Launcher / header accent. */
  primaryColor?: string;
  /** Panel header title override (defaults to agent name). */
  title?: string;
  /** Shown before the first message. */
  greeting?: string;
  position?: WidgetPosition;
  /** Extra headers for the public API. */
  headers?: Record<string, string>;
  /** Mount under this element; defaults to `document.body`. */
  container?: HTMLElement;
  /** localStorage key suffix; defaults to agentId. */
  storageKey?: string;
};

export type SupportAIWidgetHandle = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  destroy: () => void;
  isOpen: () => boolean;
};
