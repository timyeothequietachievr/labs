"use client";

import { useState } from "react";
import { Field, JsButton, textareaClass } from "./ui";

const SAMPLE = `{
  "notes": "ICP Bot run",
  "prospects": [
    {
      "rank": 1,
      "name": "Example Person",
      "linkedin_url": "https://www.linkedin.com/in/example",
      "headline": "Staff Product Designer",
      "location": "Sydney, Australia",
      "company": "Example Co",
      "title": "Staff Product Designer",
      "degree": "2nd",
      "mutual_connections": ["Mutual A"],
      "buyer_states": ["A"],
      "icp_score": 82,
      "connection_likelihood": 70,
      "total_score": 78,
      "why_fit": "Senior IC design, Staff-track signals",
      "why_likely_to_connect": "2 mutuals in design circle",
      "suggested_opener": "Short draft opener…"
    }
  ]
}`;

export function IcpPasteForm() {
  const [jsonText, setJsonText] = useState(SAMPLE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

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
      setError("Invalid JSON — paste ICP Bot output ({ prospects: [...] }).");
      return;
    }

    const res = await fetch("/api/job-search/icp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Write to Notion failed");
      return;
    }
    const errNote = data.errors?.length
      ? ` · ${data.errors.length} issue(s)`
      : "";
    setResult(
      `Wrote ${data.written} prospect(s) to Notion Prospects${errNote}.`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="ICP Bot JSON"
        hint="Paste ranked prospects. Rows land in AI Agency → Prospects."
      >
        <textarea
          className={`${textareaClass} min-h-[260px] font-mono text-xs`}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
        />
      </Field>
      {error ? (
        <p className="border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep whitespace-pre-wrap">
          {error}
        </p>
      ) : null}
      {result ? (
        <p className="text-sm text-charcoal">
          {result}{" "}
          <a
            href="https://app.notion.com/p/40141716da288058a328fd115350eddd"
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ember"
          >
            Open Prospects →
          </a>
        </p>
      ) : null}
      <JsButton type="submit" disabled={busy}>
        {busy ? "Writing to Notion…" : "Write prospects to Notion"}
      </JsButton>
    </form>
  );
}
