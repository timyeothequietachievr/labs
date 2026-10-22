import { notFound } from "next/navigation";
import { JobSearchShell } from "@/components/job-search/AppShell";
import { MatchActions } from "@/components/job-search/MatchActions";
import {
  JsBadge,
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";
import { getClient, getJob, listMatches } from "@/lib/job-search/store";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCoachPage();
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const matches = await listMatches({ jobId: job.id });
  const enriched = (
    await Promise.all(
      matches.map(async (m) => ({
        match: m,
        client: await getClient(m.clientId),
      })),
    )
  ).sort((a, b) => b.match.confidence - a.match.confidence);

  return (
    <JobSearchShell email={session.email}>
      <JsContainer>
        <JsEyebrow>Job record</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          {job.title}
        </h1>
        <p className="mt-2 text-lg text-warm-700">
          {job.employer}
          {job.location ? ` · ${job.location}` : ""} · {job.arrangement}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <JsBadge tone="ink">{job.availability}</JsBadge>
          {job.sources.map((s, i) => (
            <JsBadge key={`${s.source}-${i}`}>{s.source}</JsBadge>
          ))}
        </div>
        {job.canonicalUrl ? (
          <p className="mt-3 text-sm">
            <a
              href={job.canonicalUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ember"
            >
              Open original posting →
            </a>
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <JsCard>
            <h2 className="font-display text-xl text-charcoal">
              Job description
            </h2>
            <pre className="mt-4 whitespace-pre-wrap font-reading text-sm leading-relaxed text-warm-700">
              {job.jdText}
            </pre>
          </JsCard>

          <div className="space-y-4">
            <h2 className="font-display text-xl text-charcoal">
              Client matches
            </h2>
            {enriched.length === 0 ? (
              <JsCard>
                <p className="text-sm text-warm-700">
                  No matches yet. Add active clients and re-import.
                </p>
              </JsCard>
            ) : (
              enriched.map(({ match, client }) => (
                <JsCard key={match.id}>
                  <div className="flex flex-wrap gap-2">
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
                    <JsBadge tone="ink">{match.decision}</JsBadge>
                  </div>
                  <h3 className="mt-2 font-display text-lg text-charcoal">
                    {client?.name ?? "Unknown client"}
                  </h3>
                  <p className="mt-2 font-reading text-sm text-warm-700">
                    {match.rationale}
                  </p>
                  {match.strongestEvidence ? (
                    <p className="mt-2 text-sm text-warm-700">
                      <strong>Evidence:</strong> {match.strongestEvidence}
                    </p>
                  ) : null}
                  {match.gaps ? (
                    <p className="mt-1 text-sm text-warm-500">
                      <strong>Gaps:</strong> {match.gaps}
                    </p>
                  ) : null}
                  {match.eligibilityConcerns ? (
                    <p className="mt-1 text-sm text-ember-deep">
                      <strong>Eligibility:</strong> {match.eligibilityConcerns}
                    </p>
                  ) : null}
                  <MatchActions
                    matchId={match.id}
                    initialNotes={match.coachNotes}
                    decision={match.decision}
                    notionPageId={match.notionPageId}
                  />
                </JsCard>
              ))
            )}
          </div>
        </div>
      </JsContainer>
    </JobSearchShell>
  );
}
