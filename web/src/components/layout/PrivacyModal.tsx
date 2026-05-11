"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  {
    heading: "1. Information We Collect",
    body: `We may collect the following types of information:\n\na) Personal Information\nWhen users submit research papers, register accounts, contact us, or subscribe to updates, we may collect:\n• Full name\n• Email address\n• Institutional affiliation\n• Phone number (if provided)\n• Postal address\n• Academic qualifications\n• Manuscripts and research papers\n\nb) Technical Information\nWhen visitors browse our website, we may automatically collect:\n• IP address\n• Browser type\n• Device information\n• Operating system\n• Referring URLs\n• Pages visited\n• Access time and date\n\nc) Cookies and Analytics\nOur website may use cookies and analytics tools to improve user experience and website performance.`,
  },
  {
    heading: "2. How We Use Information",
    body: `We use collected information for the following purposes:\n• Managing manuscript submissions and peer review\n• Communicating with authors, reviewers, and readers\n• Publishing accepted research articles\n• Improving website functionality and security\n• Maintaining academic records\n• Sending journal updates or notifications\n• Preventing fraud, plagiarism, and misuse`,
  },
  {
    heading: "3. Research Paper Submissions",
    body: `Authors submitting manuscripts agree that:\n• Submitted content may be reviewed by editors and peer reviewers.\n• Accepted papers may be published on the journal website.\n• Metadata such as author names, affiliations, abstracts, and keywords may become publicly accessible after publication.\n• Authors are responsible for ensuring that submitted content does not violate copyright or third-party rights.`,
  },
  {
    heading: "4. Data Sharing and Disclosure",
    body: `We do not sell or rent personal information to third parties. We may share information only:\n• With editors and peer reviewers for academic evaluation\n• When required by law or legal process\n• To protect journal rights, security, or integrity\n• With trusted service providers assisting website operations`,
  },
  {
    heading: "5. Data Security",
    body: `We implement reasonable technical and organizational measures to protect personal data against unauthorized access, loss, misuse, or alteration.\n\nHowever, no internet-based system is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    heading: "6. Cookies Policy",
    body: `Our website may use cookies to:\n• Remember user preferences\n• Improve browsing experience\n• Analyze website traffic\n• Enhance security\n\nUsers may disable cookies through browser settings if desired.`,
  },
  {
    heading: "7. Third-Party Services",
    body: `Our website may contain links to external websites, indexing services, databases, or third-party platforms. We are not responsible for the privacy practices of those external services.\n\nExamples may include:\n• Google Scholar\n• Crossref\n• ORCID\n• Indexing databases`,
  },
  {
    heading: "8. Children's Privacy",
    body: `Our services are intended for researchers, scholars, academicians, and adults. We do not knowingly collect personal information from children under the age of 13.`,
  },
  {
    heading: "9. Intellectual Property",
    body: `All published articles, website content, logos, and journal materials remain protected under applicable copyright and intellectual property laws unless otherwise specified.\n\nAuthors retain rights according to the journal's publication policy.`,
  },
  {
    heading: "10. User Rights",
    body: `Users may request to:\n• Access their personal data\n• Correct inaccurate information\n• Remove personal information where legally permissible\n• Withdraw consent for communications\n\nRequests may be submitted via the contact email below.`,
  },
  {
    heading: "11. Changes to This Privacy Policy",
    body: `We reserve the right to update or modify this Privacy Policy at any time. Changes will be posted on this page with the revised effective date.`,
  },
  {
    heading: "12. Contact Information",
    body: `For questions regarding this Privacy Policy or data practices, contact:\n\nGlobal Confluence Review\nEmail: editorglobalconfluencereview@gmail.com\nWebsite: www.globalconfluencereview.in\nAddress: Delhi, India`,
  },
];

export function PrivacyModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:underline focus:outline-none"
      >
        Privacy Policy
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="privacy-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[var(--journal-border)] bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--journal-border)] px-6 py-5">
              <div>
                <h2
                  id="privacy-title"
                  className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
                >
                  Privacy Policy
                </h2>
                <p className="mt-1 text-xs text-[var(--journal-muted)]">
                  Effective Date: May 2, 2026
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-4 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto px-6 py-6 text-sm leading-relaxed text-[var(--journal-body)]">
              <p className="mb-6 text-[var(--journal-muted)]">
                Welcome to{" "}
                <strong className="text-[var(--journal-heading)]">Global Confluence Review</strong>{" "}
                ("Journal", "we", "our", or "us"). This Privacy Policy explains how we collect, use, store, and protect
                information provided by authors, reviewers, scholars, readers, and visitors through our website:{" "}
                <a
                  href="https://www.globalconfluencereview.in"
                  className="text-[var(--journal-accent)] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.globalconfluencereview.in
                </a>
                .
              </p>
              <p className="mb-8 text-[var(--journal-muted)]">
                By accessing or using our website, you agree to the practices described in this Privacy Policy.
              </p>

              <div className="space-y-7">
                {SECTIONS.map((s) => (
                  <div key={s.heading}>
                    <h3 className="font-serif font-semibold text-[var(--journal-heading)]">
                      {s.heading}
                    </h3>
                    <div className="mt-2 whitespace-pre-line text-[var(--journal-body)]">
                      {s.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[var(--journal-border)] px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
