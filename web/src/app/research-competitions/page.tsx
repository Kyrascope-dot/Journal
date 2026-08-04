import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { featuredCompetition } from "@/lib/competition-config";

export const metadata = {
  title: "GCR research competitions",
  description: "Where curiosity becomes research—and research creates impact",
};

export default function ResearchCompetitionsPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            GCR research competitions
          </h1>
          <p className="mt-2 text-lg text-[var(--journal-muted)]">
            Where curiosity becomes research—and research creates impact
          </p>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            The GCR Research Competitions provide a global platform for students, emerging
            researchers, independent scholars, and interdisciplinary innovators to present original
            ideas, receive expert feedback, and gain recognition for high-quality research.
          </p>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Our competitions are designed to encourage intellectual curiosity, evidence-based
            thinking, academic writing, innovation, and meaningful engagement with contemporary
            global challenges.
          </p>
          <p className="mt-6 font-medium text-[var(--journal-heading)]">
            Think critically. Research responsibly. Present confidently. Create impact.
          </p>

          <h2 className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            Eligibility
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
            {[
              "High-school students",
              "Undergraduate students",
              "Postgraduate students",
              "Research scholars",
              "Independent researchers",
              "Early-career researchers",
              "Young innovators",
              "Interdisciplinary research teams",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--journal-muted)]">
            Individual and team registrations will be supported where enabled for each competition.
          </p>

          <h2 className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            {featuredCompetition.name}
          </h2>
          <dl className="mt-6 space-y-3 text-sm text-[var(--journal-body)]">
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Theme</dt>
              <dd>{featuredCompetition.theme}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Format</dt>
              <dd>Research paper plus online finalist presentation</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Participants</dt>
              <dd>{featuredCompetition.eligibility}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Categories</dt>
              <dd>{featuredCompetition.categories.join(", ")}</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Paper length</dt>
              <dd>1,500–3,000 words</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Evaluation</dt>
              <dd>Two academic evaluators per paper</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Final</dt>
              <dd>Top 10–15 participants present online</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Awards</dt>
              <dd>Gold, silver, bronze, and best presentation</dd>
            </div>
            <div>
              <dt className="font-semibold text-[var(--journal-heading)]">Certificates</dt>
              <dd>Digital certificates</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-[var(--journal-body)]">
            Selected work may be considered for publication in GCR after peer review and editorial
            approval. Registration, paper upload, payment status, evaluator assignment, and
            certificates will be managed through the competition portal (implementation in progress).
          </p>
          <p className="mt-8">
            <Link href="/login" className="text-[var(--journal-accent)] hover:underline">
              Sign in to register
            </Link>
            {" · "}
            <Link
              href="/research/young-researchers-hub"
              className="text-[var(--journal-accent)] hover:underline"
            >
              Young Researchers’ Hub
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
