import { randomUUID } from "crypto";
import { getSupabase } from "./supabase";
import {
  emptyPreferences,
  type Client,
  type ClientPreferences,
  type Job,
  type JobClientMatch,
  type JobSourceRef,
  type MatchDecision,
  type Recommendation,
  type RunLog,
  type WorkArrangement,
} from "./types";
import { hashJd } from "./hash";

type ClientRow = {
  id: string;
  name: string;
  status: string;
  notion_coaching_plan_url: string | null;
  notion_ai_client_brief_url: string | null;
  ai_client_brief: string | null;
  notion_opportunities_database_id: string | null;
  notion_opportunities_collection_id: string | null;
  portfolio_url: string | null;
  cv_summary: string | null;
  current_salary_note: string | null;
  target_salary_note: string | null;
  preferences: ClientPreferences | null;
  created_at: string;
  updated_at: string;
};

type JobRow = {
  id: string;
  employer: string;
  title: string;
  location: string | null;
  arrangement: string | null;
  canonical_url: string | null;
  external_requisition_id: string | null;
  jd_text: string;
  content_hash: string;
  sources: JobSourceRef[] | null;
  first_seen_at: string;
  last_seen_at: string;
  last_checked_at: string;
  posting_date: string | null;
  availability: string | null;
  advertised_compensation: string | null;
  compensation_currency: string | null;
  created_at: string;
  updated_at: string;
};

type MatchRow = {
  id: string;
  job_id: string;
  client_id: string;
  recommendation: string;
  rationale: string | null;
  strongest_evidence: string | null;
  gaps: string | null;
  eligibility_concerns: string | null;
  confidence: number | string;
  decision: string;
  coach_notes: string | null;
  applied_at: string | null;
  notion_page_id: string | null;
  assessed_at: string;
  profile_version_note: string | null;
};

