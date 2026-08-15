import type { ChatStreamEvent } from "./types";

/** Split an SSE byte buffer into complete `data:` JSON events. */
export function parseSseChunk(buffer: string): {
  events: ChatStreamEvent[];
  rest: string;
} {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: ChatStreamEvent[] = [];

  for (const part of parts) {
    const dataLines = part
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());

    if (!dataLines.length) continue;

    try {
      const parsed = JSON.parse(dataLines.join("\n")) as ChatStreamEvent;
      events.push(parsed);
    } catch {
      // Incomplete / malformed chunk — wait for more bytes.
    }
  }

  return { events, rest };
}
