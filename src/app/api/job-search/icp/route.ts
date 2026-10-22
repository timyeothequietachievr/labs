import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import {
  ingestProspectsToNotion,
  type IcpProspectInput,
} from "@/lib/job-search/notion-prospects";

function authorized(request: Request, hasCoachSession: boolean) {
  if (hasCoachSession) return true;
  const expected = process.env.JOB_SEARCH_INGEST_TOKEN;
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(expected && token === expected);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!authorized(request, Boolean(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const rawList = Array.isArray(body.prospects)
    ? body.prospects
    : Array.isArray(body)
      ? body
      : [body];

  const prospects: IcpProspectInput[] = rawList.map((p: Record<string, unknown>) => ({
    rank: p.rank != null ? Number(p.rank) : undefined,
    name: String(p.name ?? ""),
    linkedin_url: String(p.linkedin_url ?? p.linkedin ?? ""),
    headline: String(p.headline ?? ""),
    location: String(p.location ?? ""),
    company: String(p.company ?? ""),
    title: String(p.title ?? ""),
    degree: String(p.degree ?? "2nd"),
    mutual_connections: Array.isArray(p.mutual_connections)
      ? p.mutual_connections.map(String)
      : String(p.mutuals ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
    buyer_states: Array.isArray(p.buyer_states)
      ? p.buyer_states.map(String)
      : [],
    icp_score: p.icp_score != null ? Number(p.icp_score) : undefined,
    connection_likelihood:
      p.connection_likelihood != null
        ? Number(p.connection_likelihood)
        : undefined,
    total_score: p.total_score != null ? Number(p.total_score) : undefined,
    why_fit: String(p.why_fit ?? ""),
    why_likely_to_connect: String(p.why_likely_to_connect ?? ""),
    suggested_opener: String(p.suggested_opener ?? ""),
  }));

  if (!prospects.length) {
    return NextResponse.json(
      { error: "No prospects in payload" },
      { status: 400 },
    );
  }

  try {
    const result = await ingestProspectsToNotion(prospects);
    return NextResponse.json({
      written: result.created.length,
      created: result.created,
      errors: result.errors,
      notionUrl:
        "https://app.notion.com/p/40141716da288058a328fd115350eddd",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ICP ingest failed" },
      { status: 502 },
    );
  }
}
