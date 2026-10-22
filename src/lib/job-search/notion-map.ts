/**
 * Maps Web Job Search allocations → Notion Opportunities properties
 * (schema confirmed from Alan Ong's board).
 *
 * Note: Notion property is misspelled "Job decription" — keep as-is.
 */
export type NotionOpportunityPayload = {
  Opportunity: string;
  Company: string;
  Role: string;
  "Job decription": string;
  "Salary range": string;
  Notes: string;
  Date: string;
  "How keen?": "Super keen" | "Keen" | "Maybe" | "Not keen" | null;
  Round: "Lead";
  Type: "Full-time" | "Contract" | "Consulting" | "Other";
  Source: "AI Agent";
};

export function toNotionOpportunity(input: {
  jobTitle: string;
  employer: string;
  canonicalUrl: string;
  salary: string;
  coachNotes: string;
  rationale: string;
  type?: NotionOpportunityPayload["Type"];
  howKeen?: NotionOpportunityPayload["How keen?"];
}): NotionOpportunityPayload {
  const notes = [input.coachNotes.trim(), input.rationale.trim()]
    .filter(Boolean)
    .join("\n\n");

  return {
    Opportunity: `${input.jobTitle} @ ${input.employer}`,
    Company: input.employer,
    Role: input.jobTitle,
    "Job decription": input.canonicalUrl,
    "Salary range": input.salary,
    Notes: notes,
    Date: new Date().toISOString().slice(0, 10),
    "How keen?": input.howKeen ?? "Maybe",
    Round: "Lead",
    Type: input.type ?? "Full-time",
    Source: "AI Agent",
  };
}