type RunRow = {
  id: string;
  triggered_by: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  jobs_discovered: number;
  jobs_new: number;
  matches_created: number;
  source_failures: string[] | null;
  notes: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    status: row.status as Client["status"],
    notionCoachingPlanUrl: row.notion_coaching_plan_url ?? "",
    notionAiClientBriefUrl: row.notion_ai_client_brief_url ?? "",
    aiClientBrief: row.ai_client_brief ?? "",
    notionOpportunitiesDatabaseId: row.notion_opportunities_database_id ?? "",
    notionOpportunitiesCollectionId:
      row.notion_opportunities_collection_id ?? "",
    portfolioUrl: row.portfolio_url ?? "",
    cvSummary: row.cv_summary ?? "",
    currentSalaryNote: row.current_salary_note ?? "",
    targetSalaryNote: row.target_salary_note ?? "",
    preferences: {
      ...emptyPreferences(),
      ...(row.preferences ?? {}),
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    employer: row.employer,
    title: row.title,
    location: row.location ?? "",
    arrangement: (row.arrangement as WorkArrangement) ?? "unknown",
    canonicalUrl: row.canonical_url ?? "",
    externalRequisitionId: row.external_requisition_id ?? "",
    jdText: row.jd_text,
    contentHash: row.content_hash,
    sources: row.sources ?? [],
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    lastCheckedAt: row.last_checked_at,
    postingDate: row.posting_date,
    availability: (row.availability as Job["availability"]) ?? "open",
    advertisedCompensation: row.advertised_compensation ?? "",
    compensationCurrency: row.compensation_currency ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapMatch(row: MatchRow): JobClientMatch {
  return {
    id: row.id,
    jobId: row.job_id,
    clientId: row.client_id,
    recommendation: row.recommendation as Recommendation,
    rationale: row.rationale ?? "",
    strongestEvidence: row.strongest_evidence ?? "",
    gaps: row.gaps ?? "",
    eligibilityConcerns: row.eligibility_concerns ?? "",
    confidence: Number(row.confidence) || 0,
    decision: row.decision as MatchDecision,
    coachNotes: row.coach_notes ?? "",
    appliedAt: row.applied_at,
    notionPageId: row.notion_page_id,
    assessedAt: row.assessed_at,
    profileVersionNote: row.profile_version_note ?? "v1",
  };
}

function mapRun(row: RunRow): RunLog {
  return {
    id: row.id,
    triggeredBy: row.triggered_by as RunLog["triggeredBy"],
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    status: row.status as RunLog["status"],
    jobsDiscovered: row.jobs_discovered,
    jobsNew: row.jobs_new,
    matchesCreated: row.matches_created,
    sourceFailures: row.source_failures ?? [],
    notes: row.notes ?? "",
  };
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

export async function listClients() {
  const { data, error } = await getSupabase()
    .from("js_clients")
    .select("*")
    .neq("status", "archived")
    .order("name");
  if (error) throw error;
  return (data as ClientRow[]).map(mapClient);
}

export async function getClient(id: string) {
  const { data, error } = await getSupabase()
    .from("js_clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapClient(data as ClientRow) : null;
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
  const ts = nowIso();
  if (input.id) {
    const existing = await getClient(input.id);
    if (!existing) throw new Error("Client not found");
    const next = {
      name: input.name,
      status: input.status ?? existing.status,
      notion_coaching_plan_url:
        input.notionCoachingPlanUrl ?? existing.notionCoachingPlanUrl,
      notion_ai_client_brief_url:
        input.notionAiClientBriefUrl ?? existing.notionAiClientBriefUrl,
      ai_client_brief: input.aiClientBrief ?? existing.aiClientBrief,
      notion_opportunities_database_id:
        input.notionOpportunitiesDatabaseId ??
        existing.notionOpportunitiesDatabaseId,
      notion_opportunities_collection_id:
        input.notionOpportunitiesCollectionId ??
        existing.notionOpportunitiesCollectionId,
      portfolio_url: input.portfolioUrl ?? existing.portfolioUrl,
      cv_summary: input.cvSummary ?? existing.cvSummary,
      current_salary_note:
        input.currentSalaryNote ?? existing.currentSalaryNote,
      target_salary_note: input.targetSalaryNote ?? existing.targetSalaryNote,
      preferences: {
        ...existing.preferences,
        ...(input.preferences ?? {}),
      },
      updated_at: ts,
    };
    const { data, error } = await getSupabase()
      .from("js_clients")
      .update(next)
      .eq("id", input.id)
      .select("*")
      .single();
    if (error) throw error;
    return mapClient(data as ClientRow);
  }

  const id = randomUUID();
  const row = {
    id,
    name: input.name,
    status: input.status ?? "active",
    notion_coaching_plan_url: input.notionCoachingPlanUrl ?? "",
    notion_ai_client_brief_url: input.notionAiClientBriefUrl ?? "",
    ai_client_brief: input.aiClientBrief ?? "",
    notion_opportunities_database_id: input.notionOpportunitiesDatabaseId ?? "",
    notion_opportunities_collection_id:
      input.notionOpportunitiesCollectionId ?? "",
    portfolio_url: input.portfolioUrl ?? "",
    cv_summary: input.cvSummary ?? "",
    current_salary_note: input.currentSalaryNote ?? "",
    target_salary_note: input.targetSalaryNote ?? "",
    preferences: { ...emptyPreferences(), ...(input.preferences ?? {}) },
    created_at: ts,
    updated_at: ts,
  };
  const { data, error } = await getSupabase()
    .from("js_clients")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return mapClient(data as ClientRow);
}

export async function listJobs() {
  const { data, error } = await getSupabase()
    .from("js_jobs")
    .select("*")
    .order("last_seen_at", { ascending: false });
  if (error) throw error;
  return (data as JobRow[]).map(mapJob);
}

export async function getJob(id: string) {
  const { data, error } = await getSupabase()
    .from("js_jobs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapJob(data as JobRow) : null;
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
  const ts = nowIso();
  const contentHash = hashJd(input.jdText);
  const key = canonicalKey({
    employer: input.employer,
    title: input.title,
    canonicalUrl: input.canonicalUrl ?? "",
    externalRequisitionId: input.externalRequisitionId ?? "",
  });

  const jobs = await listJobs();
  const existing = jobs.find((j) => {
    return (
      canonicalKey({
        employer: j.employer,
        title: j.title,
        canonicalUrl: j.canonicalUrl,
        externalRequisitionId: j.externalRequisitionId,
      }) === key ||
      (j.contentHash === contentHash &&
        j.employer.toLowerCase() === input.employer.toLowerCase() &&
        j.title.toLowerCase() === input.title.toLowerCase() &&
        input.jdText.trim().length >= 80)
    );
  });

  if (existing) {
    const sources = [
      ...existing.sources,
      {
        source: input.source,
        url: input.sourceUrl || input.canonicalUrl || existing.canonicalUrl,
        seenAt: ts,
      },
    ];
    const jdText =
      input.jdText.trim().length > existing.jdText.trim().length
        ? input.jdText
        : existing.jdText;
    const { data, error } = await getSupabase()
      .from("js_jobs")
      .update({
        last_seen_at: ts,
        last_checked_at: ts,
        updated_at: ts,
        jd_text: jdText,
        content_hash: jdText === existing.jdText ? existing.contentHash : contentHash,
        sources,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return { job: mapJob(data as JobRow), created: false };
  }

  const id = randomUUID();
  const row = {
    id,
    employer: input.employer,
    title: input.title,
    location: input.location ?? "",
    arrangement: input.arrangement ?? "unknown",
    canonical_url: input.canonicalUrl ?? "",
    external_requisition_id: input.externalRequisitionId ?? "",
    jd_text: input.jdText,
    content_hash: contentHash,
    sources: [
      {
        source: input.source,
        url: input.sourceUrl || input.canonicalUrl || "",
        seenAt: ts,
      },
    ],
    first_seen_at: ts,
    last_seen_at: ts,
    last_checked_at: ts,
    posting_date: input.postingDate ?? null,
    availability: "open",
    advertised_compensation: input.advertisedCompensation ?? "",
    compensation_currency: input.compensationCurrency ?? "",
    created_at: ts,
    updated_at: ts,
  };
  const { data, error } = await getSupabase()
    .from("js_jobs")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return { job: mapJob(data as JobRow), created: true };
}

export async function listMatches(filters?: {
  clientId?: string;
  jobId?: string;
  decision?: MatchDecision;
}) {
  let q = getSupabase().from("js_job_client_matches").select("*");
  if (filters?.clientId) q = q.eq("client_id", filters.clientId);
  if (filters?.jobId) q = q.eq("job_id", filters.jobId);
  if (filters?.decision) q = q.eq("decision", filters.decision);
  const { data, error } = await q;
  if (error) throw error;
  return (data as MatchRow[]).map(mapMatch);
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
  const ts = nowIso();
  const existing = (
    await listMatches({ jobId: input.jobId, clientId: input.clientId })
  )[0];

  if (existing) {
    const { data, error } = await getSupabase()
      .from("js_job_client_matches")
      .update({
        recommendation: input.recommendation,
        rationale: input.rationale,
        strongest_evidence: input.strongestEvidence,
        gaps: input.gaps,
        eligibility_concerns: input.eligibilityConcerns,
        confidence: input.confidence,
        assessed_at: ts,
        profile_version_note:
          input.profileVersionNote ?? existing.profileVersionNote,
      })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error) throw error;
    return { match: mapMatch(data as MatchRow), created: false };
  }

  const row = {
    id: randomUUID(),
    job_id: input.jobId,
    client_id: input.clientId,
    recommendation: input.recommendation,
    rationale: input.rationale,
    strongest_evidence: input.strongestEvidence,
    gaps: input.gaps,
    eligibility_concerns: input.eligibilityConcerns,
    confidence: input.confidence,
    decision: "unreviewed",
    coach_notes: "",
    applied_at: null,
    notion_page_id: null,
    assessed_at: ts,
    profile_version_note: input.profileVersionNote ?? "v1",
  };
  const { data, error } = await getSupabase()
    .from("js_job_client_matches")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return { match: mapMatch(data as MatchRow), created: true };
}

export async function updateMatchDecision(input: {
  matchId: string;
  decision?: MatchDecision;
  coachNotes?: string;
  notionPageId?: string | null;
  appliedAt?: string | null;
}) {
  const { data: existing, error: findErr } = await getSupabase()
    .from("js_job_client_matches")
    .select("*")
    .eq("id", input.matchId)
    .maybeSingle();
  if (findErr) throw findErr;
  if (!existing) throw new Error("Match not found");
  const row = existing as MatchRow;
  const { data, error } = await getSupabase()
    .from("js_job_client_matches")
    .update({
      decision: input.decision ?? row.decision,
      coach_notes: input.coachNotes ?? row.coach_notes,
      notion_page_id:
        input.notionPageId === undefined
          ? row.notion_page_id
          : input.notionPageId,
      applied_at:
        input.appliedAt === undefined ? row.applied_at : input.appliedAt,
    })
    .eq("id", input.matchId)
    .select("*")
    .single();
  if (error) throw error;
  return mapMatch(data as MatchRow);
}

export async function createRun(input: {
  triggeredBy: RunLog["triggeredBy"];
  notes?: string;
}) {
  const row = {
    id: randomUUID(),
    triggered_by: input.triggeredBy,
    started_at: nowIso(),
    finished_at: null,
    status: "running",
    jobs_discovered: 0,
    jobs_new: 0,
    matches_created: 0,
    source_failures: [],
    notes: input.notes ?? "",
  };
  const { data, error } = await getSupabase()
    .from("js_run_logs")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return mapRun(data as RunRow);
}

export async function finishRun(
  runId: string,
  patch: Partial<Omit<RunLog, "id" | "startedAt" | "triggeredBy">>,
) {
  const updates: Record<string, unknown> = {
    finished_at: patch.finishedAt ?? nowIso(),
  };
  if (patch.status !== undefined) updates.status = patch.status;
  if (patch.jobsDiscovered !== undefined)
    updates.jobs_discovered = patch.jobsDiscovered;
  if (patch.jobsNew !== undefined) updates.jobs_new = patch.jobsNew;
  if (patch.matchesCreated !== undefined)
    updates.matches_created = patch.matchesCreated;
  if (patch.sourceFailures !== undefined)
    updates.source_failures = patch.sourceFailures;
  if (patch.notes !== undefined) updates.notes = patch.notes;

  const { data, error } = await getSupabase()
    .from("js_run_logs")
    .update(updates)
    .eq("id", runId)
    .select("*")
    .single();
  if (error) throw error;
  return mapRun(data as RunRow);
}

export async function listRuns() {
  const { data, error } = await getSupabase()
    .from("js_run_logs")
    .select("*")
    .order("started_at", { ascending: false });
  if (error) throw error;
  return (data as RunRow[]).map(mapRun);
}

export async function dashboardStats() {
  const [clients, jobs, matches, runs] = await Promise.all([
    listClients(),
    listJobs(),
    listMatches(),
    listRuns(),
  ]);
  const unreviewed = matches.filter((m) => m.decision === "unreviewed");
  const reviewFirst = unreviewed.filter(
    (m) => m.recommendation === "review_first",
  );
  return {
    clientCount: clients.filter((c) => c.status === "active").length,
    jobCount: jobs.length,
    unreviewedCount: unreviewed.length,
    reviewFirstCount: reviewFirst.length,
    lastRun: runs[0] ?? null,
  };
}

export async function updateJobJd(jobId: string, jdText: string) {
  const { data, error } = await getSupabase()
    .from("js_jobs")
    .update({
      jd_text: jdText,
      content_hash: hashJd(jdText),
      updated_at: nowIso(),
    })
    .eq("id", jobId)
    .select("*")
    .single();
  if (error) throw error;
  return mapJob(data as JobRow);
}

export async function deleteJob(jobId: string) {
  const { error } = await getSupabase().from("js_jobs").delete().eq("id", jobId);
  if (error) throw error;
}
