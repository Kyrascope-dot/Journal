import type { ReactNode } from "react";
import Link from "next/link";

const items = [
  { title: "Peer-reviewed", body: "Constructive academic assessment of submitted work." },
  { title: "Open access", body: "Scholarly articles available without subscription barriers." },
  { title: "Quarterly publication", body: "Regular issues supporting timely dissemination." },
  { title: "Multidisciplinary scope", body: "Social sciences, humanities, STEM, and interdisciplinary research." },
];

type Props = { issnLabel: string };

export function HomeTrustStrip({ issnLabel }: Props) {
  return (
    <section aria-labelledby="trust-strip-heading" className="border-b border-[var(--journal-border)] bg-white">
      <h2 id="trust-strip-heading" className="sr-only">
        Journal highlights
      </h2>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 lg:grid-cols-5 lg:px-6">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/40 p-4"
          >
            <p className="text-sm font-semibold text-[var(--journal-heading)]">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--journal-muted)]">{item.body}</p>
          </div>
        ))}
        <div className="rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/40 p-4">
          <p className="text-sm font-semibold text-[var(--journal-heading)]">ISSN</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--journal-muted)]">{issnLabel}</p>
        </div>
      </div>
    </section>
  );
}

export function FeatureCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[var(--journal-border)] p-5">
      <h3 className="font-serif text-base font-semibold text-[var(--journal-heading)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--journal-body)]">{children}</p>
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  id,
}: {
  title: string;
  subtitle?: string;
  id?: string;
}) {
  return (
    <header className="mb-8">
      <h2
        id={id}
        className="font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl"
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-[15px] text-[var(--journal-muted)]">{subtitle}</p>
      ) : null}
    </header>
  );
}

export function HomeAboutSection() {
  const audiences = [
    "High-school researchers",
    "Undergraduate and postgraduate students",
    "Research scholars",
    "Independent researchers",
    "Academicians and faculty members",
    "Professionals and practitioners",
    "Industry experts",
    "Interdisciplinary research teams",
  ];

  return (
    <section className="py-12" aria-labelledby="about-gcr-heading">
      <SectionHeading
        id="about-gcr-heading"
        title="Advancing knowledge through interdisciplinary dialogue"
        subtitle="International • Peer-reviewed • Open-access • Multidisciplinary"
      />
      <div className="space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        <p>
          Global Confluence Review is committed to original, ethically sound, and socially relevant
          research that connects disciplines and supports scholars at every stage of their research
          journey.
        </p>
        <p>
          A global platform for rigorous interdisciplinary and emerging research — with the same
          academic, ethical, and editorial assessment for all submissions.
        </p>
      </div>
      <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-[var(--journal-heading)]">
        Who we serve
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {audiences.map((a) => (
          <li key={a} className="flex items-start gap-2 text-sm text-[var(--journal-body)]">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--journal-accent)]" aria-hidden />
            {a}
          </li>
        ))}
      </ul>
      <p className="mt-8">
        <Link href="/about/journal" className="text-[var(--journal-accent)] hover:underline">
          About the journal
        </Link>
      </p>
    </section>
  );
}

export function HomeYoungResearchersSection() {
  return (
    <section
      className="rounded-xl border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/50 p-8"
      aria-labelledby="young-researchers-heading"
    >
      <SectionHeading
        id="young-researchers-heading"
        title="Supporting the next generation of researchers"
      />
      <p className="text-[15px] leading-relaxed text-[var(--journal-body)]">
        GCR welcomes original and well-developed research from motivated high-school students and
        emerging scholars. Young researchers are encouraged to explore meaningful questions, develop
        evidence-based arguments, and communicate their findings responsibly. All submissions undergo
        the same academic, ethical, and editorial assessment; acceptance is not guaranteed.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/research/young-researchers-hub"
          className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Visit Young Researchers’ Hub
        </Link>
        <Link
          href="/research-competitions"
          className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
        >
          Explore research competitions
        </Link>
      </div>
    </section>
  );
}

export function HomeWhyPublishSection() {
  const features = [
    ["Global platform for meaningful research", "Reach readers interested in interdisciplinary and emerging work."],
    ["Rigorous and constructive peer review", "Double-blind review with editorial oversight."],
    ["Open and accessible scholarship", "Open-access publication aligned with our policy."],
    ["Interdisciplinary visibility", "Connect ideas across fields and practice."],
    ["Platform for emerging researchers", "Including high-school and early-career contributors."],
    ["Professional editorial communication", "Clear status updates through your dashboard."],
    ["Research with real-world relevance", "Work that engages contemporary challenges responsibly."],
  ] as const;

  return (
    <section className="py-12" aria-labelledby="why-publish-heading">
      <SectionHeading id="why-publish-heading" title="Why publish with GCR?" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(([title, body]) => (
          <FeatureCard key={title} title={title}>
            {body}
          </FeatureCard>
        ))}
      </div>
    </section>
  );
}
