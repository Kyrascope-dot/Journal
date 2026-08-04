import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export function JournalBanner() {
  return (
    <div className="border-b border-[var(--journal-border)] bg-gradient-to-b from-[var(--journal-hero-bg)] to-white">
      <div className={`${contentShell} py-10`}>
        <h1 className="text-center font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--journal-heading)] sm:text-4xl">
          {siteConfig.name}{" "}
          <span className="whitespace-nowrap font-normal">({siteConfig.shortName})</span>
        </h1>
        {siteConfig.issn ? (
          <p className="mt-3 text-center text-sm font-medium tracking-wide text-[var(--journal-heading)]">
            ISSN: {siteConfig.issn}
          </p>
        ) : null}
        <p
          className={`text-center text-sm text-[var(--journal-muted)] ${siteConfig.issn ? "mt-2" : "mt-3"}`}
        >
          {siteConfig.tagline}
        </p>
      </div>
    </div>
  );
}
