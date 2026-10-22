"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, JsButton, textareaClass } from "./ui";

const SAMPLE = `{
  "notes": "Manual paste from Job Discovery Bot",
  "triggeredBy": "manual",
  "jobs": [
    {
      "title": "Staff Product Designer",
      "company": "Example Co",
      "location": "Sydney, Australia",
      "arrangement": "hybrid",
      "url": "https://example.com/jobs/123",
      "snippet_or_jd": "Full JD text here…",
      "source": "trueup",
      "posted_at": "2026-10-22"
    }
  ]
}`;

export function DiscoveryPasteForm() {
  const router = useRouter();
  const [jsonText, setJsonText] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setResult("");
    let payload: unknown;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      setBusy(false);
      setError("JSON is invalid — paste a jobs array or { jobs: [...] } object.");
      return;
    }

    const res = await fetch("/api/job-search/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Ingest failed");
      return;
    }
    setResult(
      `Ingested ${data.jobsDiscovered} job(s) · ${data.jobsNew} new · ${data.matchesCreated} matches created` +
        (data.skipped?.length ? ` · skipped ${data.skipped.length}` : ""),
    );
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Discovery JSON"
        hint="Paste Job Discovery Bot output here (array or { jobs: [...] })."
      >
        <textarea
          className={`${textareaClass} min-h-[220px] font-mono text-xs`}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
      </Field>
      {error ? (
        <p className="border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep">
          {error}
        </p>
      ) : null}
      {result ? <p className="text-sm text-charcoal">{result}</p> : null}
      <JsButton type="submit" disabled={busy}>
        {busy ? "Ingesting…" : "Run ingest now"}
      </JsButton>
    </form>
  );
}
