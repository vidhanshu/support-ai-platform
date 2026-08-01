/**
 * Maximal Marginal Relevance: balance relevance vs diversity.
 * score = λ * relevance - (1-λ) * max_similarity_to_selected
 */

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 2),
  );
}

/** Jaccard similarity over word tokens — cheap diversity signal without embeddings */
export function textSimilarity(a: string, b: string): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);
  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }

  const union = aTokens.size + bTokens.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function applyMmr<T extends { text: string; score: number }>(
  candidates: T[],
  topK: number,
  lambda: number,
): T[] {
  if (candidates.length <= topK) return [...candidates];

  const remaining = [...candidates];
  const selected: T[] = [];

  while (selected.length < topK && remaining.length > 0) {
    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i]!;
      const relevance = candidate.score;
      const diversityPenalty =
        selected.length === 0
          ? 0
          : Math.max(
              ...selected.map((item) => textSimilarity(candidate.text, item.text)),
            );

      const mmrScore = lambda * relevance - (1 - lambda) * diversityPenalty;
      if (mmrScore > bestScore) {
        bestScore = mmrScore;
        bestIndex = i;
      }
    }

    selected.push(remaining.splice(bestIndex, 1)[0]!);
  }

  return selected;
}
