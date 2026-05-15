import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

const generalRows: { label: string; value: ReactNode }[] = [
  { label: "Title", value: siteConfig.name },
  { label: "Frequency", value: siteConfig.frequency },
  {
    label: "ISSN",
    value: siteConfig.issn.trim() ? siteConfig.issn : "—",
  },
  { label: "Publisher Name", value: siteConfig.publisherOrganisation },
  { label: "Publisher Address", value: siteConfig.publisherAddress },
  { label: "Starting Year", value: siteConfig.startingYear },
  { label: "Subject", value: siteConfig.subject },
  { label: "Language", value: siteConfig.language },
  { label: "Publication format", value: siteConfig.publicationFormat },
  {
    label: "Email ID",
    value: (
      <a
        className="text-[var(--journal-accent)] hover:underline break-all"
        href={`mailto:${siteConfig.email}`}
      >
        {siteConfig.email}
      </a>
    ),
  },
  {
    label: "Mobile No.",
    value: (
      <a
        className="text-[var(--journal-accent)] hover:underline"
        href={`tel:${siteConfig.publisherMobileTel}`}
      >
        {siteConfig.publisherMobileDisplay}
      </a>
    ),
  },
];

export default function AboutJournalPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          About the journal
        </h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <p>
            <strong>{siteConfig.name}</strong> ({siteConfig.shortName}) is an
            international, peer-reviewed, open-access journal dedicated to bringing
            diverse research streams into dialogue. We publish scholarship that advances
            theory, evidence, and practice—whether empirical, conceptual, or
            policy-oriented—across the social sciences and related interdisciplinary
            fields. Our double-blind peer-review process ensures rigorous, impartial
            evaluation, while our open-access model guarantees that knowledge reaches
            readers without barriers.
          </p>
          <p>
            The journal serves as a platform for scholars, researchers, and practitioners
            to present high-quality research that bridges traditional academic boundaries
            and encourages interdisciplinary dialogue. With a strong emphasis on academic
            rigour and integrity, it welcomes empirical studies, theoretical papers,
            review articles, and critical discussions.
          </p>
          <p>
            By integrating perspectives from both qualitative and quantitative domains,{" "}
            <strong>{siteConfig.name}</strong> aims to create a true confluence of ideas
            that address complex global challenges and contribute meaningfully to academic,
            technological, and policy advancements.
          </p>
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          General
        </h2>
        <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50/80 p-5 sm:p-6">
          <dl className="divide-y divide-[var(--journal-border)]/60 text-sm">
            {generalRows.map((row) => (
              <div
                key={row.label}
                className="grid gap-1 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(160px,auto)_1fr] sm:gap-6 sm:py-3"
              >
                <dt className="font-medium text-[var(--journal-heading)]">
                  {row.label}
                </dt>
                <dd className="min-w-0 text-[var(--journal-body)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Aims &amp; scope
        </h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <p>
            The journal&apos;s name reflects our core commitment: a confluence of
            disciplines, perspectives, and regions. We welcome original research articles,
            review articles, and well-argued short communications that engage with
            contemporary debates and are accessible to a broad scholarly readership.
          </p>
          <p>
            The journal&apos;s multidisciplinary scope spans both social sciences,
            humanities, and STEM fields, including but not limited to:
          </p>
          <ul className="grid gap-2 pt-1 sm:grid-cols-2">
            {[
              "Anthropology & Sociology",
              "Psychology & Education",
              "Economics & Management",
              "Law, History & Cultural Studies",
              "Communication & Peace Studies",
              "Science, Technology, Engineering & Mathematics (STEM)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--journal-accent)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Publication &amp; access
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          All research content is published under an open-access license so readers may
          use and share published work in line with our{" "}
          <a className="text-[var(--journal-accent)] hover:underline" href="/about/open-access">
            open access policy
          </a>
          . The journal is dedicated to promoting accessibility and knowledge
          dissemination, ensuring that research is available to a global audience without
          barriers.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Audience
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          We serve researchers, doctoral students, educators, and professionals who rely
          on trustworthy, citable research. Our editorial team and reviewers work to
          maintain constructive feedback and timely decisions wherever possible.
        </p>
        </div>
      </div>
    </AppShell>
  );
}
