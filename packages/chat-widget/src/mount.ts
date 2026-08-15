import { createClient, SupportAIError } from "@repo/chat-core";
import type { SupportAIClient } from "@repo/chat-core";
import { renderMarkdown } from "./markdown";
import { WIDGET_STYLES } from "./styles";
import type { SupportAIWidgetConfig, SupportAIWidgetHandle } from "./types";

type UiMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

function uid() {
  return crypto.randomUUID();
}

function storageKeyFor(config: SupportAIWidgetConfig) {
  return `support-ai:conversation:${config.storageKey ?? config.agentId}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function mountWidget(
  config: SupportAIWidgetConfig,
): SupportAIWidgetHandle {
  if (typeof document === "undefined") {
    throw new Error("SupportAI widget requires a browser environment.");
  }

  const client: SupportAIClient = createClient({
    agentId: config.agentId,
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    headers: config.headers,
  });

  const position = config.position ?? "bottom-right";
  const primary = config.primaryColor ?? "#111111";
  const greeting =
    config.greeting ?? "Hi! Ask me anything about this product.";

  const host = document.createElement("div");
  host.setAttribute("data-support-ai-widget", "");
  (config.container ?? document.body).appendChild(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = WIDGET_STYLES;
  shadow.appendChild(style);

  const root = document.createElement("div");
  root.className = "sai-root";
  root.dataset.position = position;
  root.style.setProperty("--sai-primary", primary);
  root.style.setProperty("--sai-user", primary);
  shadow.appendChild(root);

  root.innerHTML = `
    <div class="sai-panel" data-open="false" part="panel">
      <div class="sai-header">
        <div>
          <p class="sai-header-title">${escapeHtml(config.title ?? "Support")}</p>
          <p class="sai-header-sub" data-role="header-sub" hidden></p>
        </div>
        <button type="button" class="sai-icon-btn" data-action="close" aria-label="Close chat">×</button>
      </div>
      <div class="sai-messages" data-role="messages"></div>
      <div class="sai-status" data-role="status"></div>
      <div class="sai-error" data-role="error" hidden></div>
      <form class="sai-composer" data-role="form">
        <textarea class="sai-input" data-role="input" rows="1" placeholder="Type your message…"></textarea>
        <button class="sai-send" type="submit" data-role="send">Send</button>
      </form>
    </div>
    <button type="button" class="sai-launcher" data-action="toggle" aria-label="Open chat">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/></svg>
    </button>
  `;

  const panel = root.querySelector<HTMLElement>(".sai-panel")!;
  const titleEl = root.querySelector<HTMLElement>(".sai-header-title")!;
  const subEl = root.querySelector<HTMLElement>("[data-role=header-sub]")!;
  const messagesEl = root.querySelector<HTMLElement>("[data-role=messages]")!;
  const statusEl = root.querySelector<HTMLElement>("[data-role=status]")!;
  const errorEl = root.querySelector<HTMLElement>("[data-role=error]")!;
  const form = root.querySelector<HTMLFormElement>("[data-role=form]")!;
  const input = root.querySelector<HTMLTextAreaElement>("[data-role=input]")!;
  const sendBtn = root.querySelector<HTMLButtonElement>("[data-role=send]")!;
  const toggleBtn = root.querySelector<HTMLButtonElement>('[data-action="toggle"]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-action="close"]')!;

  let open = false;
  let streaming = false;
  let conversationId: string | null = null;
  let abort: AbortController | null = null;
  const messages: UiMessage[] = [];

  try {
    conversationId = localStorage.getItem(storageKeyFor(config));
  } catch {
    conversationId = null;
  }

  function setOpen(next: boolean) {
    open = next;
    panel.dataset.open = next ? "true" : "false";
    if (next) {
      input.focus();
    }
  }

  function setError(message: string | null) {
    if (!message) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = message;
  }

  function bubbleHtml(message: UiMessage): string {
    if (message.role === "assistant") {
      const body = message.content
        ? `<div class="sai-md">${renderMarkdown(message.content)}</div>`
        : "…";
      return `<div class="sai-bubble" data-role="assistant">${body}</div>`;
    }
    return `<div class="sai-bubble" data-role="${message.role}">${escapeHtml(message.content)}</div>`;
  }

  function renderMessages() {
    messagesEl.innerHTML = messages.map(bubbleHtml).join("");
    // Open markdown links in a new tab
    messagesEl.querySelectorAll(".sai-md a[href]").forEach((anchor) => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noreferrer noopener");
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function pushMessage(message: UiMessage) {
    messages.push(message);
    renderMessages();
  }

  function updateAssistant(id: string, content: string) {
    const target = messages.find((m) => m.id === id);
    if (!target) return;
    target.content = content;
    renderMessages();
  }

  async function bootstrap() {
    try {
      const agent = await client.getAgent();
      const agentName = agent.name?.trim() || "Support";

      // Agent name is always the white header title.
      titleEl.textContent = config.title?.trim() || agentName;

      if (config.title?.trim() && config.title.trim() !== agentName) {
        subEl.textContent = agentName;
        subEl.hidden = false;
      } else {
        const desc = agent.description?.trim();
        if (desc) {
          subEl.textContent = desc;
          subEl.hidden = false;
        } else {
          subEl.textContent = "";
          subEl.hidden = true;
        }
      }
    } catch {
      // Soft-fail: keep placeholder title.
    }

    if (messages.length === 0) {
      pushMessage({ id: uid(), role: "system", content: greeting });
    }
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    streaming = true;
    sendBtn.disabled = true;
    statusEl.textContent = "Thinking…";

    pushMessage({ id: uid(), role: "user", content: trimmed });
    const assistantId = uid();
    pushMessage({ id: assistantId, role: "assistant", content: "" });

    abort?.abort();
    abort = new AbortController();

    try {
      await client.chat({
        message: trimmed,
        conversationId,
        signal: abort.signal,
        onEvent: (event) => {
          if (event.type === "status") {
            const stage = event.data.stage;
            statusEl.textContent =
              stage === "retrieving"
                ? "Searching knowledge…"
                : stage === "generating" || stage === "first_token"
                  ? "Writing reply…"
                  : stage === "started"
                    ? "Starting…"
                    : stage;
            return;
          }
          if (event.type === "meta") {
            conversationId = event.data.conversationId;
            try {
              localStorage.setItem(storageKeyFor(config), conversationId);
            } catch {
              // ignore quota / private mode
            }
            return;
          }
          if (event.type === "token") {
            const target = messages.find((m) => m.id === assistantId);
            updateAssistant(
              assistantId,
              `${target?.content ?? ""}${event.data.content}`,
            );
            return;
          }
          if (event.type === "done") {
            updateAssistant(
              assistantId,
              event.data.message.content ||
                messages.find((m) => m.id === assistantId)?.content ||
                "",
            );
          }
        },
      });
    } catch (error) {
      if ((error as Error)?.name === "AbortError") {
        return;
      }
      const message =
        error instanceof SupportAIError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      setError(message);
      updateAssistant(assistantId, messages.find((m) => m.id === assistantId)?.content || "…");
      if (!messages.find((m) => m.id === assistantId)?.content) {
        updateAssistant(assistantId, "(failed to get a reply)");
      }
    } finally {
      streaming = false;
      sendBtn.disabled = false;
      statusEl.textContent = "";
      abort = null;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    input.value = "";
    void sendMessage(value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  toggleBtn.addEventListener("click", () => setOpen(!open));
  closeBtn.addEventListener("click", () => setOpen(false));

  void bootstrap();

  return {
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen(!open),
    isOpen: () => open,
    destroy: () => {
      abort?.abort();
      host.remove();
    },
  };
}
