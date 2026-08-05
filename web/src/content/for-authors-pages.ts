import type { ContentSection } from "@/components/layout/StaticContentPage";
import { siteConfig } from "@/lib/site-config";

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
    intro: "Sign in to the author dashboard to submit your research.",
    sections: [
      {
        heading: "Journal submission workflow",
        paragraphs: [
          "Authors can begin from the For Authors menu by selecting Submit Manuscript.",
        ],
        list: [
          "Complete the registration form to create your GCR account, then sign in.",
          "Open the author dashboard and select New Submission.",
          "Choose Submit for Journal Publication.",
          "Enter all required details, including the paper title, abstract, research category, and affiliation.",
          "Review the information and submit your application.",
          "Format the manuscript according to the template provided under For Authors → Manuscript Templates. Use 11-point Times New Roman, and keep the paper within 20 pages, including references.",
          `Send the complete manuscript in Microsoft Word format to ${siteConfig.email}. Include your name, paper title, and affiliation in the email.`,
          "Track the application under My Submissions in the author dashboard.",
        ],
      },
      {
        heading: "Where to submit",
        paragraphs: [
          "Use For Authors → Submit Manuscript from the website navigation whenever you want to start a new journal submission.",
          "Payment of an article processing charge is only requested after the relevant editorial stage—not at initial submission.",
        ],
      },
    ],
  },
  "publication-fees": {
    title: "Publication fees and fee waivers",
    intro:
      "Fees support open-access publication and editorial processing. Payment and waiver requests never influence editorial decisions.",
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
      {
        heading: "Need-based fee waivers",
        paragraphs: [
          "Authors without institutional support may request a waiver. Requests are confidential and reviewed by authorised editors.",
          `To request a partial or full waiver, email the editor at ${siteConfig.email} and briefly explain your circumstances.`,
          "Waiver statuses: Requested → Under review → Approved → Partially approved → Declined.",
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
          `To request a partial or full waiver, email the editor at ${siteConfig.email} and briefly explain your circumstances.`,
          "Waiver statuses: Requested → Under review → Approved → Partially approved → Declined.",
        ],
      },
    ],
  },
  "plagiarism-policy": {
    title: "Author policies",
    intro:
      "Authors must follow these policies on originality, responsible AI use, conflicts of interest, author rights, corrections, and appeals.",
    sections: [
      {
        heading: "Plagiarism and similarity checking",
        paragraphs: [
          "Overall similarity is expected to be below 10%, but percentage alone does not determine misconduct. Editors consider source, location, citation, and the nature of matching text.",
          "Turnitin or an equivalent report is required at submission. The journal does not claim automated Turnitin API integration unless a licensed integration is configured.",
        ],
      },
      {
        heading: "Generative AI",
        paragraphs: [
          "Authors remain fully responsible for the accuracy and integrity of their work. AI tools cannot be listed as authors. Material use of generative AI must be disclosed in the submission form (tool, purpose, sections affected, and author verification).",
          "AI must not be used to fabricate data, participants, findings, citations, or references. A Turnitin report is requested; stated AI-detection thresholds are applied as one signal among others in editorial review.",
        ],
      },
      {
        heading: "Conflicts of interest",
        paragraphs: [
          "All authors must disclose financial and non-financial conflicts that could influence the work. Undisclosed conflicts undermine trust. Editors and reviewers must decline or disclose conflicts that could bias their judgment.",
        ],
      },
      {
        heading: "Author rights and self-archiving",
        paragraphs: [
          "Authors retain copyright under the journal’s open-access licence. Accepted articles are published under Creative Commons Attribution 4.0 International (CC BY 4.0) unless otherwise stated. Authors may share accepted manuscripts in repositories in line with the licence and any funder requirements.",
        ],
      },
      {
        heading: "Corrections, retractions and withdrawal",
        paragraphs: [
          "The journal follows COPE-aligned practices for maintaining the scholarly record. Honest errors may be corrected through errata or corrigenda. Retractions are used for serious misconduct or unreliability. Authors may request withdrawal before acceptance through the editorial office with written justification.",
        ],
      },
      {
        heading: "Complaints and appeals",
        paragraphs: [
          "Authors may appeal editorial decisions or report concerns about the process. Send a concise appeal or complaint to the editorial email, including manuscript ID, title, and grounds for review. The managing editor will acknowledge receipt and respond according to journal policy.",
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
