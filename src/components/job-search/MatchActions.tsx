"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, textareaClass } from "./ui";

export function MatchActions({
  matchId,
  initialNotes,
  decision,
  notionPageId,
}: {
  matchId: string;
  initialNotes: string;
  decision: string;
  notionPageId?: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [notionUrl, setNotionUrl] = useState(
    notionPageId
      ? `https://www.notion.so/${notionPageId.replace(/-/g, "")}`
      : "",
  );
  const [busy, setBusy] = useState(false);

  async function act(nextDecision: string) {
    setBusy(true);
    setMessage("");
    setError("");
    const res = await fetch(`/api/job-search/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: nextDecision, coachNotes: notes }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Update failed");
      return;
    }
    if (data.notionPage?.url) {
      setNotionUrl(data.notionPage.url);
    }
    setMessage(
      nextDecision === "allocated"
        ? data.message || "Allocated — row written to Notion Opportunities."
        : `Marked ${nextDecision}.`,
    );
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-3 border-t border-paper-200 pt-4">
      <Field label="Coach notes (why this fits)">
        <textarea
          className={textareaClass}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => act("shortlisted")}
          className="inline-flex h-10 items-center rounded-[4px] border border-charcoal px-4 text-sm font-semibold disabled:opacity-50"
        >
          Shortlist
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => act("allocated")}
          className="inline-flex h-10 items-center rounded-[4px] bg-ember px-4 text-sm font-semibold text-paper disabled:opacity-50"
        >
          {busy ? "Writing…" : "Allocate to Notion"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => act("applied")}
          className="inline-flex h-10 items-center rounded-[4px] bg-ink px-4 text-sm font-semibold text-paper disabled:opacity-50"
        >
          Applied
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => act("dismissed")}
          className="inline-flex h-10 items-center rounded-[4px] px-4 text-sm font-semibold text-warm-500 underline disabled:opacity-50"
        >
          Dismiss
        </button>
      </div>
      <p className="text-xs text-warm-500">Current decision: {decision}</p>
      {message ? <p className="text-sm text-charcoal">{message}</p> : null}
      {error ? (
        <p className="border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep whitespace-pre-wrap">
          {error}
        </p>
      ) : null}
      {notionUrl ? (
        <p className="text-sm">
          <a
            href={notionUrl}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ember"
          >
            Open Notion opportunity →
          </a>
        </p>
      ) : null}
    </div>
  );
}
