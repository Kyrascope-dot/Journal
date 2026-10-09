"use client";

import { useState } from "react";
import { ManuscriptPaymentCheckout } from "@/components/payments/ManuscriptPaymentCheckout";

type FeeCardProps = {
  title: string;
  items: string[];
};

function FeeCard({ title, items }: FeeCardProps) {
  return (
    <article className="rounded-lg border border-[var(--journal-border)] bg-white p-5 shadow-sm">
      <h4 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        {title}
      </h4>
      <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-[var(--journal-body)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function PublicationFeesContent() {
  const [showPayment, setShowPayment] = useState(false);

  return (
    <div className="mt-10 space-y-8">
      <section className="rounded-xl border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/40 p-5 sm:p-6">
        <h2 className="font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl">
          Article Processing Charges (APC) / Publication Fees
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Please find below the applicable Article Processing Charge (APC) / Publication Fee and
          review timelines.
        </p>
      </section>

      <section aria-labelledby="indian-authors-fees">
        <h3
          id="indian-authors-fees"
          className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
        >
          For Indian Authors – National Publication
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeeCard
            title="1. Normal Route"
            items={[
              "Publication Fee: ₹9,995",
              "GST @ 18%: ₹1,799.10",
              "Total Payable: ₹11,794.10",
              "Review timeline: Within 2 months",
            ]}
          />
          <FeeCard
            title="2. Fast-Track Route"
            items={[
              "Publication Fee: ₹12,288.14",
              "GST @ 18%: ₹2,211.86",
              "Total Payable: ₹14,500",
              "Review timeline: Within 1 week",
            ]}
          />
        </div>
      </section>

      <section aria-labelledby="international-authors-fees">
        <h3
          id="international-authors-fees"
          className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
        >
          For International Authors
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FeeCard
            title="1. Regular Publication"
            items={[
              "Publication Fee: USD 150",
              "Review timeline: Within 2 months",
            ]}
          />
          <FeeCard
            title="2. Fast-Track Publication"
            items={[
              "Publication Fee: USD 200",
              "Review timeline: Within 1 week",
            ]}
          />
        </div>
      </section>

      <section className="rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5 sm:p-6">
        <h3 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Payment Policy
        </h3>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Payment of the APC / publication fee is required only after the manuscript has received
          full acceptance in its current form. Authors are not required to make any APC payment at
          the initial submission or during the peer-review process.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Please note that fast-track processing provides an expedited review timeline. Acceptance
          and publication remain subject to the journal&apos;s peer-review and editorial decision
          process.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Once the manuscript has been fully accepted, the applicable payment details will be shared
          with the author. After payment, kindly share the payment confirmation/transaction receipt
          along with your manuscript ID for further processing.
        </p>
      </section>

      <div className="rounded-lg border border-[var(--journal-accent)] bg-sky-50 p-5 sm:p-6">
        <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
          Ready to Pay Your Publication Fee?
        </h3>
        <p className="mt-3 text-[15px] text-[var(--journal-body)]">
          If your manuscript has been fully accepted, select one of the four APC categories below
          and proceed to secure payment with Razorpay or PayPal.
        </p>

        <button
          onClick={() => setShowPayment(!showPayment)}
          className="mt-4 inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
        >
          {showPayment ? "Hide payment form" : "Proceed to payment"}
        </button>
      </div>

      {showPayment ? <ManuscriptPaymentCheckout /> : null}
    </div>
  );
}
