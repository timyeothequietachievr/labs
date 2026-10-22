import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { toNotionOpportunity } from "@/lib/job-search/notion-map";
import { createOpportunityInNotion, isNotionConfigured } from "@/lib/job-search/notion";
import {
  getClient,
  getJob,
  listMatches,
  updateMatchDecision,
} from "@/lib/job-search/store";
import { MatchDecision } from "@/lib/job-search/types";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const decisionParse = MatchDecision.safeParse(body.decision);
  const nextDecision = decisionParse.success ? decisionParse.data : undefined;

  const existing = (await listMatches()).find((m) => m.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let notionPage: { pageId: string; url: string } | null = null;
  let notionPreview = null;

  if (nextDecision === "allocated") {
    const [job, client] = await Promise.all([
      getJob(existing.jobId),
      getClient(existing.clientId),
    ]);
    if (!job || !client) {
      return NextResponse.json(
        { error: "Job or client missing for this match" },
        { status: 400 },
      );
    }

    const payload = toNotionOpportunity({
      jobTitle: job.title,
      employer: job.employer,
      canonicalUrl: job.canonicalUrl,
      salary: job.advertisedCompensation || client.targetSalaryNote,
      coachNotes: String(body.coachNotes ?? existing.coachNotes ?? ""),
      rationale: existing.rationale,
    });

    notionPreview = {
      collectionId: client.notionOpportunitiesCollectionId,
      databaseId: client.notionOpportunitiesDatabaseId,
      payload,
    };

    if (!isNotionConfigured()) {
      return NextResponse.json(
        {
          error:
            "Notion is not configured. Add NOTION_INTEGRATION_TOKEN to .env.local, share the client's Opportunities database with that integration, then retry Allocate.",
          notionPreview,
        },
        { status: 503 },
      );
    }

    if (existing.notionPageId && existing.decision === "allocated") {
      return NextResponse.json({
        match: await updateMatchDecision({
          matchId: id,
          coachNotes: body.coachNotes,
        }),
        notionPreview,
        notionPage: {
          pageId: existing.notionPageId,
          url: `https://www.notion.so/${existing.notionPageId.replace(/-/g, "")}`,
        },
        message: "Already allocated — notes updated only.",
      });
    }

    try {
      notionPage = await createOpportunityInNotion({
        databaseId: client.notionOpportunitiesDatabaseId,
        payload,
      });
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Notion write failed",
          notionPreview,
        },
        { status: 502 },
      );
    }
  }

  const match = await updateMatchDecision({
    matchId: id,
    decision: nextDecision,
    coachNotes: body.coachNotes,
    notionPageId: notionPage?.pageId ?? undefined,
    appliedAt:
      nextDecision === "applied" ? new Date().toISOString() : body.appliedAt,
  });

  return NextResponse.json({
    match,
    notionPreview,
    notionPage,
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const matches = await listMatches();
  const match = matches.find((m) => m.id === id);
  if (!match) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ match });
}
