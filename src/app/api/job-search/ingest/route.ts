import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { ingestDiscoveryJobs } from "@/lib/job-search/ingest";

function authorized(request: Request, hasCoachSession: boolean) {
  if (hasCoachSession) return true;
  const expected = process.env.JOB_SEARCH_INGEST_TOKEN;
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(expected && token === expected);
}

/**
 * Ingest for Job Discovery Bot (Bearer token) or coach paste (session cookie).
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!authorized(request, Boolean(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const jobs = Array.isArray(body.jobs)
    ? body.jobs
    : Array.isArray(body)
      ? body
      : [body];

  const triggeredBy =
    body.triggeredBy === "cursor"
      ? "cursor"
      : body.triggeredBy === "manual" || session
        ? "manual"
        : "grok_bot";

  try {
    const result = await ingestDiscoveryJobs({
      jobs,
      triggeredBy,
      notes: String(body.notes ?? "Discovery ingest"),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
