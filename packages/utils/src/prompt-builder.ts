export function buildRAGPrompt(
  context: string,
  systemPrompt?: string | null,
) {
  const base =
    systemPrompt?.trim() ||
    "You are a helpful customer support assistant.";

  return `${base}

Answer only using the provided context.
If the answer is not available in the context, say you don't know.

Context:
${context}`;
}

export function formatRetrievedContext(
  chunks: Array<{ text: string; metadata?: unknown }>,
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

      return `${label}\n${chunk.text}`;
    })
    .join("\n\n");
}
