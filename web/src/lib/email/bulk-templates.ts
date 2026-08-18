import { siteConfig } from "@/lib/site-config";
import {
  COMMUNICATION_VARIABLES,
  type EmailTemplateRecord,
  type TemplateAudience,
} from "@/types/communications";

export type DefaultBulkTemplate = Omit<
  EmailTemplateRecord,
  "id" | "createdAt" | "updatedAt" | "createdById"
> & { seedKey: string };

const VARS = [...COMMUNICATION_VARIABLES];

function wrapBody(paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
}

function plainFromHtml(html: string): string {
  return html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function template(
  seedKey: string,
  name: string,
  description: string,
  audience: TemplateAudience,
  subject: string,
  paragraphs: string[]
): DefaultBulkTemplate {
  const bodyHtml = wrapBody(paragraphs);
  return {
    seedKey,
    name,
    description,
    audience,
    subject,
    bodyHtml,
    bodyText: plainFromHtml(bodyHtml),
    variables: VARS,
    isDefault: true,
  };
}

export const DEFAULT_BULK_TEMPLATES: DefaultBulkTemplate[] = [
  template(
    "conference_reminder_general",
    "Conference — General reminder",
    "Reminder for conference abstract authors.",
    "conference",
    `Conference update | {{registrationId}} — ${siteConfig.shortName}`,
    [
      "Dear {{authorName}},",
      `This is an update regarding your conference submission <strong>{{title}}</strong> (Registration ID: <strong>{{registrationId}}</strong>) for ${siteConfig.name}.`,
      "Current status: <strong>{{statusLabel}}</strong>. Category: {{category}}. Quarter: {{conferenceQuarter}}.",
      'Please sign in to your dashboard for details: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>Editorial Office<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "conference_abstract_pending_followup",
    "Conference — Pending abstract follow-up",
    "Follow-up for abstracts still pending review.",
    "conference",
    `Your conference abstract is under review | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Thank you for submitting your abstract <strong>{{title}}</strong> ({{registrationId}}).",
      "Your submission is currently <strong>{{statusLabel}}</strong>. We will notify you as soon as a decision is available.",
      `If you have questions, reply to this email or write to ${siteConfig.email}.`,
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "conference_accepted_next_steps",
    "Conference — Accepted next steps",
    "Next steps for accepted conference abstracts (no payment/DOI inventing).",
    "conference",
    `Abstract accepted — next steps | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Congratulations. Your abstract <strong>{{title}}</strong> ({{registrationId}}) has been <strong>accepted</strong> for presentation at the Global Confluence Review International Conference.",
      "Award intent on file: {{conferenceAwardIntent}}. Please prepare your presentation and watch for further instructions from the editorial office.",
      'Dashboard: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "conference_rejected_notice",
    "Conference — Abstract not selected",
    "Polite notice for rejected conference abstracts.",
    "conference",
    `Conference abstract decision | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Thank you for submitting <strong>{{title}}</strong> ({{registrationId}}) to the conference.",
      "After careful consideration, we are unable to accept this abstract for presentation at this time (status: {{statusLabel}}).",
      "We encourage you to consider a future journal submission where appropriate.",
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "conference_best_paper_nominees",
    "Conference — Best paper nominees",
    "Message for Best Paper / Both award nominees.",
    "conference",
    `Best Paper nominee update | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "This message concerns your conference submission <strong>{{title}}</strong> ({{registrationId}}), listed with award intent: <strong>{{conferenceAwardIntent}}</strong>.",
      "Please ensure your materials are ready as requested by the editorial office. Status: {{statusLabel}}.",
      'Dashboard: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "journal_general_update",
    "Journal — General status update",
    "General update for journal manuscript authors.",
    "journal",
    `Journal manuscript update | {{registrationId}} — ${siteConfig.shortName}`,
    [
      "Dear {{authorName}},",
      `This is an update on your manuscript <strong>{{title}}</strong> (Registration ID: <strong>{{registrationId}}</strong>) submitted to ${siteConfig.name}.`,
      "Current status: <strong>{{statusLabel}}</strong>. Category: {{category}}. Assigned editor: {{assignedEditorName}}.",
      'View your submission: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>Editorial Office<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "journal_under_review_nudge",
    "Journal — Under review update",
    "Update for manuscripts currently under peer review.",
    "journal",
    `Peer review in progress | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Your manuscript <strong>{{title}}</strong> ({{registrationId}}) remains <strong>{{statusLabel}}</strong>.",
      "We appreciate your patience while the review process continues. Assigned reviewer (internal reference only): {{assignedReviewerName}}.",
      `Questions: ${siteConfig.email}`,
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "journal_revision_reminder",
    "Journal — Revision reminder",
    "Reminder for authors with revision requested.",
    "journal",
    `Revision reminder | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "This is a reminder regarding your manuscript <strong>{{title}}</strong> ({{registrationId}}), currently marked <strong>{{statusLabel}}</strong>.",
      "Please submit your revised materials through the author dashboard when ready.",
      'Dashboard: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "journal_accepted_notice",
    "Journal — Acceptance notice",
    "Acceptance communication for journal manuscripts.",
    "journal",
    `Manuscript accepted | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Congratulations. Your manuscript <strong>{{title}}</strong> ({{registrationId}}) has been <strong>{{statusLabel}}</strong> for publication consideration in {{journalName}}.",
      "The editorial office will contact you with any further production steps. Affiliation on file: {{affiliation}}.",
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
  template(
    "journal_desk_screening",
    "Journal — Editorial screening update",
    "Update while under editorial screening.",
    "journal",
    `Editorial screening update | {{registrationId}}`,
    [
      "Dear {{authorName}},",
      "Your manuscript <strong>{{title}}</strong> ({{registrationId}}) is currently <strong>{{statusLabel}}</strong>.",
      "Submitted: {{submittedAt}}. Category: {{category}}.",
      'Dashboard: <a href="{{dashboardUrl}}">{{dashboardUrl}}</a>',
      `Kind regards,<br/>${siteConfig.name}`,
    ]
  ),
];

export function htmlToPlainText(html: string): string {
  return plainFromHtml(html);
}
