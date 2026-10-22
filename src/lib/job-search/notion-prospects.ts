const NOTION_VERSION = "2022-06-28";

export type IcpProspectInput = {
  rank?: number;
  name: string;
  linkedin_url?: string;
  headline?: string;
  location?: string;
  company?: string;
  title?: string;
  degree?: string;
  mutual_connections?: string[];
  buyer_states?: string[];
  icp_score?: number;
  connection_likelihood?: number;
  total_score?: number;
  why_fit?: string;
  why_likely_to_connect?: string;
  suggested_opener?: string;
};

function getToken() {
  return (
    process.env.NOTION_INTEGRATION_TOKEN ||
    process.env.NOTION_API_KEY ||
    process.env.NOTION_TOKEN ||
    null
  );
}

export function getProspectsDatabaseId() {
  return (
    process.env.NOTION_PROSPECTS_DATABASE_ID ||
    "40141716da288058a328fd115350eddd"
  );
}

function normalizeDatabaseId(id: string) {
  const raw = id.replace(/^collection:\/\//, "").replace(/-/g, "").trim();
  if (raw.length !== 32) return id.trim();
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
}

function richText(content: string) {
  const clipped = (content || "").slice(0, 1900);
  return { rich_text: clipped ? [{ text: { content: clipped } }] : [] };
}

function title(content: string) {
  return {
    title: [{ text: { content: (content || "Untitled prospect").slice(0, 2000) } }],
  };
}

function select(name: string | null | undefined) {
  if (!name) return { select: null };
  return { select: { name } };
}

function multiSelect(names: string[] | undefined) {
  const opts = (names || [])
    .map((n) => String(n).trim().toUpperCase())
    .filter((n) => ["A", "B", "C", "D"].includes(n))
    .map((name) => ({ name }));
  return { multi_select: opts };
}

function num(value: number | undefined | null) {
  if (value == null || Number.isNaN(Number(value))) return { number: null };
  return { number: Number(value) };
}

function urlProp(value: string | undefined) {
  const trimmed = (value || "").trim();
  if (!trimmed) return { url: null };
  return { url: trimmed };
}

function dateProp(start: string) {
  return { date: { start } };
}

function mapDegree(raw: string | undefined) {
  const d = (raw || "").toLowerCase();
  if (d.includes("1")) return "1st";
  if (d.includes("2")) return "2nd";
  if (d.includes("3")) return "3rd";
  if (d.includes("out")) return "Out of network";
  return raw ? "2nd" : null;
}

export async function createProspectInNotion(
  prospect: IcpProspectInput,
): Promise<{ pageId: string; url: string }> {
  const token = getToken();
  if (!token) {
    throw new Error("NOTION_INTEGRATION_TOKEN is not configured");
  }

  const database_id = normalizeDatabaseId(getProspectsDatabaseId());
  const mutuals = (prospect.mutual_connections || []).join(", ");
  const today = new Date().toISOString().slice(0, 10);

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
        Name: title(prospect.name),
        LinkedIn: urlProp(prospect.linkedin_url),
        Headline: richText(prospect.headline || ""),
        Location: richText(prospect.location || ""),
        Company: richText(prospect.company || ""),
        Title: richText(prospect.title || ""),
        Degree: select(mapDegree(prospect.degree)),
        Mutuals: richText(mutuals),
        "Buyer states": multiSelect(prospect.buyer_states),
        Rank: num(prospect.rank),
        "ICP score": num(prospect.icp_score),
        "Connect likelihood": num(prospect.connection_likelihood),
        "Total score": num(prospect.total_score),
        "Why fit": richText(prospect.why_fit || ""),
        "Why likely to connect": richText(prospect.why_likely_to_connect || ""),
        "Suggested opener": richText(prospect.suggested_opener || ""),
        Status: select("New"),
        Source: select("ICP Bot"),
        "Run date": dateProp(today),
      },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        `Notion could not find Prospects database ${database_id}. Share it with your Notion integration (••• → Connections), then retry. ${text}`,
      );
    }
    throw new Error(`Notion API ${response.status}: ${text}`);
  }

  const json = JSON.parse(text) as { id: string; url: string };
  return { pageId: json.id, url: json.url };
}

export async function ingestProspectsToNotion(prospects: IcpProspectInput[]) {
  const created: Array<{ name: string; pageId: string; url: string }> = [];
  const errors: string[] = [];

  for (const p of prospects) {
    if (!p.name?.trim()) {
      errors.push("Skipped prospect with empty name");
      continue;
    }
    try {
      const row = await createProspectInNotion(p);
      created.push({ name: p.name, ...row });
    } catch (error) {
      errors.push(
        `${p.name}: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  return { created, errors };
}
