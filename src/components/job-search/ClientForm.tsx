"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRY_OPTIONS, LOCATION_OPTIONS } from "@/lib/job-search/geo-options";
import type { Client } from "@/lib/job-search/types";
import { MultiSelect } from "./MultiSelect";
import { Field, JsButton, inputClass, textareaClass } from "./ui";

function joinList(values: string[]) {
  return values.join(", ");
}

export function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (client?.id) payload.id = client.id;

    const res = await fetch("/api/job-search/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    router.push(`/job-search/clients/${data.client.id}`);
    router.refresh();
  }

  const p = client?.preferences;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error ? (
        <p className="border border-ember-200 bg-ember-100 px-3 py-2 text-sm text-ember-deep">
          {error}
        </p>
      ) : null}

      <Field label="Name">
        <input
          className={inputClass}
          name="name"
          required
          defaultValue={client?.name}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <select
            className={inputClass}
            name="status"
            defaultValue={client?.status ?? "active"}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Portfolio URL">
          <input
            className={inputClass}
            name="portfolioUrl"
            defaultValue={client?.portfolioUrl}
          />
        </Field>
      </div>

      <Field
        label="Notion coaching plan URL"
        hint="e.g. Alan Ong coaching plan link"
      >
        <input
          className={inputClass}
          name="notionCoachingPlanUrl"
          defaultValue={client?.notionCoachingPlanUrl}
        />
      </Field>

      <Field
        label="AI Client Brief URL"
        hint="Notion page under the coaching plan — coach+AI matching memory"
      >
        <input
          className={inputClass}
          name="notionAiClientBriefUrl"
          defaultValue={client?.notionAiClientBriefUrl}
        />
      </Field>

      <Field
        label="AI Client Brief (snapshot)"
        hint="Paste matching filters from the Notion brief. Used when scoring roles."
      >
        <textarea
          className={`${textareaClass} min-h-[120px]`}
          name="aiClientBrief"
          defaultValue={client?.aiClientBrief}
        />
      </Field>

      <Field
        label="Notion Opportunities database id"
        hint="From the Opportunities DB URL (32-char id). Required for Allocate."
      >
        <input
          className={inputClass}
          name="notionOpportunitiesDatabaseId"
          defaultValue={client?.notionOpportunitiesDatabaseId}
          placeholder="bec99289139d450d93cd080d61b47982"
        />
      </Field>

      <Field
        label="Notion Opportunities collection id"
        hint="Optional collection:// id (MCP / advanced)"
      >
        <input
          className={inputClass}
          name="notionOpportunitiesCollectionId"
          defaultValue={client?.notionOpportunitiesCollectionId}
          placeholder="7b9a7786-d889-44d0-9781-35737ccffddd"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Current salary note">
          <input
            className={inputClass}
            name="currentSalaryNote"
            defaultValue={client?.currentSalaryNote}
          />
        </Field>
        <Field label="Target salary note">
          <input
            className={inputClass}
            name="targetSalaryNote"
            defaultValue={client?.targetSalaryNote}
          />
        </Field>
      </div>

      <Field label="CV / profile summary" hint="Paste key evidence for matching">
        <textarea
          className={textareaClass}
          name="cvSummary"
          defaultValue={client?.cvSummary}
        />
      </Field>

      <Field label="Target titles" hint="Comma or newline separated">
        <textarea
          className={textareaClass}
          name="targetTitles"
          defaultValue={joinList(p?.targetTitles ?? [])}
        />
      </Field>

      <Field label="Excluded titles">
        <textarea
          className={textareaClass}
          name="excludedTitles"
          defaultValue={joinList(p?.excludedTitles ?? [])}
        />
      </Field>

      <Field label="Countries" hint="Multi-select — click a chip to remove">
        <MultiSelect
          name="countries"
          options={COUNTRY_OPTIONS}
          defaultSelected={p?.countries ?? []}
          placeholder="Add countries…"
        />
      </Field>

      <Field label="Cities / locations">
        <MultiSelect
          name="locations"
          options={LOCATION_OPTIONS}
          defaultSelected={p?.locations ?? []}
          placeholder="Add cities or locations…"
        />
      </Field>

      <Field
        label="Remote countries allowed"
        hint="When a role is remote, which countries are acceptable"
      >
        <MultiSelect
          name="remoteCountriesAllowed"
          options={COUNTRY_OPTIONS}
          defaultSelected={p?.remoteCountriesAllowed ?? []}
          placeholder="Add remote-allowed countries…"
        />
      </Field>

      <Field label="Industries / domains">
        <textarea
          className={textareaClass}
          name="industries"
          defaultValue={joinList(p?.industries ?? [])}
        />
      </Field>

      <Field label="Excluded companies">
        <textarea
          className={textareaClass}
          name="excludedCompanies"
          defaultValue={joinList(p?.excludedCompanies ?? [])}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Salary min">
          <input
            className={inputClass}
            name="salaryMin"
            type="number"
            defaultValue={p?.salaryMin ?? ""}
          />
        </Field>
        <Field label="Salary max">
          <input
            className={inputClass}
            name="salaryMax"
            type="number"
            defaultValue={p?.salaryMax ?? ""}
          />
        </Field>
        <Field label="Currency">
          <input
            className={inputClass}
            name="salaryCurrency"
            defaultValue={p?.salaryCurrency ?? "AUD"}
          />
        </Field>
      </div>

      <Field label="Seniority notes">
        <textarea
          className={textareaClass}
          name="seniorityNotes"
          defaultValue={p?.seniorityNotes}
        />
      </Field>

      <Field label="Other hard constraints">
        <textarea
          className={textareaClass}
          name="otherHardConstraints"
          defaultValue={p?.otherHardConstraints}
        />
      </Field>

      <JsButton type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save client"}
      </JsButton>
    </form>
  );
}
