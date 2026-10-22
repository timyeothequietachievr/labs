import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import {
  emptyPreferences,
  emptyStore,
  type Client,
  type ClientPreferences,
  type Job,
  type JobClientMatch,
  type JobSearchStore,
  type MatchDecision,
  type Recommendation,
  type RunLog,
  type WorkArrangement,
} from "./types";
import { hashJd } from "./hash";

const DATA_PATH = path.join(process.cwd(), ".data", "job-search.json");

async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  try {
    await fs.access(DATA_PATH);
  } catch {
    await fs.writeFile(DATA_PATH, JSON.stringify(emptyStore(), null, 2), "utf8");
  }
}

export async function readStore(): Promise<JobSearchStore> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_PATH, "utf8");
  const parsed = JSON.parse(raw) as JobSearchStore;
  return {
    ...emptyStore(),
    ...parsed,
    clients: (parsed.clients ?? []).map((c) => ({
      ...c,
      notionAiClientBriefUrl: c.notionAiClientBriefUrl ?? "",
      aiClientBrief: c.aiClientBrief ?? "",
      notionOpportunitiesDatabaseId: c.notionOpportunitiesDatabaseId ?? "",
      notionOpportunitiesCollectionId: c.notionOpportunitiesCollectionId ?? "",
    })),
    jobs: parsed.jobs ?? [],
    matches: parsed.matches ?? [],
    runs: parsed.runs ?? [],
  };
}

export async function writeStore(store: JobSearchStore): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), "utf8");
}

function nowIso() {
  return new Date().toISOString();
}


