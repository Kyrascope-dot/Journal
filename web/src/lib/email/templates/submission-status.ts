import { siteConfig } from "@/lib/site-config";
import {
  conferenceAcceptedEmailFeeIncludes,
  publicationOpportunityLead,
} from "@/lib/conference-content";
import { featuredConference } from "@/lib/conference-config";
import type {
  ConferenceAwardIntent,
  SubmissionPurpose,
  SubmissionStatus,
} from "@/types/dashboard";

export type SubmissionEmailTemplateKey =
  | "conference_abstract_accepted"
  | "conference_abstract_rejected"
  | "conference_submission_received"
  | "journal_submission_received"
  | "journal_desk_rejected"
  | "journal_peer_review"
  | "journal_revision_required"
  | "journal_accepted"
  | "journal_rejected";

export type SubmissionEmailContext = {
  authorName: string;
  authorEmail: string;
  registrationId: string;
  paperTitle: string;
  submissionDate: string;
  currentStatus: string;
  submissionPurpose: SubmissionPurpose;
  conferenceAwardIntent: ConferenceAwardIntent | null;
  dashboardUrl: string;
  logoUrl: string;
};

export type RenderedSubmissionEmail = {
  key: SubmissionEmailTemplateKey;
  recipient: string;
  subject: string;
  html: string;
  text: string;
};

type TemplateSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

