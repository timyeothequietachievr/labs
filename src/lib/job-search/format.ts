import { JOB_DISCOVERY_SOURCES } from "./sources";
import type { Job, JobSourceRef } from "./types";

const SOURCE_LABELS: Record<string, string> = Object.fromEntries(
  JOB_DISCOVERY_SOURCES.flatMap((s) => {
    const labels: [string, string][] = [[s.id, s.label]];
    if (s.community) {
      labels.push([s.id, `${s.community} · ${s.label}`]);
    }
    // ingest often uses underscored aliases
    labels.push([s.id.replace(/-/g, "_"), labels[labels.length - 1][1]]);
    return labels;
  }),
);

SOURCE_LABELS.leadingdesign_jobs_leadership = "Leading Design · #jobs-leadership";
SOURCE_LABELS.leadingdesign_jobs_ic = "Leading Design · #jobs-ic";
SOURCE_LABELS.aussiedesigners_jobs = "Aussie Designers · #jobs";
SOURCE_LABELS.researchops_jobs = "Research Ops · #jobs";
SOURCE_LABELS.contentux_jobs_gigs = "Content + UX · #jobs-and-gigs";
SOURCE_LABELS.designleaders_jobs = "Design Leaders · #jobs";
SOURCE_LABELS.adplist_job_opportunities = "ADPList · #job-opportunities";
SOURCE_LABELS.designsystems_connect_jobs = "Design Systems · #connect-jobs";
SOURCE_LABELS.lenny_job_openings = "Lenny’s Newsletter · #job-openings";
SOURCE_LABELS.linkedin_jcolman = "LinkedIn · Jonathan Coleman";
SOURCE_LABELS.linkedin_public = "LinkedIn jobs";
SOURCE_LABELS.linkedin_alert = "LinkedIn alert";
SOURCE_LABELS.trueup = "TrueUp";
SOURCE_LABELS.jobright = "Jobright";
SOURCE_LABELS.jobsangel = "JobsAngel";
SOURCE_LABELS.manual = "Manual";
SOURCE_LABELS.discovery = "Discovery";

/** Listed date as dd/mm/yyyy (uses postingDate, else firstSeenAt). */
export function formatListedDate(job: Job): string {
  const raw = job.postingDate || job.firstSeenAt;
  if (!raw) return "—";
  const d = new Date(raw.includes("T") ? raw : `${raw}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatSourceLabel(source: string): string {
  const key = source.trim();
  if (!key) return "Unknown";
  if (SOURCE_LABELS[key]) return SOURCE_LABELS[key];
  const dashed = key.replace(/_/g, "-");
  if (SOURCE_LABELS[dashed]) return SOURCE_LABELS[dashed];
  return key.replace(/_/g, " ");
}

export function primarySource(job: Job): JobSourceRef | null {
  return job.sources[0] ?? null;
}

export function formatJobSource(job: Job): string {
  const src = primarySource(job);
  if (!src) return "Unknown";
  return formatSourceLabel(src.source);
}

export function isSmokeTestJob(job: {
  title: string;
  employer: string;
}): boolean {
  const blob = `${job.title} ${job.employer}`.toLowerCase();
  return (
    blob.includes("smoke test") ||
    blob.includes("quiet achiever labs test") ||
    blob.includes("(smoke")
  );
}
