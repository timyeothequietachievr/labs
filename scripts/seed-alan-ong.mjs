/**
 * Seed Alan Ong as the first coaching client (from Notion coaching plan).
 * Usage: node scripts/seed-alan-ong.mjs
 */
import { createHash, randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), ".data", "job-search.json");

const empty = () => ({
  version: 1,
  clients: [],
  jobs: [],
  matches: [],
  runs: [],
});

const prefs = {
  targetTitles: [
    "Head of Design",
    "Design Director",
    "Director of Product Design",
    "Principal Product Designer",
    "Staff Product Designer",
  ],
  excludedTitles: [],
  countries: ["Australia", "Singapore", "United Kingdom", "United States"],
  locations: ["Sydney", "Melbourne", "Singapore", "London", "New York", "Los Angeles", "Austin"],
  arrangements: ["remote", "hybrid", "onsite"],
  salaryMin: 180000,
  salaryMax: 250000,
  salaryCurrency: "AUD",
  remoteCountriesAllowed: ["Australia", "Singapore", "United Kingdom", "United States"],
  industries: ["product", "design", "fintech", "technology"],
  excludedCompanies: [],
  seniorityNotes: "Senior / director-level product design leadership.",
  otherHardConstraints: "",
};

async function main() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  let store = empty();
  try {
    store = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  } catch {
    // new store
  }

  const existing = store.clients?.find((c) => c.name === "Alan Ong");
  if (existing) {
    console.log("Alan Ong already seeded:", existing.id);
    return;
  }

  const ts = new Date().toISOString();
  const client = {
    id: randomUUID(),
    name: "Alan Ong",
    status: "active",
    notionCoachingPlanUrl:
      "https://app.notion.com/p/Coaching-plan-Alan-Ong-8efa98ca2ad048f09d45dbccdb85e5dc",
    notionOpportunitiesDatabaseId: "bec99289139d450d93cd080d61b47982",
    notionOpportunitiesCollectionId: "7b9a7786-d889-44d0-9781-35737ccffddd",
    portfolioUrl: "https://alanong.me/",
    cvSummary:
      "Product design leader. Portfolio at alanong.me. Coaching package: 300k Career Accelerator. Target ~200k+super (current ~155k+super).",
    currentSalaryNote: "155k+super",
    targetSalaryNote: "200k+super",
    preferences: prefs,
    createdAt: ts,
    updatedAt: ts,
  };

  store.clients = [...(store.clients || []), client];
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
  console.log("Seeded Alan Ong", client.id);
  console.log("hash check", createHash("sha256").update("ok").digest("hex").slice(0, 8));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
