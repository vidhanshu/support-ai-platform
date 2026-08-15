"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "./use-chat";

export type ChatPanelProps = {
  title?: string;
  greeting?: string;
  primaryColor?: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  /** Shown in the header (e.g. close for ChatBubble). */
  onClose?: () => void;
};

function normalizeContent(content: string): string {
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?b>/gi, "**")
    .replace(/<\/?strong>/gi, "**")
    .replace(/<\/?i>/gi, "_")
    .replace(/<\/?em>/gi, "_");
}

function MessageBody({
  role,
  content,
  pending,
}: {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
}) {
  if (role === "user") {
    return <>{content}</>;
  }

  if (!content) {
    return <>{pending ? "…" : ""}</>;
  }

  return (
    <div
      style={{
        maxWidth: "100%",
        overflowWrap: "anywhere",
      }}
      className="sai-sdk-md"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer noopener">
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p style={{ margin: "0.5em 0", lineHeight: 1.5 }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.25em",
                listStyle: "disc",
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                margin: "0.5em 0",
                paddingLeft: "1.25em",
                listStyle: "decimal",
              }}
            >
              {children}
            </ol>
          ),
          code: ({ className, children }) => {
            const isBlock = Boolean(className);
            if (isBlock) {
              return (
                <code
                  style={{
                    fontFamily:
                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                    fontSize: "0.85em",
                  }}
                >
                  {children}
                </code>
              );
            }
            return (
              <code
                style={{
                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                  fontSize: "0.85em",
                  background: "#f8fafc",
                  padding: "0.1em 0.35em",
                  borderRadius: 4,
                }}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre
              style={{
                margin: "0.5em 0",
                padding: "0.75em",
                overflowX: "auto",
                borderRadius: 8,
                background: "#f8fafc",
                fontSize: "0.8em",
              }}
            >
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div style={{ overflowX: "auto", margin: "0.5em 0" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85em",
                }}
              >
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th
              style={{
                border: "1px solid #e2e8f0",
                padding: "0.35em 0.5em",
                textAlign: "left",
                background: "#f8fafc",
                fontWeight: 600,
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                border: "1px solid #e2e8f0",
                padding: "0.35em 0.5em",
                textAlign: "left",
              }}
            >
              {children}
            </td>
          ),
        }}
      >
        {normalizeContent(content)}
      </ReactMarkdown>
    </div>
  );
}

export function ChatPanel({
  title,
  greeting = "Hi! How can I help?",
  primaryColor = "#111111",
  placeholder = "Type your message…",
  className,
  style,
  onClose,
}: ChatPanelProps) {
  const { agent, messages, status, isStreaming, error, sendMessage, reset } =
    useChat();
  const [draft, setDraft] = useState("");

  const headerTitle = title ?? agent?.name ?? "Support";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = draft;
    setDraft("");
    void sendMessage(value);
  }

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 420,
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        color: "#0f172a",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "14px 16px",
          background: primaryColor,
          color: "#fff",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{headerTitle}</div>
          {agent?.description ? (
            <div style={{ fontSize: 12, opacity: 0.85 }}>{agent.description}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              border: 0,
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            New chat
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              style={{
                border: 0,
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: 8,
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              alignSelf: "center",
              color: "#64748b",
              fontSize: 13,
              textAlign: "center",
              marginTop: 24,
            }}
          >
            {greeting}
          </div>
        ) : null}
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              padding: "10px 12px",
              borderRadius: 14,
              fontSize: 14,
              lineHeight: 1.45,
              whiteSpace: message.role === "user" ? "pre-wrap" : undefined,
              wordBreak: "break-word",
              background:
                message.role === "user" ? primaryColor : "#ffffff",
              color: message.role === "user" ? "#fff" : "#0f172a",
              border:
                message.role === "user" ? "none" : "1px solid #e2e8f0",
            }}
          >
            <MessageBody
              role={message.role}
              content={message.content}
              pending={message.pending}
            />
          </div>
        ))}
      </div>

      <div style={{ minHeight: 18, padding: "0 16px 8px", fontSize: 12, color: "#64748b" }}>
        {status ?? ""}
      </div>
      {error ? (
        <div style={{ padding: "0 16px 8px", fontSize: 12, color: "#b91c1c" }}>
          {error}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
            }
          }}
          rows={1}
          placeholder={placeholder}
          disabled={isStreaming}
          style={{
            flex: 1,
            resize: "none",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 12px",
            font: "inherit",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={isStreaming || !draft.trim()}
          style={{
            border: 0,
            borderRadius: 10,
            background: primaryColor,
            color: "#fff",
            padding: "0 14px",
            fontWeight: 600,
            cursor: "pointer",
            opacity: isStreaming || !draft.trim() ? 0.55 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
