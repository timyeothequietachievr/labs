import { JobSearchShell } from "@/components/job-search/AppShell";
import { ImportForm } from "@/components/job-search/ImportForm";
import {
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";

export default async function ImportPage() {
  const session = await requireCoachPage();

  return (
    <JobSearchShell email={session.email}>
      <JsContainer className="max-w-2xl">
        <JsEyebrow>Manual capture</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          Import a role
        </h1>
        <p className="mt-2 font-reading text-sm text-warm-700">
          Paste a JD you found yourself. It is scored against every active
          client and stored in the shared catalogue.
        </p>
        <JsCard className="mt-6">
          <ImportForm />
        </JsCard>
      </JsContainer>
    </JobSearchShell>
  );
}
