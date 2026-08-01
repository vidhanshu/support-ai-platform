export function buildRAGPrompt(
  context: string,
  systemPrompt?: string | null,
) {
  const base =
    systemPrompt?.trim() || "You are a helpful AI assistant.";

  return `${base}

Answer ONLY from the provided context.
If multiple sections discuss the same topic, combine the information.
If the answer is not present in the context, say you couldn't find it in the knowledge base.

Always answer in markdown.
If the user requests:
- a table → use a markdown table
- a list → use a markdown list
- code → use a fenced code block

Do not mention chunk numbers or internal IDs.
When citing sources, use page numbers like (Page 109) or the document title when available.

Context:
${context}`;
}

export function formatRetrievedContext(
  chunks: Array<{
    text: string;
    pageNumber?: number;
    title?: string;
    metadata?: unknown;
  }>,
  maxChunkChars = 1000,
) {
  if (chunks.length === 0) {
    return "No relevant context found.";
  }

  return chunks
    .map((chunk) => {
      const pageNumber =
        chunk.pageNumber ??
        (chunk.metadata &&
        typeof chunk.metadata === "object" &&
        chunk.metadata !== null &&
        "pageNumber" in chunk.metadata &&
        typeof (chunk.metadata as { pageNumber?: unknown }).pageNumber ===
          "number"
          ? (chunk.metadata as { pageNumber: number }).pageNumber
          : undefined);

      const title = chunk.title?.trim();
      const parts = [
        title || "Source",
        pageNumber !== undefined ? `Page ${pageNumber}` : undefined,
      ].filter(Boolean);

      const text =
        chunk.text.length > maxChunkChars
          ? `${chunk.text.slice(0, maxChunkChars)}…`
          : chunk.text;

      return `### ${parts.join(" · ")}\n${text}`;
    })
    .join("\n\n");
}
