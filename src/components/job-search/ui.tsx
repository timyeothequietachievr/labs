import Link from "next/link";
import type { ReactNode } from "react";

export function JsContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1100px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function JsEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow text-warm-500">{children}</p>
  );
}

export function JsButton({
  children,
  href,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "ghost" | "ink";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-ember text-paper hover:bg-ember-deep disabled:opacity-50",
    secondary:
      "border border-charcoal bg-transparent text-charcoal hover:bg-paper-soft",
    ghost: "bg-transparent text-charcoal underline-offset-4 hover:underline",
    ink: "bg-ink text-paper hover:bg-ink-deep",
  };
  const cls = `inline-flex h-11 items-center justify-center rounded-[4px] px-5 text-[15px] font-semibold transition-colors ${styles[variant]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function JsCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`border border-paper-200 bg-paper-soft/70 p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function JsBadge({
  children,
  tone = "warm",
}: {
  children: ReactNode;
  tone?: "warm" | "ember" | "ink" | "sunrise";
}) {
  const tones = {
    warm: "bg-paper text-warm-700 border-paper-200",
    ember: "bg-ember-100 text-ember-deep border-ember-200",
    ink: "bg-ink/10 text-ink border-ink-300/40",
    sunrise: "bg-sunrise-soft/40 text-charcoal border-sunrise/40",
  };
  return (
    <span
      className={`inline-flex items-center rounded-[4px] border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold tracking-wider2 text-warm-500 uppercase">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-warm-500">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[4px] border border-paper-200 bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:border-ember";

export const textareaClass = `${inputClass} min-h-[110px] resize-y font-reading`;
