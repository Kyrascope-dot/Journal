import Link from "next/link";
import {
  MANUSCRIPT_TEMPLATE_ZIP,
  manuscriptTemplateDownloads,
} from "@/lib/manuscript-templates";

export function ManuscriptTemplatesList() {
  return (
    <>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Prepare your submission using the <strong>GCR Complete Manuscript Template Pack</strong>.
        Download the full pack (Word and PDF examples) or open the Word template that matches
        your submission type.
      </p>
      <p className="mt-4">
        <a
          href={MANUSCRIPT_TEMPLATE_ZIP}
          download
          className="inline-flex items-center gap-2 rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-95"
        >
          Download complete template pack (ZIP)
        </a>
      </p>
      <ul className="mt-6 space-y-2 text-sm text-[var(--journal-body)]">
        {manuscriptTemplateDownloads.map((item) => (
          <li key={item.href}>
            <a className="text-[var(--journal-accent)] hover:underline" href={item.href} download>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-sm text-[var(--journal-body)]">
        <Link href="/for-authors/author-guidelines" className="text-[var(--journal-accent)] hover:underline">
          Author guidelines
        </Link>
        {" · "}
        <Link href="/dashboard" className="text-[var(--journal-accent)] hover:underline">
          Submit manuscript
        </Link>
      </p>
    </>
  );
}
