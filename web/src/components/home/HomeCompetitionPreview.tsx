import Link from "next/link";
import { SectionHeading } from "@/components/home/HomeSections";
import { featuredCompetition } from "@/lib/competition-config";

export function HomeCompetitionPreview() {
  return (
    <section className="py-12" aria-labelledby="competitions-preview-heading">
      <SectionHeading
        id="competitions-preview-heading"
        title="GCR research competitions"
        subtitle="Where curiosity becomes research—and research creates impact"
      />
      <p className="text-[15px] leading-relaxed text-[var(--journal-body)]">
        Competitions encourage intellectual curiosity, evidence-based thinking, and meaningful
        engagement with contemporary global challenges. Eligibility includes high-school students,
        undergraduates, postgraduates, independent scholars, and interdisciplinary teams where
        enabled.
      </p>
      <div className="mt-8 rounded-lg border border-[var(--journal-border)] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-muted)]">
          Featured competition
        </p>
        <h3 className="mt-2 font-serif text-lg font-semibold text-[var(--journal-heading)]">
          {featuredCompetition.name}
        </h3>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          <strong>Theme:</strong> {featuredCompetition.theme}
        </p>
        <p className="mt-1 text-sm text-[var(--journal-body)]">
          <strong>Categories:</strong> {featuredCompetition.categories.join(", ")}
        </p>
        <p className="mt-1 text-sm text-[var(--journal-muted)]">{featuredCompetition.status}</p>
        <p className="mt-4 inline-flex rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-2 text-sm font-medium text-[var(--journal-heading)]">
          Coming Soon
        </p>
        <p className="mt-3">
          <Link
            href="/research-competitions"
            className="text-sm text-[var(--journal-accent)] hover:underline"
          >
            Competition overview
          </Link>
        </p>
      </div>
    </section>
  );
}
