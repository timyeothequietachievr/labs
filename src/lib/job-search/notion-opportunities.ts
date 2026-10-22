import type { Client, Job } from "./types";

const NOTION_VERSION = "2022-06-28";

function getToken() {
  return (
    process.env.NOTION_INTEGRATION_TOKEN ||
    process.env.NOTION_API_KEY ||
    process.env.NOTION_TOKEN ||
    null
  );
}

function normalizeDatabaseId(id: string) {
  const raw = id.replace(/^collection:\/\//, "").replace(/-/g, "").trim();
  if (raw.length !== 32) return id.trim();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function urlsSimilar(a: string, b: string) {
  if (!a.trim() || !b.trim()) return false;
  const clean = (u: string) =>
    u
      .toLowerCase()
      .replace(/\/$/, "")
      .replace(/^https?:\/\//, "")
      .split("?")[0]
      .split("#")[0];
  const ca = clean(a);
  const cb = clean(b);
  return ca === cb || ca.includes(cb) || cb.includes(ca);
}

export type ExistingOpportunity = {
  opportunity: string;
  company: string;
  role: string;
  jobUrl: string;
};

type NotionQueryResponse = {
  results: Array<{
    properties: Record<string, unknown>;
  }>;
  has_more?: boolean;
  next_cursor?: string | null;
};

function readTitle(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { title?: Array<{ plain_text?: string }> };
  return (p.title ?? []).map((t) => t.plain_text ?? "").join("");
}

function readRichText(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as { rich_text?: Array<{ plain_text?: string }> };
  return (p.rich_text ?? []).map((t) => t.plain_text ?? "").join("");
}

function readUrl(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  return (prop as { url?: string | null }).url ?? "";
}

/**
 * Loads rows from a client's Opportunities database (Notion REST).
 * Returns [] if token missing, DB missing, or not shared with the integration.
 */
export async function listClientOpportunities(
  client: Client,
): Promise<ExistingOpportunity[]> {
  const token = getToken();
  const databaseId = client.notionOpportunitiesDatabaseId;
  if (!token || !databaseId?.trim()) return [];

  const database_id = normalizeDatabaseId(databaseId);
  const rows: ExistingOpportunity[] = [];
  let cursor: string | null = null;

  try {
    do {
      const response = await fetch(
        `https://api.notion.com/v1/databases/${database_id}/query`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Notion-Version": NOTION_VERSION,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page_size: 100,
            start_cursor: cursor || undefined,
          }),
        },
      );
      if (!response.ok) {
        // Not shared / not found — fail soft so matching still runs
        return [];
      }
      const data = (await response.json()) as NotionQueryResponse;
      for (const page of data.results) {
        const props = page.properties || {};
        rows.push({
          opportunity: readTitle(props.Opportunity),
          company: readRichText(props.Company),
          role: readRichText(props.Role),
          jobUrl: readUrl(props["Job decription"]) || readUrl(props["Job description"]),
        });
      }
      cursor = data.has_more ? data.next_cursor ?? null : null;
    } while (cursor);
  } catch {
    return [];
  }

  return rows;
}

export function jobMatchesExistingOpportunity(
  job: Job,
  existing: ExistingOpportunity[],
): ExistingOpportunity | null {
  const employer = norm(job.employer);
  const title = norm(job.title);

  for (const row of existing) {
    if (job.canonicalUrl && row.jobUrl && urlsSimilar(job.canonicalUrl, row.jobUrl)) {
      return row;
    }
    const rowCompany = norm(row.company);
    const rowRole = norm(row.role || row.opportunity);
    if (
      employer &&
      rowCompany &&
      employer === rowCompany &&
      title &&
      rowRole &&
      (title === rowRole ||
        title.includes(rowRole) ||
        rowRole.includes(title) ||
        norm(row.opportunity).includes(title))
    ) {
      return row;
    }
  }
  return null;
}

const cache = new Map<string, { at: number; rows: ExistingOpportunity[] }>();
const CACHE_MS = 5 * 60 * 1000;

export async function getCachedClientOpportunities(client: Client) {
  const key = client.id;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.rows;
  const rows = await listClientOpportunities(client);
  cache.set(key, { at: Date.now(), rows });
  return rows;
}
