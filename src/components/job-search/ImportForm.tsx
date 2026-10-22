"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, JsButton, JsCard, inputClass, textareaClass } from "./ui";

type MatchRow = {
  id: string;
  clientName: string;
  recommendation: string;
  confidence: number;
  rationale: string;
};

export function ImportForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [matches, setMatches] = useState<MatchRow[] | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMatches(null);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/job-search/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Import failed");
      return;
    }
    setJobId(data.job.id);
    setMatches(data.matches);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {error ? (
          <p className="border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep">
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Employer">
            <input className={inputClass} name="employer" required />
          </Field>
          <Field label="Title">
            <input className={inputClass} name="title" required />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location">
            <input className={inputClass} name="location" />
          </Field>
          <Field label="Arrangement">
            <select className={inputClass} name="arrangement" defaultValue="unknown">
              <option value="unknown">Unknown</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </Field>
        </div>
        <Field label="Canonical / application URL">
          <input className={inputClass} name="canonicalUrl" />
        </Field>
        <Field label="Advertised compensation">
          <input className={inputClass} name="advertisedCompensation" />
        </Field>
        <Field label="Full job description" hint="Paste the JD text">
          <textarea className={textareaClass} name="jdText" required rows={12} />
        </Field>
        <JsButton type="submit" disabled={saving}>
          {saving ? "Scoring all clients…" : "Import & score"}
        </JsButton>
      </form>

      {matches ? (
        <JsCard>
          <h2 className="font-display text-xl text-charcoal">
            Scored against {matches.length} clients
          </h2>
          {jobId ? (
            <p className="mt-1 text-sm">
              <a
                href={`/job-search/jobs/${jobId}`}
                className="font-semibold text-ember"
              >
                Open job record →
              </a>
            </p>
          ) : null}
          <ul className="mt-4 space-y-3">
            {matches.map((m) => (
              <li
                key={m.id}
                className="border-t border-paper-200 pt-3 first:border-0 first:pt-0"
              >
                <p className="text-sm font-semibold text-charcoal">
                  {m.clientName}{" "}
                  <span className="font-normal text-warm-500">
                    · {m.recommendation.replace("_", " ")} ·{" "}
                    {Math.round(m.confidence * 100)}%
                  </span>
                </p>
                <p className="mt-1 font-reading text-sm text-warm-700">
                  {m.rationale}
                </p>
              </li>
            ))}
          </ul>
        </JsCard>
      ) : null}
    </div>
  );
}
