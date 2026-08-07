import Link from "next/link";
import { BlindedManuscriptNotice } from "@/components/for-authors/BlindedManuscriptNotice";
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
            Sign in to the Author Dashboard, select New Submission, choose Submit for Conference,
            and submit your abstract. Read the Conference FAQs before submitting.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Best Presenter-only participants do not need to email a manuscript. Best Paper, Both
            Awards, and conference submissions being considered for journal publication must follow
            the blinded manuscript requirements below.
          </p>
          <BlindedManuscriptNotice className="mt-8" />
          <p className="mt-8">
            <Link href="/for-authors/manuscript-templates" className="text-[var(--journal-accent)] hover:underline">
              Conference paper template
            </Link>
            {" · "}
            <Link href="/conferences/faqs" className="text-[var(--journal-accent)] hover:underline">
              Conference FAQs
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
