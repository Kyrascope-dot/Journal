import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function EthicsPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Publication ethics
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {siteConfig.name} follows principles aligned with the Committee on Publication
          Ethics (COPE). We expect integrity from authors, reviewers, and editors at every
          stage of publication.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Authorship
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Authorship should reflect substantial contribution to conception, design,
          analysis, or drafting, and approval of the final version. Gift or ghost authorship
          is not acceptable. All listed authors must meet these criteria; contributors who
          do not qualify for authorship may be acknowledged separately.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Originality and plagiarism
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Submissions must be original and not under consideration elsewhere. Text,
          data, or figures taken from other sources require clear attribution and, where
          applicable, permission. Duplication of one&apos;s own prior work without
          transparent cross-reference may constitute misconduct and can lead to rejection
          or retraction.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Conflicts of interest
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Authors must disclose financial, personal, or institutional relationships that
          could influence the work. Reviewers and editors must decline or disclose
          conflicts that could bias their judgment. Undisclosed conflicts undermine trust
          in the record.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Data and reproducibility
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Where research involves data, authors should provide sufficient detail for
          verification where ethical and legal constraints allow. Fabrication or
          falsification of data is grounds for rejection and may be reported to
          institutions.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Corrections and retractions
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Honest errors may be corrected through an erratum or corrigendum. Serious
          misconduct or unreliability may require retraction with a public notice. We
          cooperate with institutions and COPE guidance when investigating concerns.
        </p>

        <p className="mt-8 text-sm text-[var(--journal-muted)]">
          Report ethics concerns to{" "}
          <a className="text-[var(--journal-accent)] hover:underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
          .
        </p>
        </div>
      </div>
    </AppShell>
  );
}
