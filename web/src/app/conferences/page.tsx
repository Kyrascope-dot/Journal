import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import {
  conferenceRegistrationDisclaimer,
  quarterlyConferenceSeries,
} from "@/lib/conference-config";

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
            GCR international conference series
          </h1>
          <p className="mt-2 text-lg text-[var(--journal-body)]">
            Connecting researchers. Sharing ideas. Creating impact.
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            The series supports research presentations, interdisciplinary dialogue, academic
            networking, expert keynote sessions, research workshops, PhD colloquia, editorial
            discussions, and research recognition.
          </p>
          <figure className="mt-8">
            <Image
              src="/poster.jpeg"
              alt="Poster for the GCR International Multidisciplinary Conference on 30 August 2026"
              width={683}
              height={1024}
              priority
              className="mx-auto h-auto w-full max-w-2xl rounded border border-[var(--journal-border)]"
            />
            <figcaption className="mt-3 text-center text-sm text-[var(--journal-muted)]">
              International Multidisciplinary Conference 2026 — 30 August 2026, online via Zoom
            </figcaption>
          </figure>
          <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
            <li>Research presentations</li>
            <li>Interdisciplinary dialogue</li>
            <li>Academic networking</li>
            <li>Expert keynote sessions</li>
            <li>Research workshops</li>
            <li>PhD colloquia</li>
            <li>Editorial discussions</li>
            <li>Research recognition and awards</li>
          </ul>

          <h2 id="quarterly-series" className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Quarterly conference series
          </h2>
          <ul className="mt-6 space-y-4">
            {quarterlyConferenceSeries.map((q) => (
              <li
                key={q.quarter}
                className="rounded-lg border border-[var(--journal-border)] p-4 text-sm"
              >
                <p className="font-semibold text-[var(--journal-heading)]">
                  {q.quarter}
                </p>
                <p className="mt-1 text-[var(--journal-muted)]">{q.period}</p>
              </li>
            ))}
          </ul>

          <h2 id="upcoming" className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Registration and paper submission
          </h2>
          <p className="mt-4 text-[15px] text-[var(--journal-body)]">
            Schedules and registration windows are published here when confirmed. Use registration
            and paper submission forms to express interest; the editorial office will confirm
            details by email.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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
