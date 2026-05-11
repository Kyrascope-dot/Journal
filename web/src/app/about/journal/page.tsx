import { AppShell } from "@/components/layout/AppShell";
import { siteConfig } from "@/lib/site-config";

export default function AboutJournalPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          About the journal
        </h1>

        <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <p>
            <strong>{siteConfig.name}</strong> ({siteConfig.shortName}) is an
            international, peer-reviewed, open-access journal dedicated to bringing
            diverse research streams into dialogue. We publish scholarship that advances
            theory, evidence, and practice—whether empirical, conceptual, or
            policy-oriented—across the social sciences and related interdisciplinary
            fields. Our double-blind peer-review process ensures rigorous, impartial
            evaluation, while our open-access model guarantees that knowledge reaches
            readers without barriers.
          </p>
          <p>
            The journal serves as a platform for scholars, researchers, and practitioners
            to present high-quality research that bridges traditional academic boundaries
            and encourages interdisciplinary dialogue. With a strong emphasis on academic
            rigour and integrity, it welcomes empirical studies, theoretical papers,
            review articles, and critical discussions.
          </p>
          <p>
            By integrating perspectives from both qualitative and quantitative domains,{" "}
            <strong>{siteConfig.name}</strong> aims to create a true confluence of ideas
            that address complex global challenges and contribute meaningfully to academic,
            technological, and policy advancements.
          </p>
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Aims &amp; scope
        </h2>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <p>
            The journal&apos;s name reflects our core commitment: a confluence of
            disciplines, perspectives, and regions. We welcome original research articles,
            review articles, and well-argued short communications that engage with
            contemporary debates and are accessible to a broad scholarly readership.
          </p>
          <p>
            The journal&apos;s multidisciplinary scope spans both social sciences,
            humanities, and STEM fields, including but not limited to:
          </p>
          <ul className="grid gap-2 pt-1 sm:grid-cols-2">
            {[
              "Anthropology & Sociology",
              "Psychology & Education",
              "Economics & Management",
              "Law, History & Cultural Studies",
              "Communication & Peace Studies",
              "Science, Technology, Engineering & Mathematics (STEM)",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--journal-accent)]"
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Publication &amp; access
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          All research content is published under an open-access license so readers may
          use and share published work in line with our{" "}
          <a className="text-[var(--journal-accent)] hover:underline" href="/about/open-access">
            open access policy
          </a>
          . The journal is dedicated to promoting accessibility and knowledge
          dissemination, ensuring that research is available to a global audience without
          barriers.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Audience
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          We serve researchers, doctoral students, educators, and professionals who rely
          on trustworthy, citable research. Our editorial team and reviewers work to
          maintain constructive feedback and timely decisions wherever possible.
        </p>
      </div>
    </AppShell>
  );
}
