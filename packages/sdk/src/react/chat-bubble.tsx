"use client";

import { useState, type CSSProperties } from "react";
import { ChatPanel, type ChatPanelProps } from "./chat-panel";

export type ChatBubblePosition = "bottom-right" | "bottom-left";

export type ChatBubbleProps = Omit<ChatPanelProps, "onClose" | "style" | "className"> & {
  /** Corner of the viewport. Default: bottom-right. */
  position?: ChatBubblePosition;
  /** Start with the panel open. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** z-index for the floating stack. Default: 2147483000 */
  zIndex?: number;
  className?: string;
  style?: CSSProperties;
  panelClassName?: string;
  panelStyle?: CSSProperties;
};

/**
 * Floating support bubble (launcher + chat panel) — typical website widget UX.
 * Must be rendered inside `SupportAIProvider`.
 */
export function ChatBubble({
  position = "bottom-right",
  primaryColor = "#111111",
  theme = "light",
  defaultOpen = false,
  open: openControlled,
  onOpenChange,
  zIndex = 2147483000,
  className,
  style,
  panelClassName,
  panelStyle,
  ...panelProps
}: ChatBubbleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = openControlled !== undefined;
  const open = isControlled ? openControlled : uncontrolledOpen;

  function setOpen(next: boolean) {
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }

  const isRight = position === "bottom-right";

  return (
    <div
      className={className}
      data-support-ai-bubble=""
      style={{
        position: "fixed",
        zIndex,
        bottom: 20,
        ...(isRight ? { right: 20 } : { left: 20 }),
        display: "flex",
        flexDirection: "column",
        alignItems: isRight ? "flex-end" : "flex-start",
        gap: 12,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        ...style,
      }}
    >
      {open ? (
        <div
          style={{
            width: "min(380px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 100px))",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.16)",
          }}
        >
          <ChatPanel
            {...panelProps}
            theme={theme}
            primaryColor={primaryColor}
            className={panelClassName}
            onClose={() => setOpen(false)}
            style={{
              minHeight: 0,
              height: "100%",
              borderRadius: 16,
              ...panelStyle,
            }}
          />
        </div>
      ) : null}

      <button
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          appearance: "none",
          border: 0,
          width: 56,
          height: 56,
          borderRadius: 999,
          background: primaryColor,
          color: "#fff",
          boxShadow: "0 18px 50px rgba(0, 0, 0, 0.16)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M18.3 5.7a1 1 0 0 0-1.4-1.4L12 9.17 7.1 4.3A1 1 0 0 0 5.7 5.7L10.17 12 5.7 16.9a1 1 0 1 0 1.4 1.4L12 14.83l4.9 4.87a1 1 0 0 0 1.4-1.4L13.83 12l4.47-4.9z"
            />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
