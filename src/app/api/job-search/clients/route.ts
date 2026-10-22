import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { listClients, upsertClient } from "@/lib/job-search/store";
import { ClientPreferencesSchema } from "@/lib/job-search/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const clients = await listClients();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const preferences = ClientPreferencesSchema.partial().parse(
    body.preferences ?? {},
  );

  const splitList = (value: unknown) =>
    String(value ?? "")
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const client = await upsertClient({
    id: body.id,
    name: String(body.name ?? "").trim(),
    status: body.status,
    notionCoachingPlanUrl: body.notionCoachingPlanUrl,
    notionAiClientBriefUrl: body.notionAiClientBriefUrl,
    aiClientBrief: body.aiClientBrief,
    notionOpportunitiesDatabaseId: body.notionOpportunitiesDatabaseId,
    notionOpportunitiesCollectionId: body.notionOpportunitiesCollectionId,
    portfolioUrl: body.portfolioUrl,
    cvSummary: body.cvSummary,
    currentSalaryNote: body.currentSalaryNote,
    targetSalaryNote: body.targetSalaryNote,
    preferences: {
      ...preferences,
      targetTitles: body.targetTitles
        ? splitList(body.targetTitles)
        : preferences.targetTitles,
      excludedTitles: body.excludedTitles
        ? splitList(body.excludedTitles)
        : preferences.excludedTitles,
      countries: body.countries
        ? splitList(body.countries)
        : preferences.countries,
      locations: body.locations
        ? splitList(body.locations)
        : preferences.locations,
      remoteCountriesAllowed: body.remoteCountriesAllowed
        ? splitList(body.remoteCountriesAllowed)
        : preferences.remoteCountriesAllowed,
      industries: body.industries
        ? splitList(body.industries)
        : preferences.industries,
      excludedCompanies: body.excludedCompanies
        ? splitList(body.excludedCompanies)
        : preferences.excludedCompanies,
      salaryMin:
        body.salaryMin === "" || body.salaryMin == null
          ? (preferences.salaryMin ?? null)
          : Number(body.salaryMin),
      salaryMax:
        body.salaryMax === "" || body.salaryMax == null
          ? (preferences.salaryMax ?? null)
          : Number(body.salaryMax),
      salaryCurrency: body.salaryCurrency
        ? String(body.salaryCurrency)
        : preferences.salaryCurrency,
      seniorityNotes:
        body.seniorityNotes != null
          ? String(body.seniorityNotes)
          : preferences.seniorityNotes,
      otherHardConstraints:
        body.otherHardConstraints != null
          ? String(body.otherHardConstraints)
          : preferences.otherHardConstraints,
    },
  });

  if (!client.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  return NextResponse.json({ client });
}
