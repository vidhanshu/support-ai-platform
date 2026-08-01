import { Injectable } from "@nestjs/common";
import { AI_CONFIGS } from "@repo/config";
import type { RetrievedChunk } from "@repo/contracts";

export type ContextBuildResult = {
  context: string;
  contextBuildMs: number;
};

/**
 * Formats retrieved chunks into a clear, citation-friendly context block.
 */
@Injectable()
export class ContextBuilder {
  build(
    chunks: RetrievedChunk[],
    maxChunkChars: number = AI_CONFIGS.MAX_CHUNK_CHARS,
  ): ContextBuildResult {
    const start = performance.now();

    if (chunks.length === 0) {
      return {
        context: "No relevant context found.",
        contextBuildMs: Math.round(performance.now() - start),
      };
    }

    const context = chunks
      .map((chunk) => {
        const sourceName = chunk.title?.trim() || "Unknown source";
        const page =
          chunk.pageNumber !== undefined ? String(chunk.pageNumber) : "N/A";
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

    return {
      context,
      contextBuildMs: Math.round(performance.now() - start),
    };
  }
}
