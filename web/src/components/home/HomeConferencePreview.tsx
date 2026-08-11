import Link from "next/link";
import { SectionHeading } from "@/components/home/HomeSections";
import { conferencePublicationDisclaimer, featuredConference } from "@/lib/conference-config";
import { conferenceOverviewTitle, conferenceRegistrationFees } from "@/lib/conference-content";

export function HomeConferencePreview() {
  return (
    <section className="py-12" aria-labelledby="conference-preview-heading">
      <SectionHeading id="conference-preview-heading" title={conferenceOverviewTitle} />
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
            <strong>Conference:</strong> {featuredConference.datesLabel}, 9:30am IST
          </li>
          <li>
            <strong>Colloquia/Workshop:</strong> 29 August 2026, 9:30am IST
          </li>
          <li>
            <strong>Abstract &amp; registration deadline:</strong>{" "}
            {featuredConference.registrationDeadline}
          </li>
          <li>
            <strong>Fees:</strong>{" "}
            {conferenceRegistrationFees.map((f) => `${f.label} ${f.amount}`).join(" · ")}
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
