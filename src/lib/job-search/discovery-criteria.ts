import { listClients } from "./store";
import type { Client } from "./types";

function uniqSorted(values: string[]) {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

/**
 * Union of active-client markets/titles for one shared Job Discovery crawl.
 */
export async function buildDiscoveryCriteria() {
  const clients = (await listClients()).filter((c) => c.status === "active");

  const targetTitles = uniqSorted(
    clients.flatMap((c) => c.preferences.targetTitles),
  );
  const countries = uniqSorted(
    clients.flatMap((c) => c.preferences.countries),
  );
  const locations = uniqSorted(
    clients.flatMap((c) => c.preferences.locations),
  );
  const remoteCountriesAllowed = uniqSorted(
    clients.flatMap((c) => c.preferences.remoteCountriesAllowed),
  );
  const arrangements = uniqSorted(
    clients.flatMap((c) => c.preferences.arrangements),
  );

  const clientSummaries = clients.map((c: Client) => ({
    id: c.id,
    name: c.name,
    targetTitles: c.preferences.targetTitles,
    countries: c.preferences.countries,
    locations: c.preferences.locations,
    remoteCountriesAllowed: c.preferences.remoteCountriesAllowed,
    arrangements: c.preferences.arrangements,
    brief: c.aiClientBrief || c.cvSummary || "",
    briefUrl: c.notionAiClientBriefUrl || null,
  }));

  const compositeBrief = clientSummaries
    .map((c) => `${c.name}: ${c.brief || c.targetTitles.join(", ")}`)
    .join("\n");

  return {
    mode: "shared_union" as const,
    generatedAt: new Date().toISOString(),
    activeClientCount: clients.length,
    union: {
      targetTitles,
      countries,
      locations,
      remoteCountriesAllowed,
      arrangements,
    },
    clients: clientSummaries,
    compositeBrief,
    instructions: [
      "Run ONE shared discovery crawl covering the union above — not a separate crawl per client.",
      "Prefer TrueUp; LinkedIn jobs only without Tim Yeo’s LinkedIn login.",
      "After the crawl, POST the JSON payload to /api/job-search/ingest with Authorization: Bearer <JOB_SEARCH_INGEST_TOKEN>.",
      "Do not Allocate to Notion; the coach reviews matches in Web Job Search.",
    ],
  };
}
