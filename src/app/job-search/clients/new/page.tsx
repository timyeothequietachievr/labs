import { JobSearchShell } from "@/components/job-search/AppShell";
import { ClientForm } from "@/components/job-search/ClientForm";
import {
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";

export default async function NewClientPage() {
  const session = await requireCoachPage();

  return (
    <JobSearchShell email={session.email}>
      <JsContainer className="max-w-2xl">
        <JsEyebrow>New</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          Add client
        </h1>
        <JsCard className="mt-6">
          <ClientForm />
        </JsCard>
      </JsContainer>
    </JobSearchShell>
  );
}
