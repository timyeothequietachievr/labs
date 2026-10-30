import Link from "next/link";
import { notFound } from "next/navigation";
import { JobSearchShell } from "@/components/job-search/AppShell";
import { ClientForm } from "@/components/job-search/ClientForm";
import {
  JsBadge,
  JsButton,
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import {
  formatJobSource,
  formatListedDate,
  isSmokeTestJob,
} from "@/lib/job-search/format";
import { requireCoachPage } from "@/lib/job-search/guard";
import { getClient, getJob, listMatches } from "@/lib/job-search/store";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCoachPage();
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const matches = await listMatches({ clientId: client.id });
  const enriched = (
    await Promise.all(
      matches.map(async (m) => ({
        match: m,
        job: await getJob(m.jobId),
      })),
    )
  )
    .filter(
      (row) => row.job && !isSmokeTestJob(row.job),
    )
    .sort((a, b) => {
      const rank = (d: string) =>
        d === "allocated" || d === "shortlisted" || d === "applied"
          ? 0
          : d === "unreviewed"
            ? 1
            : 2;
      const dr = rank(a.match.decision) - rank(b.match.decision);
      if (dr !== 0) return dr;
      return b.match.confidence - a.match.confidence;
    });

  const primary = enriched.filter(
    (r) =>
      r.match.decision === "allocated" ||
      r.match.decision === "shortlisted" ||
      r.match.decision === "applied" ||
      r.match.recommendation === "review_first" ||
      r.match.recommendation === "consider",
  );
  const shown = primary.length ? primary : enriched;

  return (
    <JobSearchShell email={session.email}>
      <JsContainer className="max-w-6xl">
        <JsEyebrow>Client</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          {client.name}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {client.notionCoachingPlanUrl ? (
            <a
              href={client.notionCoachingPlanUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ember"
            >
              Open coaching plan →
            </a>
          ) : null}
          {client.notionAiClientBriefUrl ? (
            <a
              href={client.notionAiClientBriefUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ember"
            >
              AI Client Brief →
            </a>
          ) : null}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.85fr]">
          <section>
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-display text-2xl text-charcoal">
                Roles for {client.name.split(" ")[0]}
              </h2>
              <Link
                href="/job-search/jobs"
                className="text-sm font-semibold text-ember no-underline"
              >
                Catalogue →
              </Link>
            </div>
            {shown.length === 0 ? (
              <JsCard>
                <p className="font-reading text-sm text-warm-700">
                  No scored roles yet for this client. Run discovery or import a
                  posting.
                </p>
              </JsCard>
            ) : (
              <ul className="space-y-3">
                {shown.map(({ match, job }) => (
                  <li key={match.id}>
                    <JsCard className="hover:bg-white/60">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <JsBadge tone="ink">{match.decision}</JsBadge>
                            <JsBadge
                              tone={
                                match.recommendation === "review_first"
                                  ? "ember"
                                  : "warm"
                              }
                            >
                              {match.recommendation.replace("_", " ")}
                            </JsBadge>
                            <JsBadge>
                              {Math.round(match.confidence * 100)}% conf.
                            </JsBadge>
                          </div>
                          <h3 className="mt-2 font-display text-xl text-charcoal">
                            {job?.title}{" "}
                            <span className="text-warm-500">·</span>{" "}
                            {job?.employer}
                          </h3>
                          <p className="mt-1 text-xs text-warm-500">
                            Listed {job ? formatListedDate(job) : "—"}
                            {job ? ` · ${formatJobSource(job)}` : ""}
                            {job?.location ? ` · ${job.location}` : ""}
                          </p>
                          {match.rationale ? (
                            <p className="mt-2 font-reading text-sm text-warm-700">
                              {match.rationale}
                            </p>
                          ) : null}
                        </div>
                        {job ? (
                          <JsButton
                            href={`/job-search/jobs/${job.id}`}
                            variant="secondary"
                          >
                            Open
                          </JsButton>
                        ) : null}
                      </div>
                    </JsCard>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside>
            <h2 className="mb-4 font-display text-xl text-charcoal">Profile</h2>
            <JsCard>
              <ClientForm client={client} />
            </JsCard>
          </aside>
        </div>
      </JsContainer>
    </JobSearchShell>
  );
}
