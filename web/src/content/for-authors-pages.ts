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
          "Use the suggested word and page limits for your manuscript type in the Manuscript Templates page. Word limits exclude the abstract, references, tables, figures and appendices.",
          "Accepted article types include original research, review articles, research essays, policy papers, case studies, and other formats listed in the manuscript template library.",
        ],
      },
      {
        heading: "Formatting",
        paragraphs: [
          "Use Times New Roman, 11 pt, single line spacing, justified alignment, and continuous page numbering. Manuscripts must be written in English.",
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
          "Format the manuscript according to the template and the limits for your manuscript type under For Authors → Manuscript Templates.",
          `Send the blinded manuscript and separate title page in Microsoft Word format to ${siteConfig.email}`,
          "Track the application under My Submissions in the author dashboard.",
        ],
      },
      {
        heading: "Where to submit",
        paragraphs: [
          "Use For Authors → Submit Manuscript from the website navigation whenever you want to start a new journal submission.",
          "No article processing charge (APC) is charged during submission. The APC is charged only after acceptance.",
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
        paragraphs: ["No APC is charged during submission."],
      },
      {
        heading: "Direct Journal Publication Fees",
        paragraphs: [
          "These publication charges apply to manuscripts submitted directly to Global Confluence Review for journal publication and are separate from conference registration fees.",
          "National Authors: USD 150 + applicable GST.",
          "International Authors: USD 200.",
          "These charges apply to direct journal publication submissions and are not conference registration fees.",
          "The final payable amount in local currency may vary according to the payment provider’s applicable exchange rate and charges.",
          "The APC is charged only after acceptance. Conference registration payments are separate from journal APCs.",
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
          "See the full Plagiarism, Similarity and AI-Generated Content Policy under For Authors.",
        ],
      },
      {
        heading: "Generative AI",
        paragraphs: [
          "Authors remain fully responsible for the accuracy and integrity of their work. AI tools cannot be listed as authors. Material use of generative AI must be disclosed in the submission form (tool, purpose, sections affected, and author verification).",
          "AI must not be used to fabricate data, participants, findings, citations, or references. The AI-detection score of submitted manuscripts is expected to be below 20%; detection results are applied as one signal among others in editorial review.",
          "See the full Plagiarism, Similarity and AI-Generated Content Policy under For Authors.",
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
  "plagiarism-similarity-and-ai-policy": {
    title: "Plagiarism, Similarity and AI-Generated Content Policy",
    intro:
      "Global Confluence Review (GCR) is committed to maintaining academic integrity, originality, transparency, and ethical scholarly publishing. All manuscripts submitted to the journal must meet the journal's standards for originality, proper attribution, and responsible use of artificial intelligence (AI).",
    sections: [
      {
        heading: "1. Plagiarism and Originality",
        paragraphs: [
          "Authors must ensure that submitted manuscripts represent original scholarly work. All ideas, text, data, figures, tables, and other material obtained from external sources must be appropriately acknowledged and cited.",
          "Plagiarism includes, but is not limited to:",
        ],
        list: [
          "Copying text or ideas from another source without proper attribution.",
          "Presenting another person's research, findings, or work as one's own.",
          "Inadequately paraphrasing source material.",
          "Reusing previously published material without appropriate citation or disclosure.",
          "Submitting substantially overlapping or duplicate publications without proper disclosure.",
        ],
      },
      {
        heading: "2. Similarity Threshold",
        paragraphs: [
          "GCR requires manuscripts to have a text similarity score below 10%.",
          "All submitted manuscripts must undergo similarity screening using an appropriate plagiarism-detection tool. Manuscripts with a similarity score of 10% or higher may be returned to authors for revision or rejected, depending on the nature and extent of the overlap.",
          "A similarity score is an indicator for editorial assessment and does not, by itself, establish plagiarism. Editors may examine the similarity report in context, including whether matches arise from references, properly quoted material, standard terminology, common phrases, or methodological descriptions. Where appropriate, these exclusions may be applied consistently during assessment.",
          "Meeting the numerical threshold does not guarantee acceptance if plagiarism, unattributed reuse, or other publication ethics concerns are identified.",
        ],
      },
      {
        heading: "3. AI-Generated Content Policy",
        paragraphs: [
          "GCR requires the AI-detection score of submitted manuscripts to be below 20%, as measured using an appropriate AI-detection tool.",
          "Manuscripts with an AI-detection score of 20% or higher may be returned for clarification or revision, or rejected following editorial assessment.",
          "AI-detection scores are not definitive proof that a manuscript was generated by AI. Such tools can produce false positives and false negatives. Editors should consider the detection report alongside the manuscript, the author's disclosures, and other relevant evidence before making a decision.",
          "Authors remain fully responsible for the accuracy, originality, references, arguments, and conclusions in their manuscripts.",
        ],
      },
      {
        heading: "4. Responsible Use of Artificial Intelligence",
        paragraphs: [
          "Authors must disclose substantive use of generative AI tools in preparing manuscript content, where applicable under the journal's submission instructions. Such disclosure should identify the tool and describe its role in preparing the manuscript.",
          "AI tools must not be listed as authors. Authors are responsible for verifying all AI-assisted content, including references, quotations, factual claims, calculations, and research results. AI tools must not be used to fabricate data, sources, research findings, or citations.",
          "The use of AI for basic spelling, grammar, or language editing should be distinguished from generating substantive scholarly content.",
        ],
      },
      {
        heading: "5. Editorial Screening and Assessment",
        paragraphs: [
          "The editorial team may screen submissions for text similarity, potential plagiarism, and AI-generated content during initial assessment or peer review.",
          "Similarity and AI-detection results are screening indicators rather than conclusive findings. Editors may request explanations, revisions, supporting information, or additional evidence where concerns arise.",
          "The journal may reject a submission where significant ethical concerns remain unresolved, even if the numerical thresholds are met.",
        ],
      },
      {
        heading: "6. Handling Violations",
        paragraphs: ["Depending on the seriousness of the concern, the journal may:"],
        list: [
          "Request clarification or revised content.",
          "Return a manuscript for correction.",
          "Reject a submission.",
          "Investigate suspected misconduct in a published article.",
          "Publish a correction, expression of concern, or retraction where warranted.",
        ],
      },
      {
        paragraphs: [
          "Editorial decisions should be based on the evidence and the nature of the concern, rather than numerical scores alone.",
        ],
      },
      {
        heading: "7. Author Responsibilities",
        paragraphs: ["By submitting a manuscript to GCR, authors confirm that:"],
        list: [
          "The work is original or appropriately attributed.",
          "Sources and reused material are properly cited.",
          "Required disclosures concerning AI use are complete and accurate.",
          "The manuscript complies with the journal's similarity and AI-use requirements.",
          "They accept responsibility for the integrity and accuracy of the submitted work.",
        ],
      },
      {
        heading: "8. Policy Updates",
        paragraphs: [
          "Global Confluence Review may revise this policy as scholarly publishing standards, screening tools, and publication ethics practices evolve. Authors are responsible for reviewing the applicable policies and submission instructions before submitting a manuscript.",
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
          "AI must not be used to fabricate data, participants, findings, citations, or references. The AI-detection score of submitted manuscripts is expected to be below 20%; detection results are applied as one signal among others in editorial review.",
          "See the full Plagiarism, Similarity and AI-Generated Content Policy under For Authors.",
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
