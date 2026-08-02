import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { normalizeUrl, looksLikeHtmlUrl } from "./url";

export type ExtractedHtml = {
  title?: string;
  text: string;
  links: string[];
};

export function extractHtmlContent(
  html: string,
  pageUrl: string,
): ExtractedHtml {
  const dom = new JSDOM(html, { url: pageUrl });
  const document = dom.window.document;

  const links = [...document.querySelectorAll("a[href]")]
    .map((anchor) => anchor.getAttribute("href"))
    .flatMap((href) => {
      if (!href) return [];
      const normalized = normalizeUrl(href, pageUrl);
      if (!normalized || !looksLikeHtmlUrl(normalized)) return [];
      return [normalized];
    });

  // Prefer Readability article body; fall back to body text
  let title: string | undefined =
    document.querySelector("title")?.textContent?.trim() || undefined;
  let text = "";

  try {
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    if (article?.textContent?.trim()) {
      text = article.textContent.trim();
      title = article.title?.trim() || title;
    }
  } catch {
    // Readability can fail on unusual DOMs; fall through
  }

  if (!text) {
    document
      .querySelectorAll("script, style, noscript, svg, canvas")
      .forEach((node) => node.remove());
    text = document.body?.textContent?.replace(/\s+/g, " ").trim() ?? "";
  }

  return {
    title,
    text,
    links: [...new Set(links)],
  };
}
