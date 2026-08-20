import Link from "next/link";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { AppShell } from "@/components/layout/AppShell";
import { ConferencePaymentCheckout } from "@/components/payments/ConferencePaymentCheckout";
import { contentProse, contentShell } from "@/lib/content-layout";
import {
  conferencePaymentApcNote,
  conferencePaymentPublicationNote,
  conferenceRegistrationFeeIncludes,
  conferenceRegistrationFees,
} from "@/lib/conference-content";

export const metadata = { title: "Conference payment" };

export default function ConferencePaymentPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Conference payment
          </h1>

          <h2 className="mt-8 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Registration Fee
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-[15px] text-[var(--journal-body)]">
            {conferenceRegistrationFees.map((fee) => (
              <li key={fee.label}>
                <strong>{fee.label}</strong>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 font-normal">
                  {fee.breakdown.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Sign in is required before you can pay. After abstract acceptance, complete your
            registration fee here using Razorpay or PayPal secure checkout.
          </p>

          <ConferencePaymentCheckout />

          <section
            className="mt-10 rounded-lg border border-sky-200 bg-sky-50/70 p-5"
            aria-labelledby="payment-troubleshooting-heading"
          >
            <h2
              id="payment-troubleshooting-heading"
              className="font-serif text-lg font-semibold text-[var(--journal-heading)]"
            >
              Payment not working?
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--journal-body)]">
              <li>
                <strong>National Participants:</strong> Registration Fee USD 150 + GST (18%) USD 27
                = USD 177 total
              </li>
              <li>
                <strong>International Participants:</strong> Registration Fee USD 200 — use PayPal
                for international cards or PayPal accounts.
              </li>
              <li>
                <strong>Domestic payments:</strong> use Razorpay and enter a valid mobile number
                with country code.
              </li>
              <li>
                <strong>Testing:</strong> use Razorpay test keys or PayPal sandbox credentials
                before switching either gateway to live mode.
              </li>
            </ul>
          </section>

          <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            The Registration Fee Includes
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
            {conferenceRegistrationFeeIncludes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Publication Opportunity
          </h2>
          {conferencePaymentPublicationNote.map((paragraph) => (
            <p
              key={paragraph}
              className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]"
            >
              {paragraph}
            </p>
          ))}
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            {conferencePaymentApcNote}{" "}
            <Link
              href="/for-authors/publication-fees"
              className="text-[var(--journal-accent)] hover:underline"
            >
              Publication Fees &amp; Fee Waivers
            </Link>
            .
          </p>

          <p className="mt-8 text-sm font-medium text-[var(--journal-heading)]">
            Payment confirms conference registration only and does not guarantee journal publication.
          </p>
          <FeeWaiverNotice className="mt-8" />
          <p className="mt-8">
            <Link href="/conferences/register" className="text-[var(--journal-accent)] hover:underline">
              Registration
            </Link>
            {" · "}
            <Link href="/conferences/book-of-abstracts" className="text-[var(--journal-accent)] hover:underline">
              Book of Abstracts
            </Link>
            {" · "}
            <Link href="/conferences/dashboard" className="text-[var(--journal-accent)] hover:underline">
              Payment status dashboard
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
