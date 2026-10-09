import { projects } from "@/lib/projects";

function Star() {
  return (
    <span aria-hidden className="inline-block text-[10px] leading-none text-warm-500">
      ✦
    </span>
  );
}

export function LabsLanding() {
  return (
    <div className="labs-shell">
      <main className="mx-auto flex w-full max-w-[40rem] flex-col px-6 py-16 sm:py-24">
        <header className="labs-enter border border-paper-200 bg-paper-soft/60 px-6 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Star />
            <Star />
            <Star />
          </div>
          <p className="eyebrow text-warm-500">Est. 2025</p>
          <h1 className="display-headline mt-4 text-[2.35rem] text-charcoal sm:text-[2.85rem]">
            Quiet Achiever Labs
          </h1>
          <p className="mt-4 font-display text-lg italic leading-relaxed text-ink sm:text-xl">
            AI tools &amp; everyday utilities, vibe-coded with care.
          </p>
        </header>

        <div className="labs-enter-delay my-12 flex items-center gap-4">
          <div className="h-px flex-1 bg-paper-200" />
          <p className="eyebrow shrink-0 text-warm-500">Things I&apos;ve made</p>
          <div className="h-px flex-1 bg-paper-200" />
        </div>

        <section aria-label="Projects" className="labs-enter-delay">
          <ul className="m-0 list-none p-0">
            {projects.map((project) => {
              const isDownload = Boolean(project.href?.endsWith(".zip"));
              const content = (
                <>
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-display text-xl text-charcoal sm:text-[1.35rem]">
                      {project.name}
                    </h2>
                    <span className="shrink-0 text-[11px] font-semibold tracking-wider2 text-warm-500 uppercase">
                      {project.platform}
                    </span>
                  </div>
                  <p className="mt-2 font-display text-[0.98rem] leading-relaxed text-warm-700">
                    {project.description}
                  </p>
                  {project.href ? (
                    <p className="labs-link mt-3 text-sm text-charcoal">
                      {project.hrefLabel ?? project.href} →
                    </p>
                  ) : (
                    <p className="mt-3 text-sm text-warm-500">Local install</p>
                  )}
                </>
              );

              return (
                <li key={project.name} className="border-t border-paper-200">
                  {project.href ? (
                    <a
                      href={project.href}
                      {...(isDownload
                        ? { download: true }
                        : { target: "_blank", rel: "noopener noreferrer" })}
                      className="labs-project block px-1 py-7 no-underline sm:px-2"
                    >
                      {content}
                    </a>
                  ) : (
                    <div className="labs-project px-1 py-7 sm:px-2">{content}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="border-t border-paper-200" />
        </section>

        <footer className="labs-enter-delay mt-14 flex flex-col items-center gap-2 text-center text-sm text-warm-500">
          <p>
            <a
              href="https://www.thequietachievr.com"
              className="text-warm-700 underline decoration-paper-200 underline-offset-4 transition-colors hover:text-ember hover:decoration-ember"
            >
              The Quiet Achiever
            </a>
          </p>
          <p>Sydney · labs.thequietachievr.com</p>
        </footer>
      </main>
    </div>
  );
}
