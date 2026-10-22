import { z } from "zod";

export const WorkArrangement = z.enum([
  "remote",
  "hybrid",
  "onsite",
  "unknown",
]);
export type WorkArrangement = z.infer<typeof WorkArrangement>;

export const Recommendation = z.enum([
  "review_first",
  "consider",
  "low_priority",
  "excluded",
]);
export type Recommendation = z.infer<typeof Recommendation>;

export const MatchDecision = z.enum([
  "unreviewed",
  "shortlisted",
  "allocated",
  "dismissed",
  "applied",
]);
export type MatchDecision = z.infer<typeof MatchDecision>;

export const JobAvailability = z.enum(["open", "closed", "unknown"]);
export type JobAvailability = z.infer<typeof JobAvailability>;

export const ClientPreferencesSchema = z.object({
  targetTitles: z.array(z.string()).default([]),
  excludedTitles: z.array(z.string()).default([]),
  countries: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  arrangements: z.array(WorkArrangement).default([]),
  salaryMin: z.number().nullable().default(null),
  salaryMax: z.number().nullable().default(null),
  salaryCurrency: z.string().default("AUD"),
  remoteCountriesAllowed: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  excludedCompanies: z.array(z.string()).default([]),
  seniorityNotes: z.string().default(""),
  otherHardConstraints: z.string().default(""),
});
export type ClientPreferences = z.infer<typeof ClientPreferencesSchema>;

export type Client = {
  id: string;
  name: string;
  status: "active" | "paused" | "archived";
  notionCoachingPlanUrl: string;
  /** Notion page: coach+AI matching memory under the coaching plan */
  notionAiClientBriefUrl: string;
  /** Snapshot of AI Client Brief text used when scoring roles */
  aiClientBrief: string;
  /** Notion database page id for Opportunities (REST allocate parent) */
  notionOpportunitiesDatabaseId: string;
  /** Optional data source / collection id (MCP / newer Notion APIs) */
  notionOpportunitiesCollectionId: string;
  portfolioUrl: string;
  cvSummary: string;
  currentSalaryNote: string;
  targetSalaryNote: string;
  preferences: ClientPreferences;
  createdAt: string;
  updatedAt: string;
};

export type JobSourceRef = {
  source: string;
  url: string;
  seenAt: string;
};

export type Job = {
  id: string;
  employer: string;
  title: string;
  location: string;
  arrangement: WorkArrangement;
  canonicalUrl: string;
  externalRequisitionId: string;
  jdText: string;
  contentHash: string;
  sources: JobSourceRef[];
  firstSeenAt: string;
  lastSeenAt: string;
  lastCheckedAt: string;
  postingDate: string | null;
  availability: JobAvailability;
  advertisedCompensation: string;
  compensationCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type JobClientMatch = {
  id: string;
  jobId: string;
  clientId: string;
  recommendation: Recommendation;
  rationale: string;
  strongestEvidence: string;
  gaps: string;
  eligibilityConcerns: string;
  confidence: number;
  decision: MatchDecision;
  coachNotes: string;
  appliedAt: string | null;
  notionPageId: string | null;
  assessedAt: string;
  profileVersionNote: string;
};

export type RunLog = {
  id: string;
  triggeredBy: "cursor" | "grok_bot" | "manual" | "cron";
  startedAt: string;
  finishedAt: string | null;
  status: "running" | "ok" | "partial" | "failed";
  jobsDiscovered: number;
  jobsNew: number;
  matchesCreated: number;
  sourceFailures: string[];
  notes: string;
};

export type JobSearchStore = {
  version: 1;
  clients: Client[];
  jobs: Job[];
  matches: JobClientMatch[];
  runs: RunLog[];
};

export const emptyPreferences = (): ClientPreferences =>
  ClientPreferencesSchema.parse({});

export const emptyStore = (): JobSearchStore => ({
  version: 1,
  clients: [],
  jobs: [],
  matches: [],
  runs: [],
});
