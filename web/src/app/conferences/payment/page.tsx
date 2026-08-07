import Link from "next/link";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = { title: "Conference payment" };

export default function ConferencePaymentPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Conference payment
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Secure conference payments will be processed server-side through Razorpay when
            configured. Pricing categories (high-school, undergraduate, postgraduate, professional,
            international, team, and listener rates) will be managed in the admin settings — not
            hard-coded here.
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--journal-heading)]">
            Payment confirms conference registration only and does not guarantee journal publication.
          </p>
          <FeeWaiverNotice className="mt-8" />
          <p className="mt-8">
            <Link href="/conferences/register" className="text-[var(--journal-accent)] hover:underline">
              Registration
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
