import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function SubmissionsPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Submissions
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {siteConfig.name} invites scholars and practitioners to submit original work that
          fits our scope and meets our ethical and quality standards. We publish research
          articles, critical reviews, and—in some cases—short communications or invited
          commentaries.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Before you submit
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>
            Read the{" "}
            <a className="text-[var(--journal-accent)] hover:underline" href="/about/journal">
              aims and scope
            </a>{" "}
            and confirm your manuscript is not under review elsewhere.
          </li>
          <li>
            Review our{" "}
            <a className="text-[var(--journal-accent)] hover:underline" href="/about/ethics">
              publication ethics
            </a>{" "}
            and{" "}
            <a className="text-[var(--journal-accent)] hover:underline" href="/about/open-access">
              open access
            </a>{" "}
            pages.
          </li>
          <li>
            Prepare a blinded manuscript file (no author names in the main text or
            file properties) for double-blind review, plus a separate title page with
            author details and affiliations.
          </li>
        </ul>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Manuscript format
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Submissions are <strong>format-free</strong> for layout beyond usual scholarly
          sections (no fixed journal template), but the manuscript should use{" "}
          <strong>Times New Roman, 11 pt</strong> for the main text. Use double-spacing,
          numbered pages, and clear headings unless the editorial office specifies
          otherwise. Figures and tables should be high resolution and placed where referred
          to in the text. Manuscripts should be in English (or the language agreed with
          the editor).
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <strong>References</strong> must follow{" "}
          <strong>APA 7th edition</strong> throughout (in-text citations and reference
          list).
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          What to include
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>Abstract (typically 200–250 words) and 4–6 keywords.</li>
          <li>Clear research question, methods, findings, and discussion of limitations.</li>
          <li>
            References in <strong>APA 7th&nbsp;edition</strong> (in-text and list), complete
            and up to date.
          </li>
          <li>Funding statements and conflict-of-interest disclosures on the title page.</li>
          <li>Ethics approval or participant consent details where human subjects are involved.</li>
        </ul>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          How to submit
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Submissions are accepted via the editorial email below until a dedicated
          submission portal (Open Journal Systems or a custom workflow) is linked here.
          Send your manuscript as a single PDF or Word document, with &ldquo;Submission
          &mdash; [short title]&rdquo; in the subject line. You will receive an
          acknowledgment within a few business days.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Fees
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Any article processing charges (APCs) are disclosed before acceptance and are
          described on our{" "}
          <a className="text-[var(--journal-accent)] hover:underline" href="/about/open-access">
            open access policy
          </a>{" "}
          page. Waivers may be available for authors without institutional support—ask
          the editorial office when you submit.
        </p>

        <p className="mt-10 border-t border-[var(--journal-border)] pt-8 text-sm text-[var(--journal-muted)]">
          Editorial contact:{" "}
          <a className="font-medium text-[var(--journal-accent)] hover:underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </p>
        </div>
      </div>
    </AppShell>
  );
}
