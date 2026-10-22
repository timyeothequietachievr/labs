import { notFound } from "next/navigation";
import { JobSearchShell } from "@/components/job-search/AppShell";
import { ClientForm } from "@/components/job-search/ClientForm";
import {
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";
import { getClient } from "@/lib/job-search/store";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireCoachPage();
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <JobSearchShell email={session.email}>
      <JsContainer className="max-w-2xl">
        <JsEyebrow>Client</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          {client.name}
        </h1>
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {client.notionCoachingPlanUrl ? (
            <a
              href={client.notionCoachingPlanUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ember"
            >
              Open coaching plan →
            </a>
          ) : null}
          {client.notionAiClientBriefUrl ? (
            <a
              href={client.notionAiClientBriefUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-ember"
            >
              AI Client Brief →
            </a>
          ) : null}
        </p>
        <JsCard className="mt-6">
          <ClientForm client={client} />
        </JsCard>
      </JsContainer>
    </JobSearchShell>
  );
}
