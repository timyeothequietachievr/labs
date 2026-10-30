import Link from "next/link";
import { JobSearchShell } from "@/components/job-search/AppShell";
import {
  JsBadge,
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
import { listJobs, listMatches } from "@/lib/job-search/store";

export default async function JobsPage() {
  const session = await requireCoachPage();
  const [allJobs, matches] = await Promise.all([listJobs(), listMatches()]);
  const jobs = allJobs.filter((j) => !isSmokeTestJob(j));

  return (
    <JobSearchShell email={session.email}>
      <JsContainer>
        <JsEyebrow>Catalogue</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">Jobs</h1>
        <p className="mt-2 font-reading text-sm text-warm-700">
          One shared database. Each role can match multiple clients.
        </p>

        <ul className="mt-8 space-y-3">
          {jobs.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                Catalogue is empty. Import a JD or wait for Job Discovery Bot
                ingest.
              </p>
            </JsCard>
          ) : (
            jobs.map((job) => {
              const related = matches.filter((m) => m.jobId === job.id);
              const reviewFirst = related.filter(
                (m) => m.recommendation === "review_first",
              ).length;
              return (
                <li key={job.id}>
                  <Link
                    href={`/job-search/jobs/${job.id}`}
                    className="block no-underline"
                  >
                    <JsCard className="hover:bg-white/70">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <JsBadge tone="ink">{job.availability}</JsBadge>
                            <JsBadge>{formatJobSource(job)}</JsBadge>
                            {reviewFirst > 0 ? (
                              <JsBadge tone="ember">
                                {reviewFirst} review first
                              </JsBadge>
                            ) : null}
                          </div>
                          <h2 className="mt-2 font-display text-xl text-charcoal">
                            {job.title} · {job.employer}
                          </h2>
                          <p className="mt-1 text-sm text-warm-700">
                            Listed {formatListedDate(job)} ·{" "}
                            {job.location || "Location unknown"} ·{" "}
                            {job.arrangement} · {related.length} client matches
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-ember">
                          Open →
                        </span>
                      </div>
                    </JsCard>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </JsContainer>
    </JobSearchShell>
  );
}
