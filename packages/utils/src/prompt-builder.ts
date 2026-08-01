export function buildRAGPrompt(
  context: string,
  systemPrompt?: string | null,
) {
  const base =
    systemPrompt?.trim() ||
    "You are a helpful customer support assistant.";

  return `${base}
Answer ONLY using the provided context.

If the answer cannot be found in the context,
say:
"I couldn't find this information in the knowledge base."

When possible:
- cite page numbers
- answer in markdown
- be concise
- don't invent examples
${context}`;
}

export function formatRetrievedContext(
  chunks: Array<{ text: string; metadata?: unknown }>,
  maxChunkChars = 1000,
) {
  if (chunks.length === 0) {
    return "No relevant context found.";
  }

  return chunks
    .map((chunk, index) => {
      const pageNumber =
        chunk.metadata &&
        typeof chunk.metadata === "object" &&
        chunk.metadata !== null &&
        "pageNumber" in chunk.metadata &&
        typeof (chunk.metadata as { pageNumber?: unknown }).pageNumber ===
          "number"
          ? (chunk.metadata as { pageNumber: number }).pageNumber
          : undefined;

      const label =
        pageNumber !== undefined
          ? `[${index + 1}] (page ${pageNumber})`
          : `[${index + 1}]`;

      const text =
        chunk.text.length > maxChunkChars
          ? `${chunk.text.slice(0, maxChunkChars)}…`
          : chunk.text;

      return `${label}\n${text}`;
    })
    .join("\n\n");
}
