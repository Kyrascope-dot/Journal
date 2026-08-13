import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TestPaymentCheckout } from "@/components/payments/TestPaymentCheckout";
import { contentProse, contentShell } from "@/lib/content-layout";
import { isPaymentTestPageEnabled } from "@/lib/payments/plans";

export const metadata = {
  title: "Payment gateway test",
  robots: { index: false, follow: false },
};

export default function PaymentTestPage() {
  if (!isPaymentTestPageEnabled()) {
    notFound();
  }

  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Payment gateway test
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Use this page to verify Razorpay checkout with a one-dollar test charge. This is not
            conference registration and does not grant conference access.
          </p>
          <TestPaymentCheckout />
        </div>
      </div>
    </AppShell>
  );
}
