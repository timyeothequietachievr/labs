/**
 * Seed active coaching clients into Web Job Search local store.
 * Usage: node scripts/seed-clients.mjs
 */
import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), ".data", "job-search.json");

const defaultPrefs = {
  targetTitles: [
    "Staff Product Designer",
    "Principal Product Designer",
    "Head of Design",
    "Design Director",
    "Director of Product Design",
  ],
  excludedTitles: [],
  countries: ["Australia", "Singapore", "United Kingdom", "United States"],
  locations: [
    "Sydney",
    "Melbourne",
    "Singapore",
    "London",
    "New York",
    "Los Angeles",
    "Austin",
  ],
  arrangements: ["remote", "hybrid", "onsite"],
  salaryMin: null,
  salaryMax: null,
  salaryCurrency: "AUD",
  remoteCountriesAllowed: [
    "Australia",
    "Singapore",
    "United Kingdom",
    "United States",
  ],
  industries: ["product", "design", "fintech", "technology"],
  excludedCompanies: [],
  seniorityNotes: "Staff / Principal / design leadership.",
  otherHardConstraints: "",
};

/** @type {Array<Record<string, unknown>>} */
const CLIENTS = [
  {
    name: "Alan Ong",
    notionCoachingPlanUrl:
      "https://app.notion.com/p/8efa98ca2ad048f09d45dbccdb85e5dc",
    notionAiClientBriefUrl:
      "https://app.notion.com/p/40141716da2881ac82c4e739e8930fe1",
    aiClientBrief:
      "Head of Design, Design Director, Director of Product Design, Principal/Staff Product Designer. AU Sydney Melbourne, Singapore, UK, US. Remote/hybrid/onsite. Current ~155k+super AUD; target ~200k+super; soft floor ~180k. Family flexibility for two kids. Prefer pay+autonomy+flexibility. Deprioritise bands clearly below current. Portfolio alanong.me.",
    notionOpportunitiesDatabaseId: "bec99289139d450d93cd080d61b47982",
    notionOpportunitiesCollectionId: "7b9a7786-d889-44d0-9781-35737ccffddd",
    portfolioUrl: "https://alanong.me/",
    currentSalaryNote: "155k+super",
    targetSalaryNote: "200k+super",
    cvSummary:
      "Product design leader. Portfolio alanong.me. Target Staff/Principal/Head of Design.",
    preferences: {
      ...defaultPrefs,
      targetTitles: [
        "Head of Design",
        "Design Director",
        "Director of Product Design",
        "Principal Product Designer",
        "Staff Product Designer",
      ],
      salaryMin: 180000,
      salaryMax: 250000,
    },
  },
  {
    name: "Becher Ku",
    notionCoachingPlanUrl:
      "https://app.notion.com/p/0acf99135cf64048a969f593aceffcb0",
    notionAiClientBriefUrl:
      "https://app.notion.com/p/40141716da2881ae9cf3c8e75f8e06d4",
    aiClientBrief:
      "Primary Design Manager; secondary Principal/Staff Product Designer, Head of Design. Only Singapore and Japan (Japan relocation OK). No China or Hong Kong. Current SGD ~136k+20k bonus; target SGD 160k–200k base / ~15k monthly. Only roles he would genuinely accept.",
    notionOpportunitiesDatabaseId: "6b9a821abccb4baabecf8007fc72490a",
    notionOpportunitiesCollectionId: "1aec232d-7e9c-4f20-becb-2f6c97438447",
    portfolioUrl: "https://becherku.com/",
    currentSalaryNote: "136k + 20k bonus",
    targetSalaryNote: "~15k monthly target",
    cvSummary:
      "Design leadership / career ops. Primary: Design Manager. Secondary: Principal/Staff IC. Markets: Singapore and Japan (relocation).",
    preferences: {
      ...defaultPrefs,
      targetTitles: [
        "Design Manager",
        "Head of Design",
        "Principal Product Designer",
        "Staff Product Designer",
        "Design Director",
      ],
      countries: ["Singapore", "Japan", "Australia"],
      locations: ["Singapore", "Tokyo", "Osaka", "Sydney"],
      remoteCountriesAllowed: ["Singapore", "Japan", "Australia"],
      seniorityNotes:
        "Design Manager primary; Principal/Staff IC secondary. Open to SG/JP relocation.",
    },
  },
  {
    name: "John Balboa",
    notionCoachingPlanUrl:
      "https://app.notion.com/p/f3033209e0b1451488b804eee0cbab5c",
    notionAiClientBriefUrl:
      "https://app.notion.com/p/40141716da2881a998d6c9e312a2ac10",
    aiClientBrief:
      "Fully remote Principal/Staff Product Designer or remote Design Engineer. Stay Las Vegas — remote non-negotiable for accept. Target $200k+. Fintech/payments (Stripe Checkout/Link, Affirm, Linktree-class). Interviews requiring relocation OK as practice only. Oct–Nov 2026 hiring window.",
    notionOpportunitiesDatabaseId: "90bd09edefdd4e919d9ddfc2a6f60f42",
    notionOpportunitiesCollectionId: "bb5b8aab-b8ab-4eb7-a4d6-38b521c18042",
    portfolioUrl: "",
    currentSalaryNote: "",
    targetSalaryNote: "$200k+",
    cvSummary:
      "Product design. Tracking Staff/Principal roles (e.g. Stripe Link, Affirm, Linktree-type).",
    preferences: {
      ...defaultPrefs,
      targetTitles: [
        "Principal Product Designer",
        "Staff Product Designer",
        "Design Engineer",
      ],
      countries: ["United States"],
      locations: ["Las Vegas", "Remote", "United States"],
      arrangements: ["remote"],
      remoteCountriesAllowed: ["United States"],
      salaryMin: 180000,
      salaryCurrency: "USD",
      seniorityNotes: "Fully remote Staff/Principal; Design Engineer OK.",
    },
  },
  {
    name: "Christian Lafrance",
    notionCoachingPlanUrl:
      "https://app.notion.com/p/23f246dd27714e1f9a5361f6b48fa240",
    notionAiClientBriefUrl:
      "https://app.notion.com/p/40141716da2881de8c16f566237cd21a",
    aiClientBrief:
      "Bay Area focus (SF / Santa Clara). Target Staff/Principal/Lead Product Designer or HoD/FD. Hybrid/onsite Bay Area in-range; remote US if seniority fits. Unlock application top-of-funnel. AI design systems proficiency is a plus.",
    notionOpportunitiesDatabaseId: "5f8911cf793f409d9aefd99a27b044f0",
    notionOpportunitiesCollectionId: "33d87b0e-54c0-4bf6-a5f7-c1bf60c63657",
    portfolioUrl: "",
    currentSalaryNote: "",
    targetSalaryNote: "",
    cvSummary:
      "Quiet Achiever coaching client — Bay Area Staff/Principal/HoD design track.",
    preferences: {
      ...defaultPrefs,
      targetTitles: [
        "Staff Product Designer",
        "Principal Product Designer",
        "Lead Product Designer",
        "Head of Design",
      ],
      countries: ["United States"],
      locations: [
        "San Francisco",
        "Bay Area",
        "Santa Clara",
        "San Jose",
        "Oakland",
      ],
      remoteCountriesAllowed: ["United States"],
      seniorityNotes: "Bay Area IC/FD or HoD; Staff/Principal/Lead.",
    },
  },
];

async function main() {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  let store = { version: 1, clients: [], jobs: [], matches: [], runs: [] };
  try {
    store = JSON.parse(await fs.readFile(DATA_PATH, "utf8"));
  } catch {
    // new
  }
  store.clients = store.clients || [];
  const ts = new Date().toISOString();
  let added = 0;
  let updated = 0;

  for (const spec of CLIENTS) {
    const idx = store.clients.findIndex((c) => c.name === spec.name);
    if (idx >= 0) {
      store.clients[idx] = {
        ...store.clients[idx],
        ...spec,
        preferences: {
          ...store.clients[idx].preferences,
          ...spec.preferences,
        },
        updatedAt: ts,
      };
      updated += 1;
      console.log("updated", spec.name);
    } else {
      store.clients.push({
        id: randomUUID(),
        status: "active",
        ...spec,
        createdAt: ts,
        updatedAt: ts,
      });
      added += 1;
      console.log("added", spec.name);
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2));
  console.log(`Done. added=${added} updated=${updated} total=${store.clients.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
