import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { assessJobAgainstClients } from "@/lib/job-search/matching";
import {
  createRun,
  finishRun,
  listClients,
  listMatches,
  upsertJob,
  upsertMatch,
} from "@/lib/job-search/store";
import { WorkArrangement } from "@/lib/job-search/types";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const employer = String(body.employer ?? "").trim();
  const title = String(body.title ?? "").trim();
  const jdText = String(body.jdText ?? "").trim();

  if (!employer || !title || !jdText) {
    return NextResponse.json(
      { error: "employer, title, and jdText are required" },
      { status: 400 },
    );
  }

  const arrangementParse = WorkArrangement.safeParse(body.arrangement);
  const run = await createRun({
    triggeredBy: "manual",
    notes: "Manual JD import",
  });

  try {
    const { job, created } = await upsertJob({
      employer,
      title,
      location: String(body.location ?? ""),
      arrangement: arrangementParse.success ? arrangementParse.data : "unknown",
      canonicalUrl: String(body.canonicalUrl ?? ""),
      externalRequisitionId: String(body.externalRequisitionId ?? ""),
      jdText,
      source: "manual",
      sourceUrl: String(body.canonicalUrl ?? ""),
      advertisedCompensation: String(body.advertisedCompensation ?? ""),
      compensationCurrency: String(body.compensationCurrency ?? ""),
    });

    const clients = await listClients();
    const priorMatches = await listMatches({ jobId: job.id });
    const assessments = await assessJobAgainstClients(
      job,
      clients,
      priorMatches,
    );
    let matchesCreated = 0;
    const matches = [];

    for (const row of assessments) {
      const { match, created: matchCreated } = await upsertMatch({
        jobId: job.id,
        clientId: row.client.id,
        ...row.assessment,
      });
      if (matchCreated) matchesCreated += 1;
      matches.push({
        ...match,
        clientName: row.client.name,
      });
    }

    matches.sort((a, b) => b.confidence - a.confidence);

    await finishRun(run.id, {
      status: "ok",
      jobsDiscovered: 1,
      jobsNew: created ? 1 : 0,
      matchesCreated,
      notes: `Imported ${title} @ ${employer}`,
    });

    return NextResponse.json({
      job,
      created,
      matches,
    });
  } catch (error) {
    await finishRun(run.id, {
      status: "failed",
      sourceFailures: [error instanceof Error ? error.message : "unknown"],
    });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed" },
      { status: 500 },
    );
  }
}
