import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { buildDiscoveryCriteria } from "@/lib/job-search/discovery-criteria";

function authorized(request: Request, hasCoachSession: boolean) {
  if (hasCoachSession) return true;
  const expected = process.env.JOB_SEARCH_INGEST_TOKEN;
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return Boolean(expected && token === expected);
}

/**
 * Union of active-client geos/titles for Job Discovery Bot (shared crawl).
 */
export async function GET(request: Request) {
  const session = await getSession();
  if (!authorized(request, Boolean(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const criteria = await buildDiscoveryCriteria();
    return NextResponse.json(criteria);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to build discovery criteria",
      },
      { status: 500 },
    );
  }
}
