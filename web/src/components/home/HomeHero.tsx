import Link from "next/link";
import { contentShell } from "@/lib/content-layout";
import { PAYMENT_DEADLINE_EXTENDED_MARQUEE } from "@/lib/conference-deadline";
import { Q2_AWARD_RESULTS_MARQUEE } from "@/data/conference-award-winners";
import { getIssnLabel } from "@/lib/journal-settings";
import { siteConfig } from "@/lib/site-config";

export function HomeHero() {
  return (
    <>
      <div className="overflow-hidden bg-[var(--journal-strip)] text-white">
        <div
          className="home-marquee flex w-max items-center whitespace-nowrap py-2 text-sm font-medium tracking-wide"
          style={{ animationDuration: "32s" }}
        >
          <Link href="/conferences/award-winners" className="shrink-0 px-8 hover:underline">
            {Q2_AWARD_RESULTS_MARQUEE}
          </Link>
          <span className="shrink-0 text-white/60" aria-hidden>
            •
          </span>
          <Link href="/conferences" className="shrink-0 px-8 hover:underline">
            Upcoming Conference — Quarter III (July–September) — Explore the GCR Quarterly
            Conference Series
          </Link>
          <span className="shrink-0 text-white/60" aria-hidden>
            •
          </span>
          <Link href="/conferences/payment" className="shrink-0 px-8 hover:underline">
            {PAYMENT_DEADLINE_EXTENDED_MARQUEE}
          </Link>
        </div>
      </div>
      <div className="border-b border-[var(--journal-border)] bg-gradient-to-b from-[var(--journal-hero-bg)] to-white">
        <div className={`${contentShell} py-12 text-center sm:py-14`}>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--journal-heading)] sm:text-4xl lg:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 text-sm font-medium uppercase tracking-wide text-[var(--journal-muted)] sm:text-base">
          International • Peer-reviewed • Open-access • Multidisciplinary journal
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--journal-body)]">
          Advancing interdisciplinary research and supporting scholars at every stage of their
          research journey.
        </p>
        <p className="mt-3 text-sm text-[var(--journal-muted)]">{getIssnLabel()}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/#current-issue"
            className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95"
          >
            Explore current issue
          </Link>
          <Link
            href="/for-authors/submit-manuscript"
            className="inline-flex rounded border border-[var(--journal-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
          >
            Submit your research
          </Link>
        </div>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
          <Link href="/for-authors/author-guidelines" className="text-[var(--journal-accent)] hover:underline">
            Author guidelines
          </Link>
          <span className="text-zinc-300" aria-hidden>
            |
          </span>
          <Link href="/conferences" className="text-[var(--journal-accent)] hover:underline">
            Conferences
          </Link>
          <span className="text-zinc-300" aria-hidden>
            |
          </span>
          <Link
            href="/research/young-researchers-hub"
            className="text-[var(--journal-accent)] hover:underline"
          >
            Young Researchers’ Hub
          </Link>
        </p>
        </div>
      </div>
    </>
  );
}
