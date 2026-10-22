import Link from "next/link";
import { JobSearchShell } from "@/components/job-search/AppShell";
import {
  JsBadge,
  JsButton,
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";
import {
  dashboardStats,
  getClient,
  getJob,
  listMatches,
} from "@/lib/job-search/store";

export default async function JobSearchDashboard() {
  const session = await requireCoachPage();
  const stats = await dashboardStats();
  const matches = await listMatches({ decision: "unreviewed" });
  const top = [...matches]
    .filter((m) => m.recommendation === "review_first" || m.recommendation === "consider")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 12);

  const enriched = await Promise.all(
    top.map(async (m) => ({
      match: m,
      job: await getJob(m.jobId),
      client: await getClient(m.clientId),
    })),
  );

  return (
    <JobSearchShell email={session.email}>
      <JsContainer>
        <div className="labs-enter flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <JsEyebrow>Coach radar</JsEyebrow>
            <h1 className="display-headline mt-2 text-4xl text-charcoal sm:text-5xl">
              Web Job Search
            </h1>
            <p className="mt-3 max-w-xl font-reading text-base leading-relaxed text-warm-700">
              Shared job catalogue, scored across every active client. Allocate
              into Notion Opportunities when ready.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <JsButton href="/job-search/import">Import a role</JsButton>
            <JsButton href="/job-search/clients" variant="secondary">
              Manage clients
            </JsButton>
          </div>
        </div>

        <div className="labs-enter-delay mt-8 grid gap-3 sm:grid-cols-4">
          {[
            { label: "Active clients", value: stats.clientCount },
            { label: "Jobs in catalogue", value: stats.jobCount },
            { label: "Unreviewed matches", value: stats.unreviewedCount },
            { label: "Review first", value: stats.reviewFirstCount },
          ].map((item) => (
            <JsCard key={item.label}>
              <p className="text-xs font-semibold tracking-wider2 text-warm-500 uppercase">
                {item.label}
              </p>
              <p className="mt-2 font-display text-3xl text-charcoal">
                {item.value}
              </p>
            </JsCard>
          ))}
        </div>

        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl text-charcoal">
              Priority inbox
            </h2>
            <Link
              href="/job-search/jobs"
              className="text-sm font-semibold text-ember no-underline"
            >
              All jobs →
            </Link>
          </div>

          {enriched.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                No unreviewed high-priority matches yet. Add a client, then
                import a job description to seed the catalogue.
              </p>
            </JsCard>
          ) : (
            <ul className="space-y-3">
              {enriched.map(({ match, job, client }) => (
                <li key={match.id}>
                  <JsCard className="hover:bg-white/60">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <JsBadge
                            tone={
                              match.recommendation === "review_first"
                                ? "ember"
                                : "ink"
                            }
                          >
                            {match.recommendation.replace("_", " ")}
                          </JsBadge>
                          <JsBadge>
                            {Math.round(match.confidence * 100)}% conf.
                          </JsBadge>
                        </div>
                        <h3 className="mt-2 font-display text-xl text-charcoal">
                          {job?.title ?? "Unknown role"}{" "}
                          <span className="text-warm-500">·</span>{" "}
                          {job?.employer}
                        </h3>
                        <p className="mt-1 text-sm text-warm-700">
                          For <strong>{client?.name ?? "client"}</strong>
                          {job?.location ? ` · ${job.location}` : ""}
                        </p>
                        <p className="mt-3 max-w-3xl font-reading text-sm leading-relaxed text-warm-700">
                          {match.rationale}
                        </p>
                      </div>
                      <JsButton
                        href={`/job-search/jobs/${job?.id}`}
                        variant="secondary"
                      >
                        Open
                      </JsButton>
                    </div>
                  </JsCard>
                </li>
              ))}
            </ul>
          )}
        </section>

        {stats.lastRun ? (
          <p className="mt-8 text-xs text-warm-500">
            Last run: {stats.lastRun.status} · {stats.lastRun.triggeredBy} ·{" "}
            {stats.lastRun.startedAt}
          </p>
        ) : null}
      </JsContainer>
    </JobSearchShell>
  );
}
