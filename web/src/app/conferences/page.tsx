import Image from "next/image";
import Link from "next/link";
import {
  AwardsAndCertificatesSection,
  ColloquiaSection,
  ConferenceFeesSection,
  ConferenceScheduleSection,
  ConferenceSpeakersSection,
  HowToRegisterSection,
  ImportantDatesSection,
  OnlineConferenceBenefitsSection,
  PublicationOpportunitySection,
} from "@/components/conferences/ConferenceContentSections";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import {
  conferenceRegistrationDisclaimer,
  quarterlyConferenceSeries,
} from "@/lib/conference-config";
import { conferenceOverviewTitle } from "@/lib/conference-content";

export const metadata = {
  title: "Conferences",
  description: "GCR International Conference Series",
};

export default function ConferencesPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            {conferenceOverviewTitle}
          </h1>
          <p className="mt-2 text-lg text-[var(--journal-body)]">
            Connecting researchers. Sharing ideas. Creating impact.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            The GCR Conference series supports research presentations, interdisciplinary dialogue,
            academic networking, expert sessions, the GCR Colloquia/Workshop, editorial discussions,
            and research recognition.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <figure>
              <Image
                src="/poster.jpeg"
                alt="Poster for the GCR International Multidisciplinary Conference on 30 August 2026"
                width={1024}
                height={1536}
                priority
                className="mx-auto h-auto w-full rounded border border-[var(--journal-border)]"
              />
              <figcaption className="mt-3 text-center text-sm text-[var(--journal-muted)]">
                GCR Conference — 30 August 2026, 9:30am IST, online via Zoom
              </figcaption>
            </figure>
            <figure>
              <Image
                src="/poster-colloqium.jpeg"
                alt="Poster for the GCR Colloquia / Research Workshop 2026"
                width={1070}
                height={1600}
                className="mx-auto h-auto w-full rounded border border-[var(--journal-border)]"
              />
              <figcaption className="mt-3 text-center text-sm text-[var(--journal-muted)]">
                GCR Colloquia/Workshop — 29 August 2026, 9:30am IST, online via Zoom
              </figcaption>
            </figure>
          </div>

          <ConferenceSpeakersSection />
          <ConferenceScheduleSection />
          <ConferenceFeesSection />
          <ImportantDatesSection />
          <HowToRegisterSection />
          <PublicationOpportunitySection />
          <AwardsAndCertificatesSection />
          <OnlineConferenceBenefitsSection />
          <ColloquiaSection />

          <h2
            id="quarterly-series"
            className="mt-16 scroll-mt-24 font-serif text-xl font-semibold text-[var(--journal-heading)]"
          >
            GCR Conference series
          </h2>
          <p className="mt-4 text-[15px] text-[var(--journal-body)]">
            Global Confluence Review hosts quarterly online conferences aligned with the journal&apos;s
            publication calendar.
          </p>
          <ul className="mt-6 space-y-4">
            {quarterlyConferenceSeries.map((q) => (
              <li
                key={q.quarter}
                className="rounded-lg border border-[var(--journal-border)] p-4 text-sm"
              >
                <p className="font-semibold text-[var(--journal-heading)]">{q.quarter}</p>
                <p className="mt-1 text-[var(--journal-muted)]">{q.period}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/conferences/register"
              className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Registration
            </Link>
            <Link
              href="/conferences/submit-paper"
              className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Submit conference paper
            </Link>
            <Link
              href="/conferences/payment"
              className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Conference payment
            </Link>
            <Link
              href="/conferences/book-of-abstracts"
              className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Book of Abstracts
            </Link>
            <Link
              href="/conferences/faqs"
              className="inline-flex rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium hover:bg-zinc-50"
            >
              Conference FAQs
            </Link>
          </div>

          <p className="mt-10 rounded-md border border-amber-200 bg-amber-50/80 p-4 text-sm leading-relaxed text-[var(--journal-body)]">
            {conferenceRegistrationDisclaimer}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
