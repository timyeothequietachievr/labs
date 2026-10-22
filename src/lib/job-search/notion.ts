import type { NotionOpportunityPayload } from "./notion-map";

const NOTION_VERSION = "2022-06-28";

export type NotionCreateResult = {
  pageId: string;
  url: string;
};

function getToken() {
  return (
    process.env.NOTION_INTEGRATION_TOKEN ||
    process.env.NOTION_API_KEY ||
    process.env.NOTION_TOKEN ||
    null
  );
}

function richText(content: string) {
  const clipped = content.slice(0, 1900);
  return { rich_text: clipped ? [{ text: { content: clipped } }] : [] };
}

function title(content: string) {
  return {
    title: [{ text: { content: content.slice(0, 2000) || "Untitled opportunity" } }],
  };
}

function select(name: string | null) {
  if (!name) return { select: null };
  return { select: { name } };
}

function date(start: string) {
  return { date: { start } };
}

function url(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { url: null };
  return { url: trimmed };
}

function normalizeDatabaseId(id: string) {
  const raw = id
    .replace(/^collection:\/\//, "")
    .replace(/-/g, "")
    .trim();
  if (raw.length !== 32) return id.trim();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

export function isNotionConfigured() {
  return Boolean(getToken());
}

/**
 * Creates a row in a client's Opportunities database.
 * The database must be shared with the Notion integration used by NOTION_INTEGRATION_TOKEN.
 */
export async function createOpportunityInNotion(input: {
  databaseId: string;
  payload: NotionOpportunityPayload;
}): Promise<NotionCreateResult> {
  const token = getToken();
  if (!token) {
    throw new Error(
      "NOTION_INTEGRATION_TOKEN is not configured. Add it to .env.local.",
    );
  }
  if (!input.databaseId.trim()) {
    throw new Error(
      "This client has no Notion Opportunities database id. Edit the client and paste the database id.",
    );
  }

  const database_id = normalizeDatabaseId(input.databaseId);
  const p = input.payload;

  const response = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id },
      properties: {
        Opportunity: title(p.Opportunity),
        Company: richText(p.Company),
        Role: richText(p.Role),
        "Job decription": url(p["Job decription"]),
        "Salary range": richText(p["Salary range"]),
        Notes: richText(p.Notes),
        Date: date(p.Date),
        "How keen?": select(p["How keen?"]),
        Round: select(p.Round),
        Type: select(p.Type),
        Source: select(p.Source),
      },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Notion could not find database ${database_id}. Share that Opportunities database with your Notion integration (Connections → invite the integration), then try again. Details: ${text}`,
      );
    }
    throw new Error(`Notion API ${response.status}: ${text}`);
  }

  const json = JSON.parse(text) as { id: string; url: string };
  return { pageId: json.id, url: json.url };
}
