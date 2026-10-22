import { assessJobAgainstClients } from "./matching";
import {
  createRun,
  finishRun,
  listClients,
  listMatches,
  upsertJob,
  upsertMatch,
} from "./store";
import type { RunLog } from "./types";
import { WorkArrangement } from "./types";

export type DiscoveryJobInput = {
  company?: string;
  employer?: string;
  title?: string;
  location?: string;
  arrangement?: string;
  url?: string;
  canonicalUrl?: string;
  snippet_or_jd?: string;
  jdText?: string;
  snippet?: string;
  source?: string;
  external_id?: string;
  externalRequisitionId?: string;
  posted_at?: string | null;
  postingDate?: string | null;
};

export async function ingestDiscoveryJobs(input: {
  jobs: DiscoveryJobInput[];
  triggeredBy: RunLog["triggeredBy"];
  notes?: string;
}) {
  const run = await createRun({
    triggeredBy: input.triggeredBy,
    notes: input.notes ?? "Discovery ingest",
  });

  let jobsNew = 0;
  let matchesCreated = 0;
  const results: Array<{
    jobId: string;
    created: boolean;
    title: string;
    employer: string;
  }> = [];
  const skipped: string[] = [];

  try {
    const clients = await listClients();

    for (const raw of input.jobs) {
      const employer = String(raw.company ?? raw.employer ?? "").trim();
      const title = String(raw.title ?? "").trim();
      const jdText =
        String(raw.snippet_or_jd ?? raw.jdText ?? raw.snippet ?? "").trim() ||
        // Discovery often ships title-only rows; keep them for coach review.
        (title && employer ? `${title} at ${employer}` : "");
      if (!employer || !title) {
        skipped.push(
          `${title || "untitled"} @ ${employer || "unknown"} (missing fields)`,
        );
        continue;
      }

      const arrangementParse = WorkArrangement.safeParse(raw.arrangement);
      const { job, created } = await upsertJob({
        employer,
        title,
        location: String(raw.location ?? ""),
        arrangement: arrangementParse.success
          ? arrangementParse.data
          : "unknown",
        canonicalUrl: String(raw.url ?? raw.canonicalUrl ?? ""),
        externalRequisitionId: String(
          raw.external_id ?? raw.externalRequisitionId ?? "",
        ),
        jdText,
        source: String(raw.source ?? "discovery"),
        sourceUrl: String(raw.url ?? raw.canonicalUrl ?? ""),
        postingDate: raw.posted_at ?? raw.postingDate ?? null,
      });
      if (created) jobsNew += 1;

      const priorMatches = await listMatches({ jobId: job.id });
      const assessments = await assessJobAgainstClients(
        job,
        clients,
        priorMatches,
      );
      for (const row of assessments) {
        const { created: matchCreated } = await upsertMatch({
          jobId: job.id,
          clientId: row.client.id,
          ...row.assessment,
        });
        if (matchCreated) matchesCreated += 1;
      }
      results.push({ jobId: job.id, created, title, employer });
    }

    await finishRun(run.id, {
      status: skipped.length && !results.length ? "failed" : skipped.length ? "partial" : "ok",
      jobsDiscovered: results.length,
      jobsNew,
      matchesCreated,
      sourceFailures: skipped,
      notes: input.notes ?? run.notes,
    });

    return {
      runId: run.id,
      jobsDiscovered: results.length,
      jobsNew,
      matchesCreated,
      skipped,
      results,
    };
  } catch (error) {
    await finishRun(run.id, {
      status: "failed",
      sourceFailures: [error instanceof Error ? error.message : "unknown"],
    });
    throw error;
  }
}
