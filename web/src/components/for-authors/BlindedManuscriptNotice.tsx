import { siteConfig } from "@/lib/site-config";

export function BlindedManuscriptNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5 ${className}`}
      aria-labelledby="blinded-manuscript-heading"
    >
      <h2
        id="blinded-manuscript-heading"
        className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
      >
        Blinded manuscript submission
      </h2>
      <p className="mt-3 text-[15px] font-medium text-[var(--journal-heading)]">
        Authors must submit:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[var(--journal-body)]">
        <li>A blinded manuscript</li>
        <li>A separate title page</li>
      </ul>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Email:{" "}
        <a
          href={`mailto:${siteConfig.email}`}
          className="break-all text-[var(--journal-accent)] underline"
        >
          {siteConfig.email}
        </a>
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        The blinded manuscript must not contain author names, affiliations, acknowledgements or
        identifying information.
      </p>
      <p className="mt-4 text-[15px] font-medium text-[var(--journal-heading)]">
        The title page must include:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[15px] text-[var(--journal-body)]">
        <li>Paper title</li>
        <li>Author(s)</li>
        <li>Affiliation</li>
        <li>ORCID (optional)</li>
        <li>Email</li>
        <li>Corresponding author</li>
      </ul>
    </aside>
  );
}
