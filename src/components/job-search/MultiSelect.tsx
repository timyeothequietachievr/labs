"use client";

import { useMemo, useState } from "react";
import { inputClass } from "./ui";

type Props = {
  name: string;
  options: string[];
  defaultSelected?: string[];
  placeholder?: string;
};

/**
 * Multi-select with chips. Selected values are submitted as a comma-separated
 * hidden field (same shape the clients API already parses).
 */
export function MultiSelect({
  name,
  options,
  defaultSelected = [],
  placeholder = "Select…",
}: Props) {
  const [selected, setSelected] = useState<string[]>(() => [
    ...new Set(defaultSelected.filter(Boolean)),
  ]);
  const [custom, setCustom] = useState("");

  const available = useMemo(
    () => options.filter((o) => !selected.includes(o)),
    [options, selected],
  );

  function add(value: string) {
    const v = value.trim();
    if (!v || selected.includes(v)) return;
    setSelected((prev) => [...prev, v]);
  }

  function remove(value: string) {
    setSelected((prev) => prev.filter((x) => x !== value));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={selected.join(", ")} />
      <div className="flex flex-wrap gap-1.5 min-h-[2rem]">
        {selected.length === 0 ? (
          <span className="text-xs text-warm-500">{placeholder}</span>
        ) : (
          selected.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => remove(v)}
              className="inline-flex items-center gap-1 rounded-full border border-warm-200 bg-warm-50 px-2.5 py-0.5 text-xs font-medium text-charcoal hover:border-ember-200 hover:bg-ember-50"
            >
              {v}
              <span aria-hidden className="text-warm-500">
                ×
              </span>
            </button>
          ))
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <select
          className={inputClass}
          value=""
          onChange={(e) => {
            if (e.target.value) add(e.target.value);
          }}
        >
          <option value="">Add from list…</option>
          {available.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder="Or type custom + Enter"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(custom);
              setCustom("");
            }
          }}
        />
      </div>
    </div>
  );
}
