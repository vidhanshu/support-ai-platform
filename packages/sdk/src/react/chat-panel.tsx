"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "./use-chat";

export type ChatTheme = "light" | "dark";

export type ChatPanelProps = {
  title?: string;
  greeting?: string;
  primaryColor?: string;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  /** Shown in the header (e.g. close for ChatBubble). */
  onClose?: () => void;
  /** Visual theme. Default: light. */
  theme?: ChatTheme;
};

type ThemeTokens = {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  assistantBg: string;
  inputBg: string;
  danger: string;
};

function tokensFor(theme: ChatTheme): ThemeTokens {
  if (theme === "dark") {
    return {
      bg: "#141414",
      surface: "#1c1c1c",
      border: "#2e2e2e",
      text: "#f4f4f5",
      muted: "#a1a1aa",
      assistantBg: "#242424",
      inputBg: "#111111",
      danger: "#f87171",
    };
  }
  return {
    bg: "#ffffff",
    surface: "#f5f5f5",
    border: "#e5e5e5",
    text: "#111111",
    muted: "#737373",
    assistantBg: "#ffffff",
    inputBg: "#ffffff",
    danger: "#b91c1c",
  };
}

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
  theme,
}: {
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  theme: ChatTheme;
}) {
  const t = tokensFor(theme);
  if (role === "user") {
    return <>{content}</>;
  }

  if (!content) {
    return <>{pending ? "…" : ""}</>;
  }

  return (
    <div style={{ maxWidth: "100%", overflowWrap: "anywhere" }}>
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
                  background: t.surface,
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
                background: t.surface,
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
                border: `1px solid ${t.border}`,
                padding: "0.35em 0.5em",
                textAlign: "left",
                background: t.surface,
                fontWeight: 600,
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                border: `1px solid ${t.border}`,
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

function formatTime(ts: number) {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function ChatPanel({
  title,
  greeting = "Hi! How can I help?",
  primaryColor = "#111111",
  placeholder = "Type your message…",
  className,
  style,
  onClose,
  theme = "light",
}: ChatPanelProps) {
  const {
    agent,
    messages,
    conversationId,
    conversations,
    status,
    isStreaming,
    error,
    sendMessage,
    newConversation,
    selectConversation,
    deleteConversation,
  } = useChat();
  const [draft, setDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const t = tokensFor(theme);

  const headerTitle = title ?? agent?.name ?? "Support";

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = draft;
    setDraft("");
    void sendMessage(value);
  }

  const headerBtn: CSSProperties = {
    border: 0,
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: 12,
  };

  return (
    <div
      className={className}
      data-theme={theme}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 420,
        border: `1px solid ${t.border}`,
        borderRadius: 16,
        overflow: "hidden",
        background: t.bg,
        color: t.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        position: "relative",
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
            onClick={() => setShowHistory(true)}
            style={headerBtn}
          >
            Chats
          </button>
          <button type="button" onClick={newConversation} style={headerBtn}>
            New
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              style={{ ...headerBtn, width: 32, height: 32, padding: 0, fontSize: 18 }}
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      {showHistory ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: t.bg,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
              borderBottom: `1px solid ${t.border}`,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 15 }}>Conversations</div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              style={{
                ...headerBtn,
                background: t.surface,
                color: t.text,
                border: `1px solid ${t.border}`,
              }}
            >
              Back
            </button>
          </div>
          <div style={{ padding: 12, borderBottom: `1px solid ${t.border}` }}>
            <button
              type="button"
              onClick={() => {
                newConversation();
                setShowHistory(false);
              }}
              style={{
                width: "100%",
                border: `1px solid ${t.border}`,
                background: primaryColor,
                color: "#fff",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              + New conversation
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {conversations.length === 0 ? (
              <div
                style={{
                  color: t.muted,
                  fontSize: 13,
                  textAlign: "center",
                  padding: 24,
                }}
              >
                No conversations yet.
              </div>
            ) : (
              conversations.map((c) => {
                const active = c.id === conversationId;
                return (
                  <div
                    key={c.id}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "stretch",
                      marginBottom: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        selectConversation(c.id);
                        setShowHistory(false);
                      }}
                      style={{
                        flex: 1,
                        textAlign: "left",
                        border: `1px solid ${active ? primaryColor : t.border}`,
                        background: active ? t.surface : "transparent",
                        color: t.text,
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>
                        {formatTime(c.updatedAt)} · {c.messageCount} messages
                      </div>
                    </button>
                    <button
                      type="button"
                      aria-label="Delete conversation"
                      onClick={() => deleteConversation(c.id)}
                      style={{
                        border: `1px solid ${t.border}`,
                        background: t.surface,
                        color: t.muted,
                        borderRadius: 10,
                        width: 36,
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 16,
          background: t.surface,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {messages.length === 0 ? (
          <div
            style={{
              alignSelf: "center",
              color: t.muted,
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
                message.role === "user" ? primaryColor : t.assistantBg,
              color: message.role === "user" ? "#fff" : t.text,
              border:
                message.role === "user" ? "none" : `1px solid ${t.border}`,
            }}
          >
            <MessageBody
              role={message.role}
              content={message.content}
              pending={message.pending}
              theme={theme}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          minHeight: 18,
          padding: "0 16px 8px",
          fontSize: 12,
          color: t.muted,
        }}
      >
        {status ?? ""}
      </div>
      {error ? (
        <div style={{ padding: "0 16px 8px", fontSize: 12, color: t.danger }}>
          {error}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: 8,
          padding: 12,
          borderTop: `1px solid ${t.border}`,
          background: t.bg,
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
            border: `1px solid ${t.border}`,
            borderRadius: 10,
            padding: "10px 12px",
            font: "inherit",
            fontSize: 14,
            background: t.inputBg,
            color: t.text,
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
