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
        <p className="mt-3 text-center text-sm text-[var(--journal-muted)]">
          {[siteConfig.issn && `ISSN ${siteConfig.issn}`, siteConfig.tagline]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
    </div>
  );
}
