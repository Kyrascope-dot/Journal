import Link from "next/link";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { AppShell } from "@/components/layout/AppShell";
import { ConferencePaymentCheckout } from "@/components/payments/ConferencePaymentCheckout";
import { contentProse, contentShell } from "@/lib/content-layout";
import { conferenceRegistrationFees } from "@/lib/conference-content";

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
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
            {conferenceRegistrationFees.map((fee) => (
              <li key={fee.label}>
                <strong>{fee.label}:</strong> {fee.amount}
              </li>
            ))}
          </ul>

          <ConferencePaymentCheckout />

          <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            The Registration Fee Includes
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
            <li>
              Participation in the International Multidisciplinary Conference 2026 on 30 August
              2026
            </li>
            <li>
              Accepted conference abstracts will be published in the GCR Conference Book of
              Abstracts
            </li>
            <li>
              Complimentary access to the GCR Colloquia/Workshop on 29 August 2026, featuring
              distinguished research experts
            </li>
            <li>Exclusive Fireside Chat with the Editors</li>
            <li>
              Presentation of accepted research before an international audience of academicians,
              researchers, and industry experts
            </li>
            <li>Double-blind peer review of the submitted manuscript</li>
            <li>Editorial evaluation and publication processing</li>
            <li>
              Opportunity for selected papers to be considered for publication in Global Confluence
              Review (ISSN: 3139-6690), subject to peer review and editorial standards
            </li>
            <li>Digital Conference Participation Certificate</li>
            <li>
              Separate E-Certificate for participation in the GCR Colloquia/Workshop
            </li>
            <li>Opportunity to compete for Best Paper and Best Presenter Awards</li>
            <li>
              Networking opportunities with international researchers, editors, and scholars
            </li>
          </ul>

          <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Important Note
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
            <li>The registration fee is payable only after the abstract has been accepted.</li>
            <li>Acceptance of an abstract does not guarantee publication.</li>
            <li>
              Conference presentation does not automatically guarantee publication in GCR.
            </li>
            <li>
              All full-length manuscripts will be subject to the journal&apos;s applicable
              peer-review and editorial processes.
            </li>
          </ul>

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
