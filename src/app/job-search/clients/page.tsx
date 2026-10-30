import Link from "next/link";
import { JobSearchShell } from "@/components/job-search/AppShell";
import {
  JsBadge,
  JsButton,
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";
import { listClients } from "@/lib/job-search/store";

type StatusFilter = "all" | "active" | "paused";

const SEGMENTS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
];

function parseFilter(raw: string | string[] | undefined): StatusFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "active" || value === "paused" || value === "all") return value;
  return "all";
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const session = await requireCoachPage();
  const params = await searchParams;
  const filter = parseFilter(params.status);
  const clients = await listClients();
  const filtered =
    filter === "all"
      ? clients
      : clients.filter((c) => c.status === filter);

  const counts = {
    all: clients.length,
    active: clients.filter((c) => c.status === "active").length,
    paused: clients.filter((c) => c.status === "paused").length,
  };

  return (
    <JobSearchShell email={session.email}>
      <JsContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <JsEyebrow>Roster</JsEyebrow>
            <h1 className="display-headline mt-2 text-4xl text-charcoal">
              Clients
            </h1>
            <p className="mt-2 font-reading text-sm text-warm-700">
              Preferences drive hard filters and scoring for every new job.
            </p>
          </div>
          <JsButton href="/job-search/clients/new">Add client</JsButton>
        </div>

        <div
          className="mt-6 inline-flex rounded-[6px] border border-warm-200 bg-paper-soft/80 p-1"
          role="tablist"
          aria-label="Filter clients by status"
        >
          {SEGMENTS.map((seg) => {
            const selected = filter === seg.id;
            return (
              <Link
                key={seg.id}
                href={
                  seg.id === "all"
                    ? "/job-search/clients"
                    : `/job-search/clients?status=${seg.id}`
                }
                role="tab"
                aria-selected={selected}
                className={`rounded-[4px] px-3.5 py-1.5 text-sm font-semibold no-underline transition-colors ${
                  selected
                    ? "bg-charcoal text-paper"
                    : "text-warm-700 hover:text-charcoal"
                }`}
              >
                {seg.label}
                <span
                  className={`ml-1.5 text-xs font-medium ${
                    selected ? "text-paper/70" : "text-warm-500"
                  }`}
                >
                  {counts[seg.id]}
                </span>
              </Link>
            );
          })}
        </div>

        <ul className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                {filter === "all"
                  ? "No clients yet. Add an active coaching client and link their Notion Opportunities database."
                  : `No ${filter} clients.`}
              </p>
            </JsCard>
          ) : (
            filtered.map((client) => (
              <li key={client.id}>
                <Link
                  href={`/job-search/clients/${client.id}`}
                  className="block no-underline"
                >
                  <JsCard className="transition-colors hover:bg-white/70">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-display text-xl text-charcoal">
                            {client.name}
                          </h2>
                          <JsBadge
                            tone={
                              client.status === "active" ? "sunrise" : "warm"
                            }
                          >
                            {client.status}
                          </JsBadge>
                        </div>
                        <p className="mt-2 text-sm text-warm-700">
                          {client.preferences.targetTitles
                            .slice(0, 4)
                            .join(" · ") || "No target titles yet"}
                        </p>
                        <p className="mt-1 text-xs text-warm-500">
                          {[
                            ...client.preferences.countries,
                            ...client.preferences.locations,
                          ]
                            .slice(0, 6)
                            .join(" · ") || "Geos not set"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-ember">
                        Edit →
                      </span>
                    </div>
                  </JsCard>
                </Link>
              </li>
            ))
          )}
        </ul>
      </JsContainer>
    </JobSearchShell>
  );
}