export async function listClients() {
  const store = await readStore();
  return store.clients
    .filter((c) => c.status !== "archived")
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getClient(id: string) {
  const store = await readStore();
  return store.clients.find((c) => c.id === id) ?? null;
}

export async function upsertClient(input: {
  id?: string;
  name: string;
  status?: Client["status"];
  notionCoachingPlanUrl?: string;
  notionAiClientBriefUrl?: string;
  aiClientBrief?: string;
  notionOpportunitiesDatabaseId?: string;
  notionOpportunitiesCollectionId?: string;
  portfolioUrl?: string;
  cvSummary?: string;
  currentSalaryNote?: string;
  targetSalaryNote?: string;
  preferences?: Partial<ClientPreferences>;
}) {
  const store = await readStore();
  const ts = nowIso();
  if (input.id) {
    const idx = store.clients.findIndex((c) => c.id === input.id);
    if (idx === -1) throw new Error("Client not found");
    const existing = store.clients[idx];
    store.clients[idx] = {
      ...existing,
      name: input.name,
      status: input.status ?? existing.status,
      notionCoachingPlanUrl:
        input.notionCoachingPlanUrl ?? existing.notionCoachingPlanUrl,
      notionAiClientBriefUrl:
        input.notionAiClientBriefUrl ?? existing.notionAiClientBriefUrl ?? "",
      aiClientBrief: input.aiClientBrief ?? existing.aiClientBrief ?? "",
      notionOpportunitiesDatabaseId:
        input.notionOpportunitiesDatabaseId ??
        existing.notionOpportunitiesDatabaseId,
      notionOpportunitiesCollectionId:
        input.notionOpportunitiesCollectionId ??
        existing.notionOpportunitiesCollectionId,
      portfolioUrl: input.portfolioUrl ?? existing.portfolioUrl,
      cvSummary: input.cvSummary ?? existing.cvSummary,
      currentSalaryNote: input.currentSalaryNote ?? existing.currentSalaryNote,
      targetSalaryNote: input.targetSalaryNote ?? existing.targetSalaryNote,
      preferences: {
        ...existing.preferences,
        ...(input.preferences ?? {}),
      },
      updatedAt: ts,
    };
    await writeStore(store);
    return store.clients[idx];
  }

  const client: Client = {
    id: randomUUID(),
    name: input.name,
    status: input.status ?? "active",
    notionCoachingPlanUrl: input.notionCoachingPlanUrl ?? "",
    notionAiClientBriefUrl: input.notionAiClientBriefUrl ?? "",
    aiClientBrief: input.aiClientBrief ?? "",
    notionOpportunitiesDatabaseId: input.notionOpportunitiesDatabaseId ?? "",
    notionOpportunitiesCollectionId:
      input.notionOpportunitiesCollectionId ?? "",
    portfolioUrl: input.portfolioUrl ?? "",
    cvSummary: input.cvSummary ?? "",
    currentSalaryNote: input.currentSalaryNote ?? "",
    targetSalaryNote: input.targetSalaryNote ?? "",
    preferences: { ...emptyPreferences(), ...(input.preferences ?? {}) },
    createdAt: ts,
    updatedAt: ts,
  };
  store.clients.push(client);
  await writeStore(store);
  return client;
}

export async function listJobs() {
  const store = await readStore();
  return [...store.jobs].sort((a, b) =>
    b.lastSeenAt.localeCompare(a.lastSeenAt),
  );
}

export async function getJob(id: string) {
  const store = await readStore();
  return store.jobs.find((j) => j.id === id) ?? null;
}

function canonicalKey(job: {
  employer: string;
  title: string;
  canonicalUrl: string;
  externalRequisitionId: string;
}) {
  if (job.externalRequisitionId.trim()) {
    return `req:${job.externalRequisitionId.trim().toLowerCase()}`;
  }
  if (job.canonicalUrl.trim()) {
    return `url:${job.canonicalUrl.trim().toLowerCase().replace(/\/$/, "")}`;
  }
  return `title:${job.employer.trim().toLowerCase()}|${job.title.trim().toLowerCase()}`;
}

export async function upsertJob(input: {
  employer: string;
  title: string;
  location?: string;
  arrangement?: WorkArrangement;
  canonicalUrl?: string;
  externalRequisitionId?: string;
  jdText: string;
  source: string;
  sourceUrl?: string;
  postingDate?: string | null;
  advertisedCompensation?: string;
  compensationCurrency?: string;
}) {
  const store = await readStore();
  const ts = nowIso();
  const contentHash = hashJd(input.jdText);
  const key = canonicalKey({
    employer: input.employer,
    title: input.title,
    canonicalUrl: input.canonicalUrl ?? "",
    externalRequisitionId: input.externalRequisitionId ?? "",
  });

  // Only treat identical JD hashes as the same role when titles also match —
  // TrueUp often reuses a one-line company blurb across different openings.
  const existing = store.jobs.find((j) => {
    return (
      canonicalKey(j) === key ||
      (j.contentHash === contentHash &&
        j.employer.toLowerCase() === input.employer.toLowerCase() &&
        j.title.toLowerCase() === input.title.toLowerCase() &&
        input.jdText.trim().length >= 80)
    );
  });

  if (existing) {
    existing.lastSeenAt = ts;
    existing.lastCheckedAt = ts;
    existing.updatedAt = ts;
    if (input.jdText.trim().length > existing.jdText.trim().length) {
      existing.jdText = input.jdText;
      existing.contentHash = contentHash;
    }
    existing.sources.push({
      source: input.source,
      url: input.sourceUrl || input.canonicalUrl || existing.canonicalUrl,
      seenAt: ts,
    });
    await writeStore(store);
    return { job: existing, created: false };
  }

  const job: Job = {
    id: randomUUID(),
    employer: input.employer,
    title: input.title,
    location: input.location ?? "",
    arrangement: input.arrangement ?? "unknown",
    canonicalUrl: input.canonicalUrl ?? "",
    externalRequisitionId: input.externalRequisitionId ?? "",
    jdText: input.jdText,
    contentHash,
    sources: [
      {
        source: input.source,
        url: input.sourceUrl || input.canonicalUrl || "",
        seenAt: ts,
      },
    ],
    firstSeenAt: ts,
    lastSeenAt: ts,
    lastCheckedAt: ts,
    postingDate: input.postingDate ?? null,
    availability: "open",
    advertisedCompensation: input.advertisedCompensation ?? "",
    compensationCurrency: input.compensationCurrency ?? "",
    createdAt: ts,
    updatedAt: ts,
  };
  store.jobs.push(job);
  await writeStore(store);
  return { job, created: true };
}

export async function listMatches(filters?: {
  clientId?: string;
  jobId?: string;
  decision?: MatchDecision;
}) {
  const store = await readStore();
  return store.matches.filter((m) => {
    if (filters?.clientId && m.clientId !== filters.clientId) return false;
    if (filters?.jobId && m.jobId !== filters.jobId) return false;
    if (filters?.decision && m.decision !== filters.decision) return false;
    return true;
  });
}

export async function upsertMatch(input: {
  jobId: string;
  clientId: string;
  recommendation: Recommendation;
  rationale: string;
  strongestEvidence: string;
  gaps: string;
  eligibilityConcerns: string;
  confidence: number;
  profileVersionNote?: string;
}) {
  const store = await readStore();
  const ts = nowIso();
  const existingIdx = store.matches.findIndex(
    (m) => m.jobId === input.jobId && m.clientId === input.clientId,
  );
  if (existingIdx >= 0) {
    const existing = store.matches[existingIdx];
    store.matches[existingIdx] = {
      ...existing,
      recommendation: input.recommendation,
      rationale: input.rationale,
      strongestEvidence: input.strongestEvidence,
      gaps: input.gaps,
      eligibilityConcerns: input.eligibilityConcerns,
      confidence: input.confidence,
      assessedAt: ts,
      profileVersionNote:
        input.profileVersionNote ?? existing.profileVersionNote,
    };
    await writeStore(store);
    return { match: store.matches[existingIdx], created: false };
  }

  const match: JobClientMatch = {
    id: randomUUID(),
    jobId: input.jobId,
    clientId: input.clientId,
    recommendation: input.recommendation,
    rationale: input.rationale,
    strongestEvidence: input.strongestEvidence,
    gaps: input.gaps,
    eligibilityConcerns: input.eligibilityConcerns,
    confidence: input.confidence,
    decision: "unreviewed",
    coachNotes: "",
    appliedAt: null,
    notionPageId: null,
    assessedAt: ts,
    profileVersionNote: input.profileVersionNote ?? "v1",
  };
  store.matches.push(match);
  await writeStore(store);
  return { match, created: true };
}

export async function updateMatchDecision(input: {
  matchId: string;
  decision?: MatchDecision;
  coachNotes?: string;
  notionPageId?: string | null;
  appliedAt?: string | null;
}) {
  const store = await readStore();
  const idx = store.matches.findIndex((m) => m.id === input.matchId);
  if (idx === -1) throw new Error("Match not found");
  const existing = store.matches[idx];
  store.matches[idx] = {
    ...existing,
    decision: input.decision ?? existing.decision,
    coachNotes: input.coachNotes ?? existing.coachNotes,
    notionPageId:
      input.notionPageId === undefined
        ? existing.notionPageId
        : input.notionPageId,
    appliedAt:
      input.appliedAt === undefined ? existing.appliedAt : input.appliedAt,
  };
  await writeStore(store);
  return store.matches[idx];
}

export async function createRun(input: {
  triggeredBy: RunLog["triggeredBy"];
  notes?: string;
}) {
  const store = await readStore();
  const run: RunLog = {
    id: randomUUID(),
    triggeredBy: input.triggeredBy,
    startedAt: nowIso(),
    finishedAt: null,
    status: "running",
    jobsDiscovered: 0,
    jobsNew: 0,
    matchesCreated: 0,
    sourceFailures: [],
    notes: input.notes ?? "",
  };
  store.runs.unshift(run);
  await writeStore(store);
  return run;
}

export async function finishRun(
  runId: string,
  patch: Partial<Omit<RunLog, "id" | "startedAt" | "triggeredBy">>,
) {
  const store = await readStore();
  const idx = store.runs.findIndex((r) => r.id === runId);
  if (idx === -1) throw new Error("Run not found");
  store.runs[idx] = {
    ...store.runs[idx],
    ...patch,
    finishedAt: patch.finishedAt ?? nowIso(),
  };
  await writeStore(store);
  return store.runs[idx];
}

export async function listRuns() {
  const store = await readStore();
  return store.runs;
}

export async function dashboardStats() {
  const store = await readStore();
  const unreviewed = store.matches.filter((m) => m.decision === "unreviewed");
  const reviewFirst = unreviewed.filter(
    (m) => m.recommendation === "review_first",
  );
  return {
    clientCount: store.clients.filter((c) => c.status === "active").length,
    jobCount: store.jobs.length,
    unreviewedCount: unreviewed.length,
    reviewFirstCount: reviewFirst.length,
    lastRun: store.runs[0] ?? null,
  };
}
