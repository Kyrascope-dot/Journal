import Link from "next/link";
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
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Online registration with payment integration is being finalised. For now, sign in to
            your account and contact the editorial office with your participant details, or complete
            registration when the form is enabled on this page.
          </p>
          <p className="mt-4 text-sm text-[var(--journal-muted)]">
            Required fields will include name, email, institution, participant category, attendance
            mode, and consent confirmations. A registration ID and confirmation email will be issued
            upon successful submission.
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
