/**
 * @deprecated Prompt construction lives in @repo/ai PromptBuilder.
 * Context formatting lives in @repo/knowledge ContextBuilder.
 * Kept temporarily so older imports do not break mid-migration.
 */
export function buildRAGPrompt(
  context: string,
  systemPrompt?: string | null,
) {
  const base =
    systemPrompt?.trim() || "You are a helpful AI assistant.";

  return `${base}

Answer ONLY from the provided context.

Context:
${context}`;
}

/**
 * @deprecated Use ContextBuilder from @repo/knowledge instead.
 */
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

      const sourceName = chunk.title?.trim() || "Unknown source";
      const page = pageNumber !== undefined ? String(pageNumber) : "N/A";
      const content =
        chunk.text.length > maxChunkChars
          ? `${chunk.text.slice(0, maxChunkChars)}…`
          : chunk.text;

      return [
        "Source:",
        sourceName,
        "",
        "Page:",
        page,
        "",
        "Content:",
        content,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}
