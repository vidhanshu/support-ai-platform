import {
  createClient,
  SupportAIError,
  getActiveConversation,
  loadConversationStore,
  saveConversationStore,
  titleFromMessage,
  upsertConversation,
} from "@support-ai/chat-core";
import type {
  SupportAIClient,
  StoredChatMessage,
  StoredConversation,
} from "@support-ai/chat-core";
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

function agentStorageId(config: SupportAIWidgetConfig) {
  return config.storageKey ?? config.agentId;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function toStored(messages: UiMessage[]): StoredChatMessage[] {
  return messages
    .filter(
      (m): m is UiMessage & { role: "user" | "assistant" } =>
        m.role === "user" || m.role === "assistant",
    )
    .map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    }));
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
  const theme = config.theme ?? "light";
  const primary = config.primaryColor ?? "#111111";
  const greeting =
    config.greeting ?? "Hi! Ask me anything about this product.";
  const storageId = agentStorageId(config);

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
  root.dataset.theme = theme;
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
        <div class="sai-header-actions">
          <button type="button" class="sai-text-btn" data-action="history">Chats</button>
          <button type="button" class="sai-text-btn" data-action="new">New</button>
          <button type="button" class="sai-icon-btn" data-action="close" aria-label="Close chat">×</button>
        </div>
      </div>
      <div class="sai-messages" data-role="messages"></div>
      <div class="sai-status" data-role="status"></div>
      <div class="sai-error" data-role="error" hidden></div>
      <form class="sai-composer" data-role="form">
        <textarea class="sai-input" data-role="input" rows="1" placeholder="Type your message…"></textarea>
        <button class="sai-send" type="submit" data-role="send">Send</button>
      </form>
      <div class="sai-history" data-role="history" data-open="false">
        <div class="sai-history-header">
          <span>Conversations</span>
          <button type="button" class="sai-ghost-btn" data-action="history-back">Back</button>
        </div>
        <button type="button" class="sai-history-new" data-action="history-new">+ New conversation</button>
        <div class="sai-history-list" data-role="history-list"></div>
      </div>
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
  const historyEl = root.querySelector<HTMLElement>("[data-role=history]")!;
  const historyListEl = root.querySelector<HTMLElement>("[data-role=history-list]")!;
  const toggleBtn = root.querySelector<HTMLButtonElement>('[data-action="toggle"]')!;
  const closeBtn = root.querySelector<HTMLButtonElement>('[data-action="close"]')!;
  const historyBtn = root.querySelector<HTMLButtonElement>('[data-action="history"]')!;
  const newBtn = root.querySelector<HTMLButtonElement>('[data-action="new"]')!;
  const historyBackBtn = root.querySelector<HTMLButtonElement>('[data-action="history-back"]')!;
  const historyNewBtn = root.querySelector<HTMLButtonElement>('[data-action="history-new"]')!;

  let open = false;
  let streaming = false;
  let conversationId: string | null = null;
  let conversationTitle = "New chat";
  let abort: AbortController | null = null;
  const messages: UiMessage[] = [];

  function setOpen(next: boolean) {
    open = next;
    panel.dataset.open = next ? "true" : "false";
    if (next) input.focus();
  }

  function setHistoryOpen(next: boolean) {
    historyEl.dataset.open = next ? "true" : "false";
    if (next) renderHistory();
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
    messagesEl.querySelectorAll(".sai-md a[href]").forEach((anchor) => {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noreferrer noopener");
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function persistActive() {
    if (!conversationId) return;
    const store = loadConversationStore(storageId);
    const next = upsertConversation(store, {
      id: conversationId,
      title: conversationTitle,
      updatedAt: Date.now(),
      messages: toStored(messages),
    });
    saveConversationStore(storageId, next);
  }

  function loadActiveFromStore() {
    const store = loadConversationStore(storageId);
    const active = getActiveConversation(store);
    messages.length = 0;
    if (active) {
      conversationId = active.id;
      conversationTitle = active.title;
      for (const m of active.messages) {
        messages.push({ id: m.id, role: m.role, content: m.content });
      }
    } else {
      conversationId = null;
      conversationTitle = "New chat";
      messages.push({ id: uid(), role: "system", content: greeting });
    }
    renderMessages();
  }

  function startNewConversation() {
    abort?.abort();
    abort = null;
    streaming = false;
    sendBtn.disabled = false;
    statusEl.textContent = "";
    setError(null);
    conversationId = null;
    conversationTitle = "New chat";
    messages.length = 0;
    messages.push({ id: uid(), role: "system", content: greeting });
    renderMessages();
    const store = loadConversationStore(storageId);
    saveConversationStore(storageId, { ...store, activeId: null });
    setHistoryOpen(false);
  }

  function selectConversation(id: string) {
    const store = loadConversationStore(storageId);
    const found = store.conversations.find((c) => c.id === id);
    if (!found) return;
    abort?.abort();
    abort = null;
    streaming = false;
    sendBtn.disabled = false;
    statusEl.textContent = "";
    setError(null);
    saveConversationStore(storageId, { ...store, activeId: id });
    conversationId = found.id;
    conversationTitle = found.title;
    messages.length = 0;
    for (const m of found.messages) {
      messages.push({ id: m.id, role: m.role, content: m.content });
    }
    if (messages.length === 0) {
      messages.push({ id: uid(), role: "system", content: greeting });
    }
    renderMessages();
    setHistoryOpen(false);
  }

  function deleteConversation(id: string) {
    const store = loadConversationStore(storageId);
    const conversations = store.conversations.filter((c) => c.id !== id);
    const activeId = store.activeId === id ? null : store.activeId;
    saveConversationStore(storageId, { version: 1, activeId, conversations });
    if (conversationId === id) startNewConversation();
    else renderHistory();
  }

  function renderHistory() {
    const store = loadConversationStore(storageId);
    if (!store.conversations.length) {
      historyListEl.innerHTML = `<div class="sai-bubble" data-role="system">No conversations yet.</div>`;
      return;
    }
    historyListEl.innerHTML = store.conversations
      .map((c: StoredConversation) => {
        const active = c.id === conversationId;
        return `<div class="sai-history-item">
          <button type="button" class="sai-history-main" data-active="${active ? "true" : "false"}" data-select="${c.id}">
            <div class="sai-history-title">${escapeHtml(c.title)}</div>
            <div class="sai-history-meta">${escapeHtml(formatTime(c.updatedAt))} · ${c.messages.length} messages</div>
          </button>
          <button type="button" class="sai-ghost-btn" data-delete="${c.id}" aria-label="Delete">×</button>
        </div>`;
      })
      .join("");

    historyListEl.querySelectorAll<HTMLElement>("[data-select]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-select");
        if (id) selectConversation(id);
      });
    });
    historyListEl.querySelectorAll<HTMLElement>("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-delete");
        if (id) deleteConversation(id);
      });
    });
  }

  async function bootstrap() {
    try {
      const agent = await client.getAgent();
      const agentName = agent.name?.trim() || "Support";
      if (config.title?.trim()) {
        titleEl.textContent = config.title.trim();
        subEl.textContent = agentName;
        subEl.hidden = false;
      } else {
        titleEl.textContent = agentName;
        const desc = agent.description?.trim();
        if (desc) {
          subEl.textContent = desc;
          subEl.hidden = false;
        } else {
          subEl.hidden = true;
        }
      }
    } catch {
      // soft-fail
    }
    loadActiveFromStore();
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    setError(null);
    streaming = true;
    sendBtn.disabled = true;
    statusEl.textContent = "Thinking…";

    // Drop greeting system bubble once real chat starts.
    if (messages.length === 1 && messages[0]?.role === "system") {
      messages.length = 0;
    }

    messages.push({ id: uid(), role: "user", content: trimmed });
    const assistantId = uid();
    messages.push({ id: assistantId, role: "assistant", content: "" });
    renderMessages();

    if (!conversationId) {
      conversationTitle = titleFromMessage(trimmed);
    }

    abort?.abort();
    abort = new AbortController();
    let activeId = conversationId;

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
            activeId = event.data.conversationId;
            conversationId = activeId;
            return;
          }
          if (event.type === "token") {
            const target = messages.find((m) => m.id === assistantId);
            if (target) {
              target.content += event.data.content;
              renderMessages();
            }
            return;
          }
          if (event.type === "done") {
            const target = messages.find((m) => m.id === assistantId);
            if (target) {
              target.content =
                event.data.message.content || target.content;
              renderMessages();
            }
          }
        },
      });
      if (activeId) {
        conversationId = activeId;
        persistActive();
      }
    } catch (error) {
      if ((error as Error)?.name === "AbortError") return;
      const message =
        error instanceof SupportAIError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      setError(message);
      const target = messages.find((m) => m.id === assistantId);
      if (target && !target.content) {
        target.content = "(failed to get a reply)";
        renderMessages();
      }
      if (activeId) {
        conversationId = activeId;
        persistActive();
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
  historyBtn.addEventListener("click", () => setHistoryOpen(true));
  newBtn.addEventListener("click", () => startNewConversation());
  historyBackBtn.addEventListener("click", () => setHistoryOpen(false));
  historyNewBtn.addEventListener("click", () => startNewConversation());

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
