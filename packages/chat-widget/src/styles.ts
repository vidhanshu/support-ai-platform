export const WIDGET_STYLES = /* css */ `
:host {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
}

*, *::before, *::after { box-sizing: border-box; }

.sai-root {
  --sai-primary: #111111;
  --sai-bg: #ffffff;
  --sai-surface: #f5f5f5;
  --sai-border: #e5e5e5;
  --sai-text: #111111;
  --sai-muted: #737373;
  --sai-user: #111111;
  --sai-on-primary: #ffffff;
  --sai-shadow: 0 18px 50px rgba(0, 0, 0, 0.16);
  position: fixed;
  z-index: 2147483000;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.sai-root[data-position="bottom-left"] {
  left: 20px;
  align-items: flex-start;
}

.sai-root[data-position="bottom-right"] {
  right: 20px;
}

.sai-panel {
  width: min(380px, calc(100vw - 32px));
  height: min(560px, calc(100vh - 100px));
  background: var(--sai-bg);
  color: var(--sai-text);
  border: 1px solid var(--sai-border);
  border-radius: 16px;
  box-shadow: var(--sai-shadow);
  display: none;
  flex-direction: column;
  overflow: hidden;
}

.sai-panel[data-open="true"] {
  display: flex;
}

.sai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--sai-primary);
  /* Hardcoded so panel’s dark text can’t win if a CSS variable fails */
  color: #ffffff;
}

.sai-header-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  color: #ffffff;
}

.sai-header-sub {
  font-size: 12px;
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.85);
}

.sai-header-sub[hidden] {
  display: none;
}

.sai-icon-btn {
  appearance: none;
  border: 0;
  background: rgba(255,255,255,0.12);
  color: #ffffff;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1;
}

.sai-icon-btn:hover { background: rgba(255,255,255,0.22); }

.sai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: var(--sai-surface);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sai-bubble {
  max-width: 85%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.sai-bubble[data-role="user"] {
  align-self: flex-end;
  background: var(--sai-user);
  color: var(--sai-on-primary);
  border-bottom-right-radius: 4px;
  white-space: pre-wrap;
}

.sai-bubble[data-role="assistant"] {
  align-self: flex-start;
  background: #fff;
  border: 1px solid var(--sai-border);
  border-bottom-left-radius: 4px;
}

.sai-bubble[data-role="system"] {
  align-self: center;
  background: transparent;
  color: var(--sai-muted);
  font-size: 13px;
  text-align: center;
  max-width: 100%;
  white-space: pre-wrap;
}

.sai-md > *:first-child { margin-top: 0; }
.sai-md > *:last-child { margin-bottom: 0; }
.sai-md p { margin: 0.5em 0; line-height: 1.5; }
.sai-md ul, .sai-md ol { margin: 0.5em 0; padding-left: 1.25em; }
.sai-md ul { list-style: disc; }
.sai-md ol { list-style: decimal; }
.sai-md li { margin: 0.2em 0; }
.sai-md strong { font-weight: 600; }
.sai-md em { font-style: italic; }
.sai-md a { color: var(--sai-text); font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }
.sai-md blockquote {
  margin: 0.5em 0;
  padding-left: 0.75em;
  border-left: 2px solid var(--sai-border);
  color: var(--sai-muted);
}
.sai-md hr { margin: 0.75em 0; border: 0; border-top: 1px solid var(--sai-border); }
.sai-md h1, .sai-md h2, .sai-md h3, .sai-md h4 {
  margin: 0.65em 0 0.35em;
  font-weight: 600;
  line-height: 1.3;
}
.sai-md h1 { font-size: 1.05em; }
.sai-md h2, .sai-md h3, .sai-md h4 { font-size: 1em; }
.sai-md code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
  background: var(--sai-surface);
  padding: 0.1em 0.35em;
  border-radius: 4px;
}
.sai-md pre {
  margin: 0.5em 0;
  padding: 0.75em;
  overflow-x: auto;
  border-radius: 8px;
  background: var(--sai-surface);
  font-size: 0.8em;
}
.sai-md pre code { background: transparent; padding: 0; }
.sai-md table {
  display: block;
  width: 100%;
  margin: 0.5em 0;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 0.85em;
}
.sai-md th, .sai-md td {
  border: 1px solid var(--sai-border);
  padding: 0.35em 0.5em;
  text-align: left;
}
.sai-md th { background: var(--sai-surface); font-weight: 600; }

.sai-status {
  font-size: 12px;
  color: var(--sai-muted);
  padding: 0 16px 8px;
  min-height: 18px;
}

.sai-composer {
  display: flex;
  gap: 8px;
  padding: 12px;
  border-top: 1px solid var(--sai-border);
  background: #fff;
}

.sai-input {
  flex: 1;
  resize: none;
  border: 1px solid var(--sai-border);
  border-radius: 10px;
  padding: 10px 12px;
  font: inherit;
  font-size: 14px;
  color: var(--sai-text);
  background: #fff;
  min-height: 44px;
  max-height: 120px;
}

.sai-input:focus {
  outline: 2px solid rgba(17, 17, 17, 0.2);
  border-color: var(--sai-primary);
}

.sai-send {
  appearance: none;
  border: 0;
  border-radius: 10px;
  background: var(--sai-primary);
  color: var(--sai-on-primary);
  padding: 0 14px;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.sai-send:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.sai-launcher {
  appearance: none;
  border: 0;
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: var(--sai-primary);
  color: var(--sai-on-primary);
  box-shadow: var(--sai-shadow);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sai-launcher svg { width: 26px; height: 26px; fill: currentColor; }

.sai-error {
  color: #b91c1c;
  font-size: 12px;
  padding: 0 16px 8px;
}
`;
