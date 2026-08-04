import type { ContentSection } from "@/components/layout/StaticContentPage";

export type ForAuthorsPageContent = {
  title: string;
  intro: string;
  sections: ContentSection[];
};

export const forAuthorsPages: Record<string, ForAuthorsPageContent> = {
  "author-guidelines": {
    title: "Author guidelines",
    intro:
      "Authors should prepare manuscripts using GCR templates and follow the policies below. Submission does not guarantee acceptance; all work is subject to editorial and peer review.",
    sections: [
      {
        heading: "Manuscript length and article types",
        paragraphs: [
          "Unless the editorial office specifies otherwise, manuscripts should not exceed 20 pages (including references, tables, and figures).",
          "Accepted article types include original research, review articles, research essays, policy papers, case studies, and other formats listed in the manuscript template library.",
        ],
      },
      {
        heading: "Formatting",
        paragraphs: [
          "Use Times New Roman, 11 pt for the main text. Manuscripts must be written in English.",
          "Include a structured abstract, keywords, clear section headings, and references in APA 7th edition.",
        ],
        list: [
          "Title page with author affiliations (separate from blinded manuscript where required)",
          "Blinded manuscript for double-blind review",
          "Ethics, funding, conflict-of-interest, and AI-use disclosures",
          "Turnitin or similarity report at submission",
        ],
      },
    ],
  },
  "submission-checklist": {
    title: "Submission checklist",
    intro: "Complete this checklist before submitting via the author dashboard or editorial email.",
    sections: [
      {
        paragraphs: [],
        list: [
          "Manuscript matches an approved GCR template and article type",
          "English language; Times New Roman 11 pt",
          "Abstract and keywords provided",
          "References in APA 7th edition",
          "Blinded manuscript and separate title page",
          "Turnitin/similarity report uploaded",
          "Ethics and AI-use disclosures completed",
          "CC BY 4.0 licence consent ready for acceptance stage",
        ],
      },
    ],
  },
  "submit-manuscript": {
    title: "Submit manuscript",
    intro:
      "Sign in to the author dashboard to start a structured submission. Until the full workflow is live, you may email the editorial office with your files.",
    sections: [
      {
        paragraphs: [
          "Use the author dashboard to save drafts, upload files, and track status. Payment of an article processing charge is only requested after editorial stages that require it—not at initial submission.",
        ],
      },
    ],
  },
  "publication-fees": {
    title: "Publication fees",
    intro: "Fees support open-access publication and editorial processing. Payment never influences editorial decisions.",
    sections: [
      {
        heading: "Submission fee",
        paragraphs: ["No initial submission fee."],
      },
      {
        heading: "Article processing charge (APC)",
        paragraphs: [
          "National scholars in India: USD 150.",
          "International scholars: USD 200.",
          "The final payable amount in local currency may vary according to the payment provider’s applicable exchange rate and charges.",
          "An APC is requested only after the relevant editorial stage. Conference registration payments are separate from journal APCs.",
        ],
      },
    ],
  },
  "fee-waiver-policy": {
    title: "Need-based fee waiver policy",
    intro:
      "Authors without institutional support may request a waiver. Requests are confidential and reviewed by authorised editors.",
    sections: [
      {
        paragraphs: [
          "Waiver statuses: Requested → Under review → Approved → Partially approved → Declined.",
          "A waiver request form will be available in the author dashboard (implementation in progress).",
        ],
      },
    ],
  },
  "plagiarism-policy": {
    title: "Plagiarism and similarity-checking policy",
    intro: "Authors must submit a similarity report with their manuscript.",
    sections: [
      {
        paragraphs: [
          "Overall similarity is expected to be below 10%, but percentage alone does not determine misconduct. Editors consider source, location, citation, and the nature of matching text.",
          "Turnitin or an equivalent report is required at submission. The journal does not claim automated Turnitin API integration unless a licensed integration is configured.",
        ],
      },
    ],
  },
  "generative-ai-policy": {
    title: "Generative AI policy",
    intro: "Authors remain fully responsible for accuracy and integrity of their work.",
    sections: [
      {
        paragraphs: [
          "AI tools cannot be listed as authors. Material use of generative AI must be disclosed in the submission form (tool, purpose, sections affected, and author verification).",
          "AI must not be used to fabricate data, participants, findings, citations, or references. A Turnitin report is requested; stated AI-detection thresholds are applied as one signal among others in editorial review.",
        ],
      },
    ],
  },
  "conflict-of-interest-policy": {
    title: "Conflict-of-interest policy",
    intro: "All authors must disclose financial and non-financial conflicts that could influence the work.",
    sections: [
      {
        paragraphs: [
          "Undisclosed conflicts undermine trust. Editors and reviewers must decline or disclose conflicts that could bias their judgment.",
        ],
      },
    ],
  },
  "author-rights-and-self-archiving": {
    title: "Author rights and self-archiving",
    intro: "Authors retain copyright under the journal’s open-access licence.",
    sections: [
      {
        paragraphs: [
          "Accepted articles are published under Creative Commons Attribution 4.0 International (CC BY 4.0) unless otherwise stated. Authors may share accepted manuscripts in repositories in line with the licence and any funder requirements.",
        ],
      },
    ],
  },
  "corrections-retractions-and-withdrawal": {
    title: "Corrections, retractions and withdrawal",
    intro: "The journal follows COPE-aligned practices for maintaining the scholarly record.",
    sections: [
      {
        paragraphs: [
          "Honest errors may be corrected through errata or corrigenda. Retractions are used for serious misconduct or unreliability. Authors may request withdrawal before acceptance through the editorial office with written justification.",
        ],
      },
    ],
  },
  "complaints-and-appeals": {
    title: "Complaints and appeals",
    intro: "Authors may appeal editorial decisions or report concerns about the process.",
    sections: [
      {
        paragraphs: [
          "Send a concise appeal or complaint to the editorial email, including manuscript ID, title, and grounds for review. The managing editor will acknowledge receipt and respond according to journal policy.",
        ],
      },
    ],
  },
};

export const forAuthorsSlugs = Object.keys(forAuthorsPages);
