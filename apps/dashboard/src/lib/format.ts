/** Short calendar date (e.g. "Jul 27, 2026"). */
export function formatShortDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** Compact relative time for chat logs (e.g. "44 minutes ago"). */
export function formatRelativeTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (absMs < minute) return "just now";
  if (absMs < hour) return rtf.format(Math.round(diffMs / minute), "minute");
  if (absMs < day) return rtf.format(Math.round(diffMs / hour), "hour");
  if (absMs < week) return rtf.format(Math.round(diffMs / day), "day");
  if (absMs < month) return rtf.format(Math.round(diffMs / week), "week");
  if (absMs < year) return rtf.format(Math.round(diffMs / month), "month");
  return rtf.format(Math.round(diffMs / year), "year");
}
