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
  formatJobSource,
  formatListedDate,
  isSmokeTestJob,
} from "@/lib/job-search/format";
import {
  dashboardStats,
  getClient,
  listJobs,
  listMatches,
} from "@/lib/job-search/store";
import type { Client, Job, JobClientMatch } from "@/lib/job-search/types";

type FitRow = {
  match: JobClientMatch;
  client: Client | null;
};

type JobGroup = {
  job: Job;
  fits: FitRow[];
};

function fitTone(rec: JobClientMatch["recommendation"]) {
  if (rec === "review_first") return "ember" as const;
  if (rec === "consider") return "ink" as const;
  if (rec === "excluded") return "warm" as const;
  return "warm" as const;
}

function fitLabel(rec: JobClientMatch["recommendation"]) {
  if (rec === "review_first") return "Strong fit";
  if (rec === "consider") return "Possible fit";
  if (rec === "low_priority") return "Weak fit";
  if (rec === "excluded") return "Not a fit";
  return rec;
}

function JobInboxCard({
  group,
  showWeakFits,
}: {
  group: JobGroup;
  showWeakFits: boolean;
}) {
  const { job, fits } = group;
  const visible = showWeakFits
    ? fits
    : fits.filter(
        (f) =>
          f.match.recommendation === "review_first" ||
          f.match.recommendation === "consider",
      );
  const displayFits = visible.length ? visible : fits;

  return (
    <JsCard className="hover:bg-white/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-warm-500">
            <span>Listed {formatListedDate(job)}</span>
            <span aria-hidden>·</span>
            <span>{formatJobSource(job)}</span>
            {job.location ? (
              <>
                <span aria-hidden>·</span>
                <span>{job.location}</span>
              </>
            ) : null}
          </div>
          <h3 className="mt-2 font-display text-xl text-charcoal">
            {job.title} <span className="text-warm-500">·</span> {job.employer}
          </h3>
          <ul className="mt-3 space-y-2">
            {displayFits.map(({ match, client }) => (
              <li
                key={match.id}
                className="rounded-md border border-warm-100 bg-warm-50/60 px-3 py-2"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-charcoal">
                    {client?.name ?? "Client"}
                  </span>
                  <JsBadge tone={fitTone(match.recommendation)}>
                    {fitLabel(match.recommendation)}
                  </JsBadge>
                  <JsBadge>
                    {Math.round(match.confidence * 100)}% conf.
                  </JsBadge>
                </div>
                {match.rationale ? (
                  <p className="mt-1 font-reading text-sm leading-relaxed text-warm-700">
                    {match.rationale}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
        <JsButton href={`/job-search/jobs/${job.id}`} variant="secondary">
          Open
        </JsButton>
      </div>
    </JsCard>
  );
}

export default async function JobSearchDashboard() {
  const session = await requireCoachPage();
  const stats = await dashboardStats();
  const [jobs, matches] = await Promise.all([listJobs(), listMatches()]);

  const realJobs = jobs.filter((j) => !isSmokeTestJob(j));
  const jobById = new Map(realJobs.map((j) => [j.id, j]));

  const clientCache = new Map<string, Client | null>();
  async function clientOf(id: string) {
    if (!clientCache.has(id)) {
      clientCache.set(id, await getClient(id));
    }
    return clientCache.get(id) ?? null;
  }

  // Latest: newest jobs (by lastSeen / firstSeen), with all client fits
  const latestJobs = [...realJobs]
    .sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt))
    .slice(0, 15);

  const latestGroups: JobGroup[] = [];
  for (const job of latestJobs) {
    const jobMatches = matches.filter((m) => m.jobId === job.id);
    const fits: FitRow[] = [];
    for (const m of jobMatches) {
      fits.push({ match: m, client: await clientOf(m.clientId) });
    }
    fits.sort((a, b) => b.match.confidence - a.match.confidence);
    latestGroups.push({ job, fits });
  }

  // Priority: jobs with at least one strong/consider unreviewed match
  const priorityMatchIds = matches.filter(
    (m) =>
      m.decision === "unreviewed" &&
      (m.recommendation === "review_first" ||
        m.recommendation === "consider") &&
      jobById.has(m.jobId),
  );
  const priorityJobIds = [
    ...new Set(priorityMatchIds.map((m) => m.jobId)),
  ].slice(0, 20);

  const priorityGroups: JobGroup[] = [];
  for (const jobId of priorityJobIds) {
    const job = jobById.get(jobId);
    if (!job) continue;
    const jobMatches = matches
      .filter((m) => m.jobId === jobId && m.decision === "unreviewed")
      .sort((a, b) => b.confidence - a.confidence);
    const fits: FitRow[] = [];
    for (const m of jobMatches) {
      fits.push({ match: m, client: await clientOf(m.clientId) });
    }
    priorityGroups.push({ job, fits });
  }
  priorityGroups.sort((a, b) => {
    const aBest = Math.max(...a.fits.map((f) => f.match.confidence), 0);
    const bBest = Math.max(...b.fits.map((f) => f.match.confidence), 0);
    return bBest - aBest;
  });

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
            { label: "Jobs in catalogue", value: realJobs.length },
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
            <div>
              <h2 className="font-display text-2xl text-charcoal">Latest</h2>
              <p className="mt-1 text-sm text-warm-500">
                Newest roles — including weak or “not a fit” scores so you can
                override the heuristic.
              </p>
            </div>
            <Link
              href="/job-search/jobs"
              className="text-sm font-semibold text-ember no-underline"
            >
              All jobs →
            </Link>
          </div>

          {latestGroups.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                No roles in the catalogue yet. Run Job Discovery or import a
                posting.
              </p>
            </JsCard>
          ) : (
            <ul className="space-y-3">
              {latestGroups.map((group) => (
                <li key={group.job.id}>
                  <JobInboxCard group={group} showWeakFits />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-charcoal">
                Priority inbox
              </h2>
              <p className="mt-1 text-sm text-warm-500">
                Unreviewed strong / possible fits. One role can list multiple
                clients.
              </p>
            </div>
          </div>

          {priorityGroups.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                No unreviewed high-priority matches yet.
              </p>
            </JsCard>
          ) : (
            <ul className="space-y-3">
              {priorityGroups.map((group) => (
                <li key={group.job.id}>
                  <JobInboxCard group={group} showWeakFits={false} />
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
