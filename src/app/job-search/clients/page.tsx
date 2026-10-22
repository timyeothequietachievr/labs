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

export default async function ClientsPage() {
  const session = await requireCoachPage();
  const clients = await listClients();

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

        <ul className="mt-8 space-y-3">
          {clients.length === 0 ? (
            <JsCard>
              <p className="font-reading text-sm text-warm-700">
                No clients yet. Start with Alan Ong (or any active coaching
                client) and link their Notion Opportunities collection id.
              </p>
            </JsCard>
          ) : (
            clients.map((client) => (
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
                          {client.preferences.targetTitles.slice(0, 4).join(" · ") ||
                            "No target titles yet"}
                        </p>
                        <p className="mt-1 text-xs text-warm-500">
                          {[...client.preferences.countries, ...client.preferences.locations]
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
