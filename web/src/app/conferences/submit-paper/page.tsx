import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = { title: "Submit conference paper" };

export default function ConferenceSubmitPaperPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Submit conference paper
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Conference paper submission (title, abstract, co-authors, and file upload) will be
            available through this portal. You will receive a conference-paper submission ID and
            email confirmation when the workflow is live.
          </p>
          <p className="mt-8">
            <Link href="/for-authors/manuscript-templates" className="text-[var(--journal-accent)] hover:underline">
              Conference paper template
            </Link>
            {" · "}
            <Link href="/conferences" className="text-[var(--journal-accent)] hover:underline">
              Conference overview
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
