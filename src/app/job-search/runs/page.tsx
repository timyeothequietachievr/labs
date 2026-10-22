import { JobSearchShell } from "@/components/job-search/AppShell";
import { DiscoveryPasteForm } from "@/components/job-search/DiscoveryPasteForm";
import {
  JsBadge,
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";
import { listRuns } from "@/lib/job-search/store";

export default async function RunsPage() {
  const session = await requireCoachPage();
  const runs = await listRuns();

  return (
    <JobSearchShell email={session.email}>
      <JsContainer>
        <JsEyebrow>Operations</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">Runs</h1>
        <p className="mt-2 max-w-2xl font-reading text-sm text-warm-700">
          Primary discovery runner is{" "}
          <strong>Job Discovery Bot</strong> (Grok Bot). Paste its JSON here,
          or POST to <code>/api/job-search/ingest</code> with the ingest token.
        </p>

        <JsCard className="mt-8">
          <h2 className="font-display text-xl text-charcoal">Run now</h2>
          <p className="mt-1 mb-4 text-sm text-warm-700">
            After the Bot returns jobs, paste the JSON and ingest. Every active
            client is scored automatically.
          </p>
          <DiscoveryPasteForm />
        </JsCard>

        <h2 className="mt-10 font-display text-xl text-charcoal">History</h2>
        <ul className="mt-4 space-y-3">
          {runs.length === 0 ? (
            <JsCard>
              <p className="text-sm text-warm-700">No runs yet.</p>
            </JsCard>
          ) : (
            runs.map((run) => (
              <li key={run.id}>
                <JsCard>
                  <div className="flex flex-wrap items-center gap-2">
                    <JsBadge
                      tone={
                        run.status === "ok"
                          ? "sunrise"
                          : run.status === "failed"
                            ? "ember"
                            : "warm"
                      }
                    >
                      {run.status}
                    </JsBadge>
                    <JsBadge tone="ink">{run.triggeredBy}</JsBadge>
                  </div>
                  <p className="mt-2 text-sm text-charcoal">
                    {run.startedAt}
                    {run.finishedAt ? ` → ${run.finishedAt}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-warm-700">
                    discovered {run.jobsDiscovered} · new {run.jobsNew} ·
                    matches {run.matchesCreated}
                  </p>
                  {run.notes ? (
                    <p className="mt-2 text-sm text-warm-500">{run.notes}</p>
                  ) : null}
                  {run.sourceFailures.length ? (
                    <p className="mt-2 text-sm text-ember-deep">
                      Issues: {run.sourceFailures.join("; ")}
                    </p>
                  ) : null}
                </JsCard>
              </li>
            ))
          )}
        </ul>
      </JsContainer>
    </JobSearchShell>
  );
}
