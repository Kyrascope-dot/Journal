"use client";

import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  {
    heading: "1. Eligibility",
    body: `By using this website, you confirm that:\n• You are at least 18 years old or legally authorized to submit academic work.\n• The information you provide is accurate and complete.\n• You have the legal right to submit the manuscript or content.`,
  },
  {
    heading: "2. Journal Services",
    body: `Our journal provides services including:\n• Research paper submission\n• Editorial review\n• Peer review process\n• Academic publication\n• Journal communication and indexing support\n\nWe reserve the right to modify, suspend, or discontinue any service without prior notice.`,
  },
  {
    heading: "3. Manuscript Submission",
    body: `By submitting a manuscript to the journal, authors agree that:\n• The submitted work is original.\n• The manuscript has not been published elsewhere unless clearly disclosed.\n• The manuscript is not under consideration by another journal simultaneously.\n• Proper citations and acknowledgments have been provided.\n• All co-authors have approved the submission.\n\nThe journal may reject or remove submissions that violate ethical or academic standards.`,
  },
  {
    heading: "4. Peer Review Process",
    body: `Submitted manuscripts may undergo editorial screening and peer review. The journal reserves the right to:\n• Accept or reject submissions\n• Request revisions\n• Assign reviewers and editors\n• Edit formatting and presentation for publication purposes\n\nEditorial decisions made by the journal are final.`,
  },
  {
    heading: "5. Publication Ethics",
    body: `Authors must comply with academic and publication ethics, including:\n• No plagiarism\n• No fabricated or falsified data\n• No copyright infringement\n• No unethical research practices\n\nThe journal may retract published articles found to violate ethical standards.`,
  },
  {
    heading: "6. Intellectual Property Rights",
    body: `a) Author Rights\nAuthors retain ownership of their original work unless otherwise agreed.\n\nb) Journal Rights\nBy submitting content, authors grant the journal a non-exclusive right to review, edit, publish, archive, and distribute the accepted manuscript. Published articles may appear on the journal website and associated academic platforms.`,
  },
  {
    heading: "7. User Conduct",
    body: `Users agree not to:\n• Submit false or misleading information\n• Upload malicious software or harmful content\n• Attempt unauthorized access to the website\n• Interfere with website security or operations\n• Use the platform for unlawful purposes\n\nViolation of these rules may result in account suspension or permanent restriction.`,
  },
  {
    heading: "8. Fees and Payments",
    body: `If publication or processing fees apply:\n• Applicable charges will be clearly communicated.\n• Fees once paid may be non-refundable unless stated otherwise.\n• The journal reserves the right to revise fees at any time.`,
  },
  {
    heading: "9. Disclaimer",
    body: `The journal provides content for academic and informational purposes only. We do not guarantee:\n• Publication acceptance\n• Indexing approval\n• Citation performance\n• Accuracy of third-party content\n\nOpinions expressed in published articles belong solely to the respective authors.`,
  },
  {
    heading: "10. Limitation of Liability",
    body: `To the maximum extent permitted by law, the journal shall not be liable for:\n• Data loss\n• Publication delays\n• Technical interruptions\n• Indirect or consequential damages\n• Errors in published materials\n\nUsers access and use the website at their own risk.`,
  },
  {
    heading: "11. Third-Party Links",
    body: `Our website may contain links to third-party services or academic platforms. We are not responsible for the content, policies, or practices of external websites.`,
  },
  {
    heading: "12. Privacy",
    body: `Your use of our website is also governed by our Privacy Policy.`,
  },
  {
    heading: "13. Termination",
    body: `We reserve the right to suspend or terminate access to our services if users violate these Terms or engage in unethical or unlawful activities.`,
  },
  {
    heading: "14. Changes to Terms",
    body: `We may update these Terms at any time. Updated versions will be posted on this page with the revised effective date. Continued use of the website after updates constitutes acceptance of the revised Terms.`,
  },
  {
    heading: "15. Governing Law",
    body: `These Terms shall be governed and interpreted in accordance with the laws of Indian Judiciary. Any disputes arising from these Terms shall fall under the jurisdiction of the appropriate courts of India.`,
  },
  {
    heading: "16. Contact Information",
    body: `For questions regarding these Terms, contact:\n\nGlobal Confluence Review\nEmail: editorglobalconfluencereview@gmail.com\nWebsite: www.globalconfluencereview.in\nAddress: Delhi, India`,
  },
];

export function TermsModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while modal is open
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
        Terms of Service
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tos-title"
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
                  id="tos-title"
                  className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
                >
                  Terms of Service
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
                Welcome to <strong className="text-[var(--journal-heading)]">Global Confluence Review</strong>{" "}
                ("Journal", "we", "our", or "us"). These Terms of Service ("Terms") govern your access to and use of our website located at{" "}
                <a href="https://www.globalconfluencereview.in" className="text-[var(--journal-accent)] hover:underline" target="_blank" rel="noopener noreferrer">
                  www.globalconfluencereview.in
                </a>{" "}
                and all related journal services, including manuscript submission, peer review, publication, and academic communication.
              </p>
              <p className="mb-8 text-[var(--journal-muted)]">
                By accessing or using our website, you agree to comply with these Terms. If you do not agree, please do not use our services.
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
