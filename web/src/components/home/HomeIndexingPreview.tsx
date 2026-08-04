import Link from "next/link";
import { FeatureCard, SectionHeading } from "@/components/home/HomeSections";
import { getIndexingServicesForPublic } from "@/lib/indexing-services";

export function HomeIndexingPreview() {
  const services = getIndexingServicesForPublic();

  return (
    <section className="py-12" aria-labelledby="indexing-preview-heading">
      <SectionHeading id="indexing-preview-heading" title="Abstracting and indexing" />
      <p className="mb-8 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Global Confluence Review is committed to increasing the visibility, accessibility, and
        scholarly discoverability of the research it publishes.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <FeatureCard key={s.id} title={s.name}>
            <>
              <span className="font-medium text-[var(--journal-heading)]">{s.status}</span>
              {s.notes ? `. ${s.notes}` : null}
            </>
          </FeatureCard>
        ))}
      </div>
      <p className="mt-8">
        <Link
          href="/about/abstracting-and-indexing"
          className="inline-flex rounded border border-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-[var(--journal-accent)] hover:bg-[var(--journal-accent)]/5"
        >
          View abstracting and indexing information
        </Link>
      </p>
    </section>
  );
}
