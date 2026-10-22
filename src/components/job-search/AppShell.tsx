import Link from "next/link";
import type { ReactNode } from "react";
import { JsContainer } from "./ui";

const nav = [
  { href: "/job-search", label: "Dashboard" },
  { href: "/job-search/clients", label: "Clients" },
  { href: "/job-search/jobs", label: "Jobs" },
  { href: "/job-search/import", label: "Import" },
  { href: "/job-search/icp", label: "ICP" },
  { href: "/job-search/runs", label: "Runs" },
];

export function JobSearchShell({
  children,
  email,
}: {
  children: ReactNode;
  email?: string;
}) {
  return (
    <div className="labs-shell min-h-screen">
      <header className="border-b border-paper-200/80 bg-paper-soft/50 backdrop-blur-sm">
        <JsContainer className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow text-warm-500">Quiet Achiever · Labs</p>
            <Link
              href="/job-search"
              className="font-display text-2xl text-charcoal no-underline"
            >
              Web Job Search
            </Link>
          </div>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[4px] px-3 py-2 text-sm font-semibold text-warm-700 no-underline transition-colors hover:bg-white/70 hover:text-ember"
              >
                {item.label}
              </Link>
            ))}
            {email ? (
              <form action="/api/job-search/logout" method="post" className="ml-1">
                <button
                  type="submit"
                  className="rounded-[4px] px-3 py-2 text-sm font-semibold text-warm-500 hover:text-ember"
                >
                  Sign out
                </button>
              </form>
            ) : null}
          </nav>
        </JsContainer>
      </header>
      <main className="py-8 sm:py-10">{children}</main>
    </div>
  );
}
