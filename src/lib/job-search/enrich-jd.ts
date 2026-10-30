/**
 * Fetch a job posting URL and extract readable job-description text.
 * Best-effort HTML strip — enough for coach review without leaving the app.
 */
export async function fetchJobDescriptionText(
  url: string,
): Promise<string | null> {
  if (!url?.trim()) return null;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "QuietAchieverJobSearch/1.0 (+https://labs.thequietachievr.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain") &&
      !contentType.includes("application/xhtml")
    ) {
      return null;
    }
    const html = await res.text();
    return htmlToPlainText(html);
  } catch {
    return null;
  }
}

function htmlToPlainText(html: string): string {
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|br|hr)[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\r/g, "");

  text = text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");

  // Drop very short / junk extractions
  if (text.length < 120) return "";
  // Cap extreme pages
  if (text.length > 40000) text = text.slice(0, 40000) + "\n…";
  return text;
}

/** Prefer a longer fetched JD when the stored snippet is thin. */
export function shouldEnrichJd(existingJd: string): boolean {
  return existingJd.trim().length < 400;
}
