import Link from "next/link";
import {
  MANUSCRIPT_TEMPLATE_ZIP,
  manuscriptTemplateDownloads,
} from "@/lib/manuscript-templates";

const manuscriptWordLimits = [
  ["Original Research Article", "5,000–10,000 words", "10–20 pages (up to 25 pages if necessary)"],
  ["Narrative Review Article", "6,000–10,000 words", "20–30 pages"],
  ["Systematic Review", "6,000–9,000 words", "20–30 pages"],
  ["Bibliometric / Scientometric Study", "5,000–8,000 words", "15–25 pages"],
  ["Policy Paper", "3,500–6,000 words", "12–20 pages"],
  ["Research Essay", "2,500–4,500 words", "8–15 pages"],
  ["Conceptual / Theoretical Paper", "4,000–7,000 words", "12–22 pages"],
  ["Case Study", "3,000–5,500 words", "10–18 pages"],
  ["Commentary / Perspective", "1,500–3,000 words", "5–10 pages"],
  ["Book Review", "1,000–2,000 words", "3–6 pages"],
  ["Research Proposal", "2,500–5,000 words", "8–15 pages"],
  ["Research Note / Short Communication", "1,500–3,000 words", "4–8 pages"],
] as const;

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
      <section className="mt-10" aria-labelledby="manuscript-formatting-heading">
        <h2
          id="manuscript-formatting-heading"
          className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
        >
          Manuscript Formatting
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
          <li>Font: Times New Roman</li>
          <li>Font Size: 11 pt</li>
          <li>Line Spacing: Single</li>
          <li>Justified alignment</li>
          <li>APA 7th Edition referencing</li>
          <li>Continuous page numbering</li>
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="word-limit-table-heading">
        <h2
          id="word-limit-table-heading"
          className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
        >
          Word Limit Table
        </h2>
        <div className="mt-4 overflow-x-auto rounded border border-[var(--journal-border)]">
          <table className="min-w-[760px] border-collapse text-left text-sm text-[var(--journal-body)]">
            <thead className="bg-[var(--journal-hero-bg)] text-[var(--journal-heading)]">
              <tr>
                <th className="border-b border-[var(--journal-border)] px-4 py-3 font-semibold">
                  Manuscript Type
                </th>
                <th className="border-b border-[var(--journal-border)] px-4 py-3 font-semibold">
                  Suggested Word Limit (excluding abstract, references, tables, figures and
                  appendices)
                </th>
                <th className="border-b border-[var(--journal-border)] px-4 py-3 font-semibold">
                  Suggested Page Limit
                </th>
              </tr>
            </thead>
            <tbody>
              {manuscriptWordLimits.map(([type, words, pages]) => (
                <tr key={type} className="border-b border-[var(--journal-border)] last:border-b-0">
                  <th className="px-4 py-3 font-medium text-[var(--journal-heading)]">{type}</th>
                  <td className="px-4 py-3">{words}</td>
                  <td className="px-4 py-3">{pages}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="manuscript-general-notes-heading">
        <h2
          id="manuscript-general-notes-heading"
          className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
        >
          General Notes
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
          <li>Abstract: 200–300 words</li>
          <li>Keywords: 4–6</li>
          <li>References: APA 7th Edition</li>
          <li>Maximum 10 tables/figures combined</li>
          <li>Additional files may be uploaded as supplementary files.</li>
          <li>Word limits exclude abstract, references, tables, figures and appendices.</li>
        </ul>
      </section>
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
