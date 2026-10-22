import { redirect } from "next/navigation";
import { JobSearchShell } from "@/components/job-search/AppShell";
import {
  Field,
  JsButton,
  JsCard,
  JsContainer,
  JsEyebrow,
  inputClass,
} from "@/components/job-search/ui";
import { getSession } from "@/lib/job-search/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/job-search");
  const params = await searchParams;

  return (
    <JobSearchShell>
      <JsContainer className="max-w-md">
        <JsCard className="labs-enter">
          <JsEyebrow>Coach access</JsEyebrow>
          <h1 className="display-headline mt-3 text-3xl text-charcoal">
            Sign in
          </h1>
          <p className="mt-3 font-reading text-sm leading-relaxed text-warm-700">
            Coach-only for v1. Use the email and password from your environment
            config.
          </p>
          {params.error ? (
            <p className="mt-4 border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep">
              {params.error === "invalid"
                ? "Invalid email or password."
                : "Something went wrong. Try again."}
            </p>
          ) : null}
          <form
            action="/api/job-search/login"
            method="post"
            className="mt-6 space-y-4"
          >
            <Field label="Email">
              <input
                className={inputClass}
                type="email"
                name="email"
                required
                autoComplete="username"
                defaultValue="tim@thequietachievr.com"
              />
            </Field>
            <Field label="Password">
              <input
                className={inputClass}
                type="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </Field>
            <JsButton type="submit" className="w-full">
              Sign in
            </JsButton>
          </form>
        </JsCard>
      </JsContainer>
    </JobSearchShell>
  );
}