type TemplateContent = {
  subject: string;
  opening: string[];
  sections?: TemplateSection[];
  nextSteps?: string[];
  closing: string[];
  includeMetadataTable?: boolean;
  includeRegards?: boolean;
  actionLinks?: { label: string; url: string }[];
  signatureLines?: string[];
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function conferenceAcceptedContent(
  context: SubmissionEmailContext
): TemplateContent {
  const paymentUrl = `${siteConfig.siteUrl}/conferences/payment`;
  const sections: TemplateSection[] = [
    {
      heading: "Conference Registration Fee Includes",
      list: [...conferenceAcceptedEmailFeeIncludes],
    },
    {
      heading: "Publication Opportunity",
      paragraphs: [
        publicationOpportunityLead,
        "Please note that conference registration or payment does not guarantee publication.",
        "All submitted manuscripts will be subject to the journal's applicable double-blind peer-review process, plagiarism screening, editorial evaluation, author revisions where required, publication ethics, journal scope, quality standards, and publication schedule.",
      ],
    },
    {
      heading: "Registration Fee & GST",
      paragraphs: [
        "For National Participants:",
        "Registration Fee: USD 150",
        "GST (18%): USD 27",
        "Total Conference Registration Fee: USD 177",
        "The USD 177 amount includes 18% GST applicable to the conference registration fee.",
        "For International Participants:",
        "Conference Registration Fee: USD 200",
      ],
    },
    {
      heading: "Payment Options",
      paragraphs: [
        "Razorpay: Secure payment using the supported payment methods available through Razorpay.",
        "PayPal: Available as an alternative payment option, particularly for international participants.",
      ],
    },
    {
      heading: "Razorpay Payment Note",
      paragraphs: [
        "Razorpay may apply an additional payment processing/convenience fee, where applicable. Any such payment gateway charge is separate from the GCR conference registration fee and applicable GST.",
        "The applicable Razorpay charge, if any, will be displayed during Razorpay checkout before the payment is completed. Therefore, the final amount charged by Razorpay may be higher than the stated GCR registration amount.",
      ],
    },
    {
      heading: "Complete Your Registration Payment",
      paragraphs: [
        "Please complete your registration payment using the secure GCR conference payment page linked below.",
        "After completing the payment, please retain your payment confirmation or receipt for your records.",
      ],
    },
    {
      heading: "Conference Schedule",
      list: [
        `GCR Colloquia/Workshop: ${featuredConference.colloquiaDateLabel}`,
        featuredConference.colloquiaTime,
        `GCR International Conference: ${featuredConference.datesLabel}`,
        featuredConference.conferenceTime,
        `Mode: ${featuredConference.mode}`,
        `Registration deadline: ${featuredConference.registrationDeadline}`,
      ],
      paragraphs: [
        "We request all accepted authors to complete their registration within the stipulated registration period to confirm their participation.",
      ],
    },
  ];

  if (
    context.conferenceAwardIntent === "best_paper" ||
    context.conferenceAwardIntent === "both"
  ) {
    sections.splice(1, 0, {
      heading: "Best Paper Award",
      paragraphs: [
        `For scholars who have opted for the Best Paper Award, please submit your title page and blinded manuscript to the Editorial Office at ${siteConfig.email} for further consideration.`,
      ],
    });
  }

  return {
    subject: "Payment Link – GCR International Conference Q3 July–September 2026",
    includeMetadataTable: false,
    includeRegards: false,
    opening: [
      "Congratulations!",
      `We are pleased to inform you that your abstract, “${context.paperTitle}”, has been accepted for presentation at the GCR International Conference – Q3 July–September 2026.`,
      "We are delighted to have your research as part of the conference and look forward to your participation.",
    ],
    sections,
    actionLinks: [{ label: "Complete Registration Payment", url: paymentUrl }],
    closing: [
      "We look forward to welcoming you and your research to the GCR International Conference Q3 July–September 2026.",
      "Warm regards,",
    ],
    signatureLines: [
      "GCR Conference & Editorial Team",
      "Global Confluence Review (GCR)",
    ],
  };
}

const TEMPLATE_CONTENT: Record<
  Exclude<SubmissionEmailTemplateKey, "conference_abstract_accepted">,
  (context: SubmissionEmailContext) => TemplateContent
> = {
  conference_submission_received: (context) => ({
    subject: `Conference Submission Received | Registration ID ${context.registrationId}`,
    opening: [
      "Thank you for submitting your abstract to the Global Confluence Review International Conference.",
      "Your abstract has been received and will undergo editorial screening.",
    ],
    nextSteps: [
      "Track the current status in your Author Dashboard.",
      "You will receive an email when an editorial decision is recorded.",
    ],
    closing: ["We appreciate your interest in the conference."],
  }),
  conference_abstract_rejected: (context) => ({
    subject: `Conference Submission Update | Registration ID ${context.registrationId}`,
    opening: [
      "Thank you for submitting your abstract.",
      `After careful evaluation, we regret to inform you that your submission “${context.paperTitle}” has not been selected.`,
    ],
    nextSteps: [
      "We sincerely appreciate your interest and encourage you to participate in future conferences.",
    ],
    closing: ["Thank you for considering Global Confluence Review."],
  }),
  journal_submission_received: (context) => ({
    subject: `Journal Submission Received | Registration ID ${context.registrationId}`,
    opening: [
      "Thank you for submitting your manuscript to Global Confluence Review.",
      "Your manuscript has successfully entered the editorial screening process.",
      "You will receive further updates as the review progresses.",
      "Current Status: Editorial Screening",
    ],
    nextSteps: [
      "Track the submission in your Author Dashboard.",
      "Keep your Registration ID for all future correspondence.",
    ],
    closing: ["Thank you for choosing Global Confluence Review."],
  }),
  journal_desk_rejected: (context) => ({
    subject: `Editorial Decision | Registration ID ${context.registrationId}`,
    opening: [
      "Thank you for submitting your manuscript.",
      `After editorial screening, your manuscript “${context.paperTitle}” has not been considered suitable for publication in Global Confluence Review because it does not sufficiently align with the journal’s aims and scope.`,
      "This decision has been made prior to peer review.",
    ],
    nextSteps: [
      "We encourage you to consider another journal better aligned with your work.",
    ],
    closing: ["Thank you for considering Global Confluence Review."],
  }),
  journal_peer_review: (context) => ({
    subject: `Manuscript Sent for Peer Review | Registration ID ${context.registrationId}`,
    opening: [
      `We are pleased to inform you that your manuscript “${context.paperTitle}” has successfully passed the editorial screening stage.`,
      "Your manuscript has now been forwarded for double-blind peer review.",
      "The identities of authors and reviewers remain confidential throughout the process.",
    ],
    nextSteps: [
      "You will be informed once reviewer reports are received.",
      "Continue to monitor your Author Dashboard for updates.",
    ],
    closing: ["Thank you for your patience during peer review."],
  }),
  journal_revision_required: (context) => ({
    subject: `Revision Requested | Registration ID ${context.registrationId}`,
    opening: [
      `Following peer review, your manuscript “${context.paperTitle}” requires revision before a final editorial decision.`,
    ],
    nextSteps: [
      "Reviewer comments are attached or available in your dashboard.",
      "Please upload or submit the revised manuscript before the deadline communicated by the editorial office.",
    ],
    closing: ["We look forward to receiving your revision."],
  }),
  journal_accepted: (context) => ({
    subject: `Manuscript Accepted | Registration ID ${context.registrationId}`,
    opening: [
      "Congratulations!",
      `Your manuscript “${context.paperTitle}” has been accepted for publication in Global Confluence Review.`,
    ],
    nextSteps: [
      "Further instructions regarding publication and copyediting will be shared shortly.",
      "Article Processing Charge instructions, if applicable, will be communicated separately.",
    ],
    closing: ["We look forward to publishing your work."],
  }),
  journal_rejected: (context) => ({
    subject: `Editorial Decision | Registration ID ${context.registrationId}`,
    opening: [
      `After careful consideration of the reviewer reports, we regret to inform you that your manuscript “${context.paperTitle}” has not been accepted for publication.`,
    ],
    nextSteps: [
      "We sincerely appreciate your submission and encourage you to consider our journal for future work.",
    ],
    closing: ["Thank you for considering Global Confluence Review."],
  }),
};

export function resolveSubmissionEmailTemplate(
  purpose: SubmissionPurpose,
  status: SubmissionStatus,
  trigger: "create" | "status_change" = "status_change"
): SubmissionEmailTemplateKey | null {
  if (trigger === "create") {
    if (purpose === "conference" && status === "pending") {
      return "conference_submission_received";
    }
    if (
      purpose === "journal" &&
      (status === "pending" || status === "editorial_screening")
    ) {
      return "journal_submission_received";
    }
    return null;
  }

  if (purpose === "conference") {
    if (status === "accepted") return "conference_abstract_accepted";
    if (status === "rejected") return "conference_abstract_rejected";
    return null;
  }

  if (status === "desk_rejected") return "journal_desk_rejected";
  if (status === "under_review") return "journal_peer_review";
  if (status === "revision_requested") return "journal_revision_required";
  if (status === "accepted") return "journal_accepted";
  if (status === "rejected") return "journal_rejected";
  return null;
}

function renderSectionHtml(section: TemplateSection): string {
  const heading = section.heading
    ? `<h2 style="font-family:Georgia,serif;font-size:18px;color:#0f172a;margin:24px 0 12px">${escapeHtml(section.heading)}</h2>`
    : "";
  const paragraphs = (section.paragraphs ?? [])
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
  const list = section.list?.length
    ? `<ul style="padding-left:22px">${section.list.map((item) => `<li style="margin:8px 0">${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
  return `${heading}${paragraphs}${list}`;
}

function renderHtml(
  context: SubmissionEmailContext,
  content: TemplateContent
): string {
  const rows = [
    ["Registration ID", context.registrationId],
    ["Paper Title", context.paperTitle],
    ["Author Name", context.authorName],
    ["Submission Date", context.submissionDate],
    ["Current Status", context.currentStatus],
  ];
  const metadataTable =
    content.includeMetadataTable === false
      ? ""
      : `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;background:#f8fafc;border:1px solid #e2e8f0">
            ${rows.map(([label, value]) => `<tr><td style="padding:8px 12px;color:#64748b;width:34%">${escapeHtml(label)}</td><td style="padding:8px 12px;color:#0f172a;font-weight:600">${escapeHtml(value)}</td></tr>`).join("")}
          </table>`;
  const sectionsHtml = (content.sections ?? []).map(renderSectionHtml).join("");
  const nextStepsHtml = content.nextSteps?.length
    ? `<h2 style="font-family:Georgia,serif;font-size:18px;color:#0f172a">Next Steps</h2>
          <ul style="padding-left:22px">${content.nextSteps.map((step) => `<li style="margin:8px 0">${escapeHtml(step)}</li>`).join("")}</ul>`
    : "";
  const actionLinksHtml = (content.actionLinks ?? [])
    .map(
      (link) =>
        `<p><a href="${escapeHtml(link.url)}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 16px;text-decoration:none">${escapeHtml(link.label)}</a></p>`
    )
    .join("");
  const signatureHtml = content.signatureLines?.length
    ? `<p>${content.signatureLines.map((line) => `<strong>${escapeHtml(line)}</strong>`).join("<br>")}</p>`
    : `<p>${content.includeRegards === false ? "" : "Regards<br>"}<strong>Editorial Office</strong><br>Global Confluence Review</p>`;
  return `<!DOCTYPE html>
<html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#1f2937">
  <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(content.subject)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6f8;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border:1px solid #e2e8f0">
        <tr><td style="padding:24px;text-align:center;border-bottom:3px solid #1e3a5f">
          <img src="${escapeHtml(context.logoUrl)}" width="90" alt="Global Confluence Review logo" style="display:block;margin:0 auto 12px;max-width:90px;height:auto">
          <div style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#0f172a">Global Confluence Review</div>
        </td></tr>
        <tr><td style="padding:28px">
          <p>Dear ${escapeHtml(context.authorName)},</p>
          ${content.opening.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          ${metadataTable}
          ${sectionsHtml}
          ${nextStepsHtml}
          ${actionLinksHtml}
          ${content.closing.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          ${signatureHtml}
          <p><a href="${escapeHtml(context.dashboardUrl)}" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 16px;text-decoration:none">Open Author Dashboard</a></p>
        </td></tr>
        <tr><td style="padding:20px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;font-size:12px;color:#64748b">
          <strong>Global Confluence Review</strong><br>
          <a href="mailto:${escapeHtml(siteConfig.email)}">${escapeHtml(siteConfig.email)}</a><br>
          <a href="https://www.globalconfluencereview.in">https://www.globalconfluencereview.in</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderText(
  context: SubmissionEmailContext,
  content: TemplateContent
): string {
  const lines = [`Dear ${context.authorName},`, "", ...content.opening, ""];

  if (content.includeMetadataTable !== false) {
    lines.push(
      `Registration ID: ${context.registrationId}`,
      `Paper Title: ${context.paperTitle}`,
      `Author Name: ${context.authorName}`,
      `Submission Date: ${context.submissionDate}`,
      `Current Status: ${context.currentStatus}`,
      ""
    );
  }

  for (const section of content.sections ?? []) {
    if (section.heading) {
      lines.push(section.heading);
    }
    lines.push(...(section.paragraphs ?? []));
    for (const item of section.list ?? []) {
      lines.push(`- ${item}`);
    }
    lines.push("");
  }

  if (content.nextSteps?.length) {
    lines.push("Next Steps", ...content.nextSteps.map((step) => `- ${step}`), "");
  }

  for (const link of content.actionLinks ?? []) {
    lines.push(`${link.label}: ${link.url}`, "");
  }

  lines.push(
    ...content.closing,
    "",
    ...(content.signatureLines ?? (content.includeRegards === false ? [] : ["Regards", "Editorial Office", "Global Confluence Review"])),
    siteConfig.email,
    siteConfig.siteUrl
  );

  return lines.join("\n");
}

export function renderSubmissionEmail(
  key: SubmissionEmailTemplateKey,
  context: SubmissionEmailContext
): RenderedSubmissionEmail {
  const content =
    key === "conference_abstract_accepted"
      ? conferenceAcceptedContent(context)
      : TEMPLATE_CONTENT[key](context);
  return {
    key,
    recipient: context.authorEmail,
    subject: content.subject,
    html: renderHtml(context, content),
    text: renderText(context, content),
  };
}
