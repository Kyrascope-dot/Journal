import Link from "next/link";
import type { ReactNode } from "react";
import { FeatureCard, SectionHeading } from "@/components/home/HomeSections";
import { contentShell } from "@/lib/content-layout";
import {
  TECH_RESEARCH_AREAS,
  TECH_RESEARCH_HERO,
  TECH_RESEARCH_INTEGRITY_NOTE,
  TECH_RESEARCH_PROCESS,
  TECH_RESEARCH_SUBMISSION_TYPES,
  TECH_RESEARCH_WHO_CAN_SUBMIT,
} from "@/lib/tech-research-hub-content";

function PrimaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)]"
    >
      {children}
    </Link>
  );
}

function SecondaryButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex rounded border border-[var(--journal-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)]"
    >
      {children}
    </Link>
  );
}

export function TechResearchHubPage() {
  return (
    <>
      <section
        aria-labelledby="tech-research-hero-heading"
        className="border-b border-[var(--journal-border)] bg-gradient-to-b from-[var(--journal-hero-bg)] to-white"
      >
        <div className={`${contentShell} py-12 sm:py-16`}>
          <p className="text-sm font-medium uppercase tracking-wide text-[var(--journal-accent)]">
            Global Confluence Review
          </p>
          <h1
            id="tech-research-hero-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--journal-heading)] sm:text-4xl lg:text-5xl"
          >
            {TECH_RESEARCH_HERO.heading}
          </h1>
          <p className="mt-4 font-serif text-xl text-[var(--journal-heading)] sm:text-2xl">
            {TECH_RESEARCH_HERO.tagline}
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-[var(--journal-body)]">
            {TECH_RESEARCH_HERO.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryButton href="/tech-research/apply">Submit Your Project</PrimaryButton>
            <SecondaryButton href="#how-it-works">How It Works</SecondaryButton>
          </div>
        </div>
      </section>

      <div className={contentShell}>
        <section className="py-12" aria-labelledby="who-can-submit-heading">
          <SectionHeading
            id="who-can-submit-heading"
            title="Who can submit"
            subtitle="A student-focused pathway for original technology and engineering research."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_RESEARCH_WHO_CAN_SUBMIT.map((item) => (
              <FeatureCard key={item.title} title={item.title}>
                {item.description}
              </FeatureCard>
            ))}
          </div>
        </section>

        <section className="py-12" aria-labelledby="research-areas-heading">
          <SectionHeading
            id="research-areas-heading"
            title="Research areas"
            subtitle="Select the area that best describes your project when you apply."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TECH_RESEARCH_AREAS.map((area) => (
              <li
                key={area}
                className="rounded-lg border border-[var(--journal-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--journal-heading)]"
              >
                {area}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-24 py-12"
          aria-labelledby="how-it-works-heading"
        >
          <SectionHeading
            id="how-it-works-heading"
            title="How it works"
            subtitle="From project idea to editorial decision — a clear, structured pathway."
          />
          <ol className="grid gap-4 sm:grid-cols-2">
            {TECH_RESEARCH_PROCESS.map((step, index) => (
              <li
                key={step}
                className="flex gap-4 rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/40 p-5"
              >
                <span
                  className="font-serif text-2xl font-semibold leading-none text-[var(--journal-accent)]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="sr-only">{`Step ${index + 1}:`}</p>
                  <p className="text-[15px] font-medium text-[var(--journal-heading)]">{step}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
            {TECH_RESEARCH_INTEGRITY_NOTE}
          </p>
        </section>

        <section className="py-12" aria-labelledby="what-can-submit-heading">
          <SectionHeading
            id="what-can-submit-heading"
            title="What can students submit"
            subtitle="Eligible formats for technology and engineering research projects."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TECH_RESEARCH_SUBMISSION_TYPES.map((item) => (
              <FeatureCard key={item.title} title={item.title}>
                {item.description}
              </FeatureCard>
            ))}
          </div>
        </section>

        <section
          className="mb-12 rounded-xl border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/50 p-8 text-center sm:p-10"
          aria-labelledby="tech-research-cta-heading"
        >
          <h2
            id="tech-research-cta-heading"
            className="font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl"
          >
            Ready to share your research?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--journal-body)]">
            Begin your application when you are ready to present your project for editorial review.
          </p>
          <div className="mt-6 flex justify-center">
            <PrimaryButton href="/tech-research/apply">Start Your Submission</PrimaryButton>
          </div>
        </section>
      </div>
    </>
  );
}
