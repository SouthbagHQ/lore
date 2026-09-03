import Link from 'next/link';

const entries = [
  {
    title: 'Kevin',
    href: '/docs/Kevin',
    blurb: 'The CEO.',
  },
  {
    title: 'The Pile',
    href: '/docs/the-pile',
    blurb: 'Maintained by Kevin. Purpose unclear.',
  },
  {
    title: 'Floor 3',
    href: '/docs/floor-3',
    blurb: 'Southbag has no Floor 3.',
  },
  {
    title: 'Canberra',
    href: '/docs/canberra',
    blurb: "Kevin's position on Canberra.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden border-b border-[var(--sb-border)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(26,66,128,0.28), transparent 55%), linear-gradient(180deg, rgba(8,9,13,0.2), transparent 40%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 23px, #e6eaf0 23px, #e6eaf0 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, #e6eaf0 23px, #e6eaf0 24px)',
          }}
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col px-6 py-24 sm:py-32">
          <p className="mb-6 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--sb-accent-text)]">
            Southbag Lore
          </p>
          <h1 className="mb-5 font-[family-name:var(--font-display)] text-4xl font-light leading-[1.1] tracking-[-0.02em] text-[var(--sb-heading)] sm:text-5xl">
            Southbag Lore
          </h1>
          <p className="mb-10 max-w-xl text-base leading-relaxed text-[var(--sb-text-dim)] sm:text-[15px]">
            Documentation of people, places, objects, and incidents associated
            with the institution.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center border border-[var(--sb-accent-border)] bg-[var(--sb-accent-bg)] px-5 py-2.5 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.16em] text-[#c0d4f0] transition-colors hover:border-[var(--sb-accent-text)] hover:bg-[#1f4d96]"
            >
              View documentation
            </Link>
            <Link
              href="/docs/Kevin"
              className="inline-flex items-center font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--sb-text-dim)] underline decoration-[var(--sb-border)] underline-offset-4 transition-colors hover:text-[var(--sb-heading)] hover:decoration-[var(--sb-accent-text)]"
            >
              Kevin
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-6 py-16">
        <p className="mb-8 font-[family-name:var(--font-mono)] text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--sb-text-dimmer)]">
          Entries
        </p>
        <ul className="divide-y divide-[var(--sb-border)] border-y border-[var(--sb-border)]">
          {entries.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="group flex flex-col gap-1 py-5 transition-colors sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
              >
                <span className="font-[family-name:var(--font-display)] text-xl text-[var(--sb-heading)] group-hover:text-[var(--sb-accent-text)] sm:text-2xl">
                  {entry.title}
                </span>
                <span className="max-w-md text-sm text-[var(--sb-text-dim)] sm:text-right">
                  {entry.blurb}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-[var(--sb-text-dimmer)]">
          Additional entries are available under{' '}
          <Link
            href="/docs"
            className="text-[var(--sb-accent-text)] underline underline-offset-2 hover:text-[#c0d4f0]"
          >
            /docs
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
