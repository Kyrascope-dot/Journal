import Link from "next/link";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { conferenceRegistrationDisclaimer } from "@/lib/conference-config";

export const metadata = { title: "Conference registration" };

export default function ConferenceRegisterPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Conference registration
          </h1>
          <div className="mt-6 rounded-lg border-2 border-[var(--journal-accent)] bg-[var(--journal-hero-bg)] p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
              Registration Deadline
            </p>
            <p className="mt-2 font-serif text-2xl font-semibold text-[var(--journal-heading)]">
              25 August 2026
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--journal-heading)]">12:00 PM IST</p>
          </div>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Sign in to your account, open New Submission, select Submit for Conference, and submit
            your abstract. Complete the registration payment after receiving your acceptance email.
          </p>
          <p className="mt-4 text-[15px] font-medium text-[var(--journal-heading)]">
            Before submitting your abstract, please read the{" "}
            <Link href="/conferences/faqs" className="text-[var(--journal-accent)] underline">
              Conference FAQs
            </Link>{" "}
            carefully.
          </p>
          <p className="mt-8">
            <Link href="/login" className="text-[var(--journal-accent)] hover:underline">
              Sign in
            </Link>
            {" · "}
            <Link href="/conferences/payment" className="text-[var(--journal-accent)] hover:underline">
              Conference payment
            </Link>
            {" · "}
            <Link href="/conferences/dashboard" className="text-[var(--journal-accent)] hover:underline">
              Registration status
            </Link>
          </p>
          <section className="mt-10" aria-labelledby="registration-awards-heading">
            <h2
              id="registration-awards-heading"
              className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
            >
              Award Category
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
              Separate awards may be presented for different academic levels and research
              methodologies depending upon the number and quality of submissions.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
              Final decisions rest with the Conference Evaluation Committee.
            </p>
          </section>
          <FeeWaiverNotice className="mt-10" />
          <p className="mt-8 text-xs leading-relaxed text-[var(--journal-muted)]">
            {conferenceRegistrationDisclaimer}
          </p>
          <p className="mt-4 text-xs text-[var(--journal-muted)]">
            Payment confirms conference registration only and does not guarantee journal publication.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
