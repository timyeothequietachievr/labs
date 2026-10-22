import { JobSearchShell } from "@/components/job-search/AppShell";
import { IcpPasteForm } from "@/components/job-search/IcpPasteForm";
import {
  JsCard,
  JsContainer,
  JsEyebrow,
} from "@/components/job-search/ui";
import { requireCoachPage } from "@/lib/job-search/guard";

export default async function IcpPage() {
  const session = await requireCoachPage();

  return (
    <JobSearchShell email={session.email}>
      <JsContainer className="max-w-2xl">
        <JsEyebrow>Client outreach</JsEyebrow>
        <h1 className="display-headline mt-2 text-4xl text-charcoal">
          ICP prospects
        </h1>
        <p className="mt-2 font-reading text-sm text-warm-700">
          Paste ranked output from <strong>ICP Bot</strong>. Rows are written to
          your Notion Prospects database (AI Agency). Research + rank only —
          connect requests stay manual.
        </p>
        <p className="mt-2 text-sm">
          <a
            href="https://app.notion.com/p/40141716da288058a328fd115350eddd"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ember"
          >
            Open Notion Prospects →
          </a>
        </p>
        <JsCard className="mt-6">
          <IcpPasteForm />
        </JsCard>
      </JsContainer>
    </JobSearchShell>
  );
}
