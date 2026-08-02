import robotsParser from "robots-parser";
import { WEBSITE_CONFIGS } from "@repo/config";

export type RobotsChecker = {
  isAllowed: (url: string) => boolean;
};

export async function loadRobotsChecker(
  origin: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RobotsChecker> {
  const robotsUrl = new URL("/robots.txt", origin).toString();

  try {
    const response = await fetchImpl(robotsUrl, {
      headers: { "User-Agent": WEBSITE_CONFIGS.USER_AGENT },
      signal: AbortSignal.timeout(WEBSITE_CONFIGS.FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      return { isAllowed: () => true };
    }

    const body = await response.text();
    const robots = robotsParser(robotsUrl, body);
    return {
      isAllowed: (url: string) =>
        robots.isAllowed(url, WEBSITE_CONFIGS.USER_AGENT) !== false,
    };
  } catch {
    // If robots.txt is unreachable, fail open for crawlability (still SSRF-guarded)
    return { isAllowed: () => true };
  }
}
