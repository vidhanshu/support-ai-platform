import { marked, Renderer } from "marked";

const renderer = new Renderer();
/** Drop raw HTML from model output (XSS). Markdown still renders to safe tags. */
renderer.html = () => "";

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

/** Soft-normalize common HTML the model sometimes emits instead of markdown. */
function normalizeContent(content: string): string {
  return content
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?b>/gi, "**")
    .replace(/<\/?strong>/gi, "**")
    .replace(/<\/?i>/gi, "_")
    .replace(/<\/?em>/gi, "_");
}

export function renderMarkdown(content: string): string {
  const normalized = normalizeContent(content);
  const html = marked.parse(normalized, { async: false }) as string;
  return html;
}
