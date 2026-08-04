import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = { title: "Conference dashboard" };

export default function ConferenceDashboardPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Conference dashboard
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            View registration status, payment receipts, paper submission IDs, and presentation
            schedules after signing in. This dashboard will list your conference registrations once
            the backend module is connected.
          </p>
          <p className="mt-8">
            <Link href="/login" className="text-[var(--journal-accent)] hover:underline">
              Sign in
            </Link>
            {" · "}
            <Link href="/conferences" className="text-[var(--journal-accent)] hover:underline">
              Conferences
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
