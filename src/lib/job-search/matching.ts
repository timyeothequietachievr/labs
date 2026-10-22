import {
  getCachedClientOpportunities,
  jobMatchesExistingOpportunity,
} from "./notion-opportunities";
import type { Client, Job, JobClientMatch, Recommendation } from "./types";

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 2);
}

function includesAny(haystack: string, needles: string[]) {
  const h = haystack.toLowerCase();
  return needles.some((n) => n.trim() && h.includes(n.trim().toLowerCase()));
}

function softOverlap(a: string[], b: string) {
  if (!a.length) return 0;
  const bt = new Set(tokens(b));
  const hits = a.filter((x) => tokens(x).some((t) => bt.has(t)));
  return hits.length / a.length;
}

export type Assessment = {
  recommendation: Recommendation;
  rationale: string;
  strongestEvidence: string;
  gaps: string;
  eligibilityConcerns: string;
  confidence: number;
};

/**
 * Deterministic v1 rubric. Hard filters first, then title/domain overlap.
 * Replace/augment with LLM scoring later without changing the store shape.
 */
export function assessJobForClient(
  job: Job,
  client: Client,
  opts?: {
    alreadyOnOpportunities?: boolean;
    priorDecision?: JobClientMatch["decision"];
  },
): Assessment {
  const prefs = client.preferences;
  const blob = `${job.title}\n${job.employer}\n${job.location}\n${job.arrangement}\n${job.jdText}\n${job.advertisedCompensation}`;
  const concerns: string[] = [];
  const gaps: string[] = [];

  if (opts?.alreadyOnOpportunities) {
    return {
      recommendation: "excluded",
      rationale: `Already on ${client.name}'s Opportunities board — not a new role.`,
      strongestEvidence: "",
      gaps: "Duplicate of an existing Opportunities row.",
      eligibilityConcerns: "Already tracked in Notion Opportunities.",
      confidence: 0.99,
    };
  }

  if (
    opts?.priorDecision === "allocated" ||
    opts?.priorDecision === "dismissed" ||
    opts?.priorDecision === "applied"
  ) {
    return {
      recommendation: "excluded",
      rationale: `Previously ${opts.priorDecision} for ${client.name} — skip re-recommend.`,
      strongestEvidence: "",
      gaps: "Prior coach decision on this job.",
      eligibilityConcerns: `Prior decision: ${opts.priorDecision}`,
      confidence: 0.95,
    };
  }

  if (prefs.excludedCompanies.length && includesAny(job.employer, prefs.excludedCompanies)) {
    return {
      recommendation: "excluded",
      rationale: "Employer is on the client exclusion list.",
      strongestEvidence: "",
      gaps: "Excluded company.",
      eligibilityConcerns: `Excluded company match: ${job.employer}`,
      confidence: 0.95,
    };
  }

  if (prefs.excludedTitles.length && includesAny(job.title, prefs.excludedTitles)) {
    return {
      recommendation: "excluded",
      rationale: "Role title matches an excluded title pattern.",
      strongestEvidence: "",
      gaps: "Excluded title.",
      eligibilityConcerns: `Excluded title: ${job.title}`,
      confidence: 0.9,
    };
  }

  if (prefs.arrangements.length && !prefs.arrangements.includes("unknown")) {
    if (
      job.arrangement !== "unknown" &&
      !prefs.arrangements.includes(job.arrangement)
    ) {
      concerns.push(
        `Work arrangement ${job.arrangement} is outside preferred ${prefs.arrangements.join(", ")}.`,
      );
    }
  }

  if (prefs.countries.length || prefs.locations.length) {
    const geoOk =
      (!prefs.countries.length && !prefs.locations.length) ||
      includesAny(job.location, prefs.countries) ||
      includesAny(job.location, prefs.locations) ||
      (job.arrangement === "remote" &&
        (prefs.remoteCountriesAllowed.length === 0 ||
          includesAny(blob, prefs.remoteCountriesAllowed) ||
          includesAny(job.location, prefs.remoteCountriesAllowed)));

    if (!geoOk && job.location.trim()) {
      concerns.push(
        `Location "${job.location}" may not match preferred geos (${[...prefs.countries, ...prefs.locations].join(", ") || "unspecified"}).`,
      );
    }
    if (!job.location.trim()) {
      gaps.push("Location unknown — could not verify geo fit.");
    }
  }

  const titleOverlap = softOverlap(prefs.targetTitles, `${job.title} ${job.jdText}`);
  const industryOverlap = softOverlap(prefs.industries, blob);
  const cvOverlap = softOverlap(tokens(client.cvSummary).slice(0, 40), blob);
  const briefOverlap = softOverlap(
    tokens(client.aiClientBrief || "").slice(0, 60),
    blob,
  );

  let score = 0.35;
  score += titleOverlap * 0.4;
  score += industryOverlap * 0.15;
  score += Math.min(cvOverlap, 1) * 0.15;
  score += Math.min(briefOverlap, 1) * 0.1;
  if (prefs.targetTitles.length === 0) {
    gaps.push("No target titles set — ranking is weaker.");
    score -= 0.05;
  } else if (titleOverlap === 0) {
    gaps.push("Title/keywords do not clearly match target titles.");
    score -= 0.15;
  }

  if (concerns.length) score -= 0.2 * Math.min(concerns.length, 2);
  score = Math.max(0, Math.min(1, score));

  let recommendation: Recommendation;
  if (concerns.length >= 2 && titleOverlap < 0.15) {
    recommendation = "excluded";
  } else if (score >= 0.72 && concerns.length === 0) {
    recommendation = "review_first";
  } else if (score >= 0.5) {
    recommendation = "consider";
  } else if (score >= 0.32) {
    recommendation = "low_priority";
  } else {
    recommendation = "excluded";
  }

  const evidenceParts: string[] = [];
  if (titleOverlap > 0) {
    evidenceParts.push(
      `Target title overlap ~${Math.round(titleOverlap * 100)}% against “${job.title}”.`,
    );
  }
  if (client.cvSummary.trim()) {
    evidenceParts.push("Compared against stored CV summary keywords.");
  }
  if (client.aiClientBrief?.trim()) {
    evidenceParts.push("Compared against AI Client Brief keywords.");
  }
  if (client.targetSalaryNote) {
    evidenceParts.push(`Client salary target note: ${client.targetSalaryNote}`);
  }

  return {
    recommendation,
    rationale: `Heuristic fit score ${Math.round(score * 100)}/100 for ${client.name}. ${
      recommendation === "review_first"
        ? "Strong title/geo alignment — review first."
        : recommendation === "consider"
          ? "Plausible fit with some unknowns."
          : recommendation === "low_priority"
            ? "Weak alignment; keep only if pipeline is thin."
            : "Filtered out by constraints or weak overlap."
    }`,
    strongestEvidence: evidenceParts.join(" ") || "Limited structured evidence yet.",
    gaps: gaps.join(" ") || "None flagged beyond normal JD ambiguity.",
    eligibilityConcerns: concerns.join(" ") || "",
    confidence: Math.round((0.45 + titleOverlap * 0.35) * 100) / 100,
  };
}

export async function assessJobAgainstClients(
  job: Job,
  clients: Client[],
  priorMatches: JobClientMatch[] = [],
) {
  const active = clients.filter((c) => c.status === "active");
  const results = [];

  for (const client of active) {
    const existing = await getCachedClientOpportunities(client);
    const onBoard = jobMatchesExistingOpportunity(job, existing);
    const prior = priorMatches.find(
      (m) => m.jobId === job.id && m.clientId === client.id,
    );
    results.push({
      client,
      assessment: assessJobForClient(job, client, {
        alreadyOnOpportunities: Boolean(onBoard),
        priorDecision: prior?.decision,
      }),
    });
  }

  return results;
}
