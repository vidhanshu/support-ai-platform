export const PDF_MIME = "application/pdf";
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
/** Mirrors TEXT_SNIPPET_CONFIGS.MAX_CONTENT_BYTES from @repo/config */
export const TEXT_SNIPPET_MAX_BYTES = 1 * 1024 * 1024;

export type SourceCardId =
  | "files"
  | "website"
  | "text"
  | "qa"
  | "notion"
  | "tickets";

export type SourceCardConfig = {
  id: SourceCardId;
  title: string;
  description: string;
  enabled: boolean;
};

export const SOURCE_CARDS: SourceCardConfig[] = [
  {
    id: "files",
    title: "Add files",
    description: "PDF supported now",
    enabled: true,
  },
  {
    id: "website",
    title: "Add website",
    description: "Crawl a site",
    enabled: true,
  },
  {
    id: "text",
    title: "Add text snippet",
    description: "Rich text knowledge",
    enabled: true,
  },
  {
    id: "qa",
    title: "Add Q&A's",
    description: "Coming soon",
    enabled: false,
  },
  {
    id: "notion",
    title: "Add Notion pages",
    description: "Coming soon",
    enabled: false,
  },
  {
    id: "tickets",
    title: "Add tickets",
    description: "Coming soon",
    enabled: false,
  },
];

export const FILE_FORMAT_BADGES = [
  { ext: ".pdf", enabled: true },
  { ext: ".md", enabled: false },
  { ext: ".txt", enabled: false },
  { ext: ".docx", enabled: false },
] as const;

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatSourceDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
