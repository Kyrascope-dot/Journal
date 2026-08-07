import { AppShell } from "@/components/layout/AppShell";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function OpenAccessPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Open access policy
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          {siteConfig.name} is an <strong>open-access</strong> journal. Published articles
          are freely available to read, download, and share under the terms of the license
          below, without subscription or paywall barriers for the reader.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Copyright and licensing
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Unless otherwise noted, articles are published under the{" "}
          <a
            className="text-[var(--journal-accent)] hover:underline"
            href={siteConfig.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Creative Commons Attribution 4.0 International License ({siteConfig.license})
          </a>
          . This allows others to copy, distribute, remix, and build upon the work,
          including for commercial purposes, provided they give appropriate credit, link
          to the license, and indicate if changes were made.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Author rights
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          Authors retain copyright of their work. By publishing with us, authors grant
          the journal the right to publish and distribute the article under the chosen
          license. Authors may post versions of their article on personal or institutional
          repositories in line with the license and any funder requirements.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Article processing charges (APCs)
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          No APC is charged during submission. The applicable APC is charged only after
          acceptance and does not influence editorial decisions or guarantee publication.
        </p>
        <FeeWaiverNotice className="mt-8" />

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Archiving
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          We intend to preserve content through stable URLs and, where appropriate,
          participation in trusted archiving services so that scholarship remains
          discoverable over time.
        </p>
        </div>
      </div>
    </AppShell>
  );
}
