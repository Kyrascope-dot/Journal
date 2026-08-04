import Link from "next/link";
import { SectionHeading } from "@/components/home/HomeSections";
import {
  conferencePublicationDisclaimer,
  featuredConference,
} from "@/lib/conference-config";

export function HomeConferencePreview() {
  return (
    <section className="py-12" aria-labelledby="conference-preview-heading">
      <SectionHeading
        id="conference-preview-heading"
        title="GCR international conference series"
      />
      <div className="rounded-lg border border-[var(--journal-border)] p-6">
        <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
          {featuredConference.title}
        </h3>
        <ul className="mt-4 space-y-1 text-sm text-[var(--journal-body)]">
          <li>
            <strong>Theme:</strong> {featuredConference.theme}
          </li>
          <li>
            <strong>Mode:</strong> {featuredConference.mode}
          </li>
          <li>
            <strong>Schedule:</strong> {featuredConference.datesLabel}
          </li>
          <li>
            <strong>Registration deadline:</strong> {featuredConference.registrationDeadline}
          </li>
          <li>
            <strong>Submission deadline:</strong> {featuredConference.submissionDeadline}
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/conferences/register"
            className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Registration
          </Link>
          <Link
            href="/conferences/submit-paper"
            className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
          >
            Submit paper
          </Link>
          <Link
            href="/conferences"
            className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
          >
            Conference overview
          </Link>
        </div>
      </div>
      <p className="mt-6 text-xs leading-relaxed text-[var(--journal-muted)]">
        {conferencePublicationDisclaimer}
      </p>
    </section>
  );
}
