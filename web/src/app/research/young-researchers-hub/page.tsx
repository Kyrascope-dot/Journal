import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = {
  title: "Young Researchers’ Hub",
};

export default function YoungResearchersHubPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Young Researchers’ Hub
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Resources for high-school students and emerging scholars who want to develop research
            skills, prepare manuscripts responsibly, and explore GCR programmes. Journal submission
            and competition entry both require the same standards of ethics, originality, and
            academic quality.
          </p>
          <ul className="mt-8 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
            <li>
              <Link href="/for-authors/author-guidelines" className="text-[var(--journal-accent)] hover:underline">
                Author guidelines
              </Link>
            </li>
            <li>
              <Link href="/for-authors/manuscript-templates" className="text-[var(--journal-accent)] hover:underline">
                High-school research paper template
              </Link>
            </li>
            <li>
              <Link href="/research-competitions" className="text-[var(--journal-accent)] hover:underline">
                GCR research competitions
              </Link>
            </li>
            <li>
              <Link href="/for-authors/submit-manuscript" className="text-[var(--journal-accent)] hover:underline">
                Submit manuscript
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
