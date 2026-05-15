import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function PeerReviewPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Peer review process
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {siteConfig.name} uses a <strong>double-blind</strong> peer-review model for
          research articles: authors do not know reviewers&apos; identities, and reviewers
          are not told authors&apos; names or affiliations. This helps reduce bias and keep
          the focus on the quality of the manuscript.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          What happens after submission
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>
            <strong>Editorial screening.</strong> The editorial office checks formatting,
            scope fit, and ethical basics (e.g. plagiarism signals, competing submissions).
            Manuscripts that fall outside the journal&apos;s scope may be declined without
            external review.
          </li>
          <li>
            <strong>Reviewer invitation.</strong> Suitable manuscripts are sent to at least
            two independent experts. We seek reviewers with relevant subject expertise and a
            record of fair, constructive assessment.
          </li>
          <li>
            <strong>Decision.</strong> The Editor-in-Chief or handling editor weighs
            reviewer comments and their own reading to recommend acceptance, minor or major
            revision, or rejection. Authors receive anonymized comments to guide revisions.
          </li>
          <li>
            <strong>Revisions.</strong> Revised manuscripts may be returned to the same or
            new reviewers when substantial changes are made.
          </li>
        </ol>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Typical timelines
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Timelines vary by field and reviewer availability. As a guide, first decisions
          after peer review often fall in the <strong>8–12 week</strong> range, though
          delays can occur when specialist reviewers are scarce. Authors are welcome to
          contact the editorial office for a status update after a reasonable interval.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Expectations for reviewers
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>Declare conflicts of interest and decline invitations when appropriate.</li>
          <li>Evaluate methodology, argument, and contribution—not personal views alone.</li>
          <li>Provide specific, actionable feedback for authors and editors.</li>
          <li>Respect confidentiality: do not share manuscripts or use ideas unfairly.</li>
        </ul>

        <p className="mt-8 text-sm text-[var(--journal-muted)]">
          Questions about the process? Email{" "}
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
