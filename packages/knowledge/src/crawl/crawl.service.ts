import { Injectable, Logger } from "@nestjs/common";
import { WEBSITE_CONFIGS } from "@repo/config";
import type { CrawlOptions, CrawlResult, ExtractedWebPage } from "@repo/contracts";
import { extractHtmlContent } from "./html-extractor";
import { loadRobotsChecker } from "./robots";
import {
  assertSafeUrl,
  getHostname,
  isAllowedHost,
  looksLikeHtmlUrl,
  normalizeUrl,
} from "./url";

type QueueItem = {
  url: string;
  depth: number;
};

type CrawlOneResult = {
  status: "extracted" | "skipped" | "failed";
  reason?: string;
  page?: ExtractedWebPage;
  links: string[];
  textLength?: number;
  finalUrl?: string;
};

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  async crawl(options: CrawlOptions): Promise<CrawlResult> {
    const rootUrl = normalizeUrl(options.rootUrl);
    if (!rootUrl) {
      throw new Error(`Invalid root URL: ${options.rootUrl}`);
    }

    await assertSafeUrl(rootUrl);

    const rootHost = getHostname(rootUrl);
    if (!rootHost) {
      throw new Error(`Unable to parse hostname from ${rootUrl}`);
    }

    const allowedHosts =
      options.allowedHosts && options.allowedHosts.length > 0
        ? options.allowedHosts.map((host) => host.toLowerCase())
        : [rootHost];

    const maxPages = Math.min(
      options.maxPages ?? WEBSITE_CONFIGS.DEFAULT_MAX_PAGES,
      WEBSITE_CONFIGS.MAX_ALLOWED_PAGES,
    );
    const maxDepth = Math.min(
      options.maxDepth ?? WEBSITE_CONFIGS.DEFAULT_MAX_DEPTH,
      WEBSITE_CONFIGS.MAX_ALLOWED_DEPTH,
    );

    const origin = new URL(rootUrl).origin;
    const robots = await loadRobotsChecker(origin);

    const queue: QueueItem[] = [{ url: rootUrl, depth: 0 }];
    const seen = new Set<string>([rootUrl]);
    const pages: ExtractedWebPage[] = [];
    let pagesCrawled = 0;
    const skipCounts = new Map<string, number>();

    this.logger.log(
      `[crawl] start root=${rootUrl} maxPages=${maxPages} maxDepth=${maxDepth} hosts=${allowedHosts.join(",")}`,
    );
    this.logger.log(
      `[crawl] note: only HTML returned by the server is crawled. Client-rendered (SPA/JS-only) content and links may be missing.`,
    );

    while (queue.length > 0 && pages.length < maxPages) {
      const batch = queue.splice(0, WEBSITE_CONFIGS.FETCH_CONCURRENCY);
      const results = await Promise.all(
        batch.map((item) => this.crawlOne(item, allowedHosts, robots.isAllowed)),
      );

      for (let i = 0; i < results.length; i += 1) {
        const item = batch[i]!;
        const result = results[i]!;
        pagesCrawled += 1;

        if (result.status === "extracted" && result.page) {
          if (result.page.text.length >= WEBSITE_CONFIGS.MIN_TEXT_CHARS) {
            pages.push(result.page);
            this.logger.log(
              `[crawl] EXTRACTED depth=${item.depth} url=${result.finalUrl ?? item.url} title="${result.page.title ?? ""}" textChars=${result.textLength ?? 0} linksFound=${result.links.length}`,
            );
          } else {
            const reason = `text_too_short chars=${result.textLength ?? 0} min=${WEBSITE_CONFIGS.MIN_TEXT_CHARS}`;
            this.bump(skipCounts, reason);
            this.logger.warn(
              `[crawl] SKIP depth=${item.depth} url=${result.finalUrl ?? item.url} reason=${reason} linksFound=${result.links.length}`,
            );
          }
        } else {
          const reason = result.reason ?? result.status;
          this.bump(skipCounts, reason);
          this.logger.warn(
            `[crawl] SKIP depth=${item.depth} url=${item.url} reason=${reason}`,
          );
        }

        if (item.depth >= maxDepth) {
          if (result.links.length > 0) {
            this.logger.debug(
              `[crawl] depth_cap depth=${item.depth} url=${item.url} not_enqueueing=${result.links.length} links`,
            );
          }
          continue;
        }

        let enqueued = 0;
        for (const link of result.links) {
          if (seen.has(link)) {
            continue;
          }
          if (!isAllowedHost(link, allowedHosts)) {
            this.logger.debug(`[crawl] link_skip host url=${link}`);
            continue;
          }
          if (!looksLikeHtmlUrl(link)) {
            this.logger.debug(`[crawl] link_skip non_html url=${link}`);
            continue;
          }
          if (!robots.isAllowed(link)) {
            this.logger.warn(`[crawl] link_skip robots url=${link}`);
            continue;
          }

          seen.add(link);
          queue.push({ url: link, depth: item.depth + 1 });
          enqueued += 1;
          this.logger.log(
            `[crawl] ENQUEUE depth=${item.depth + 1} url=${link} from=${item.url}`,
          );
        }

        if (result.links.length > 0) {
          this.logger.log(
            `[crawl] links from ${item.url}: found=${result.links.length} enqueued=${enqueued} queueSize=${queue.length}`,
          );
        }

        if (pages.length >= maxPages) break;
      }
    }

    this.logger.log(
      `[crawl] done root=${rootUrl} discovered=${seen.size} fetched=${pagesCrawled} extracted=${pages.length} remainingQueue=${queue.length}`,
    );
    this.logger.log(
      `[crawl] extracted_urls=${JSON.stringify(pages.map((page) => page.url))}`,
    );
    if (skipCounts.size > 0) {
      this.logger.log(
        `[crawl] skip_summary=${JSON.stringify(Object.fromEntries(skipCounts))}`,
      );
    }

    return {
      pages: pages.slice(0, maxPages),
      pagesFound: seen.size,
      pagesCrawled,
      rootUrl,
    };
  }

  private async crawlOne(
    item: QueueItem,
    allowedHosts: string[],
    isAllowedByRobots: (url: string) => boolean,
  ): Promise<CrawlOneResult> {
    this.logger.log(`[crawl] FETCH depth=${item.depth} url=${item.url}`);

    if (!isAllowedHost(item.url, allowedHosts)) {
      return { status: "skipped", reason: "host_not_allowed", links: [] };
    }
    if (!isAllowedByRobots(item.url)) {
      return { status: "skipped", reason: "robots_disallow", links: [] };
    }

    try {
      await assertSafeUrl(item.url);

      const response = await fetch(item.url, {
        redirect: "follow",
        headers: {
          "User-Agent": WEBSITE_CONFIGS.USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(WEBSITE_CONFIGS.FETCH_TIMEOUT_MS),
      });

      const finalUrl = normalizeUrl(response.url) ?? item.url;
      await assertSafeUrl(finalUrl);
      if (!isAllowedHost(finalUrl, allowedHosts)) {
        return {
          status: "skipped",
          reason: `redirect_host_not_allowed final=${finalUrl}`,
          links: [],
          finalUrl,
        };
      }

      if (!response.ok) {
        return {
          status: "skipped",
          reason: `http_${response.status}`,
          links: [],
          finalUrl,
        };
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (
        !contentType.includes("text/html") &&
        !contentType.includes("application/xhtml")
      ) {
        return {
          status: "skipped",
          reason: `non_html_content_type:${contentType || "missing"}`,
          links: [],
          finalUrl,
        };
      }

      const contentLength = Number(response.headers.get("content-length") ?? "0");
      if (
        contentLength > 0 &&
        contentLength > WEBSITE_CONFIGS.MAX_RESPONSE_BYTES
      ) {
        return {
          status: "skipped",
          reason: `content_too_large:${contentLength}`,
          links: [],
          finalUrl,
        };
      }

      const html = await this.readBodyLimited(
        response,
        WEBSITE_CONFIGS.MAX_RESPONSE_BYTES,
      );
      if (!html) {
        return {
          status: "skipped",
          reason: "body_too_large_or_empty",
          links: [],
          finalUrl,
        };
      }

      const extracted = extractHtmlContent(html, finalUrl);
      return {
        status: "extracted",
        page: {
          url: finalUrl,
          title: extracted.title,
          text: extracted.text,
        },
        links: extracted.links,
        textLength: extracted.text.length,
        finalUrl,
      };
    } catch (error) {
      return {
        status: "failed",
        reason:
          error instanceof Error ? error.message : String(error),
        links: [],
      };
    }
  }

  private bump(counts: Map<string, number>, reason: string) {
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }

  private async readBodyLimited(
    response: Response,
    maxBytes: number,
  ): Promise<string | null> {
    if (!response.body) {
      const text = await response.text();
      return text.length > maxBytes ? null : text;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString(
      "utf8",
    );
  }
}
