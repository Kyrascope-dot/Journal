import { siteConfig } from "@/lib/site-config";
import {
  conferenceAcceptedEmailFeeIncludes,
  publicationOpportunityLead,
} from "@/lib/conference-content";
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
  {
    seedKey: "conference_q3_2026_payment_link",
    name: "Payment Link - GCR Conference July–September 2026",
    description: "Conference Q3 2026 registration payment link for a selected author.",
    audience: "conference",
    subject: "Payment Link - GCR International Conference Q3 2026",
    bodyHtml: `<p>Dear {{authorName}},</p>

<p>Congratulations once again on the acceptance of your abstract for the <strong>GCR International Conference Q3 2026</strong>.</p>

<p>We are pleased to invite you to complete your conference registration and payment.</p>

<p><strong>Registration Details</strong></p>

<p>
<strong>Registration ID:</strong> {{registrationId}}<br>
<strong>Paper Title:</strong> {{title}}<br>
<strong>Conference:</strong> GCR International Conference Q3 2026<br>
<strong>Conference Date:</strong> 30th August 2026<br>
<strong>Conference Time:</strong> 9:30 AM IST
</p>

<p><strong>Payment</strong></p>

<p>Please complete your conference registration payment using the secure payment link below:</p>

<p>
<a href="{{paymentLink}}"
style="display:inline-block;padding:12px 22px;background:#1f4775;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
Complete Conference Payment
</a>
</p>

<p>If the button above does not work, you may use the following payment link:</p>

<p>{{paymentLink}}</p>

<p><strong>Important:</strong> If you have already applied for a need-based fee waiver, please contact the Editorial Office before making payment so that your request can be reviewed before payment.</p>

<p>After successful payment confirmation, the relevant conference participation information and Zoom access details will be communicated to you.</p>

<p>If you have any questions regarding registration, payment, or participation, please reply to this email.</p>

<p>We look forward to welcoming you to the <strong>GCR International Conference Q3 2026</strong>.</p>

<p>Thanking you,</p>

<p>
<strong>Editorial Office</strong><br>
<strong>Global Confluence Review</strong><br>
editor@globalconfluencereview.in
</p>`,
    bodyText: `Dear {{authorName}},

Congratulations once again on the acceptance of your abstract for the GCR International Conference Q3 2026.

Registration ID: {{registrationId}}
Paper Title: {{title}}
Conference: GCR International Conference Q3 2026
Conference Date: 30th August 2026
Conference Time: 9:30 AM IST

Please complete your conference registration payment using this secure payment link:
{{paymentLink}}

Important: If you have already applied for a need-based fee waiver, please contact the Editorial Office before making payment so that your request can be reviewed before payment.

Thanking you,
Editorial Office
Global Confluence Review
editor@globalconfluencereview.in`,
    variables: VARS,
    isDefault: true,
  },
  {
    seedKey: "conference_payment_reminder",
    name: "Payment Reminder – GCR Conference Registration",
    description:
      "Reminder for accepted authors to complete conference registration payment before the deadline.",
    audience: "conference" as const,
    subject: "Payment Reminder – GCR Conference Registration Deadline: 28 August 2026",
    bodyHtml: `<p>Dear {{author_name}},</p>

<p>Greetings from Global Confluence Review (GCR).</p>

<p>This is a gentle reminder regarding the pending payment for your registration for the <strong>GCR International Multidisciplinary Conference Q3 (July–September)</strong>, scheduled for <strong>30 August 2026 at 9:30 AM IST</strong>.</p>

<p>Our records indicate that the payment for your registration has not yet been completed.</p>

<p><strong>Payment Deadline:</strong><br>
28 August 2026<br>
11:59 PM IST</p>

<p>We kindly request you to complete the payment by the above deadline to confirm your participation in the conference.</p>

<p><strong>Complete Your Conference Payment:</strong></p>

<p>
<a href="https://www.globalconfluencereview.in/conferences/payment"
style="display:inline-block;padding:12px 22px;background:#1f4775;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
Complete Conference Payment
</a>
</p>

<p>If the button above does not work, copy and paste this link into your browser:</p>

<p>https://www.globalconfluencereview.in/conferences/payment</p>

<p>Please note that the Zoom links for the GCR Colloquia/Workshop and Conference will be shared with participants whose payment has been successfully completed.</p>

<p>If you have already completed the payment, please disregard this reminder and, if necessary, share your payment confirmation with the GCR Editorial &amp; Conference Office.</p>

<p>We look forward to your participation in the GCR International Multidisciplinary Conference.</p>

<p>Warm regards,</p>

<p>
<strong>Global Confluence Review (GCR)</strong><br>
<strong>Editorial &amp; Conference Office</strong>
</p>`,
    bodyText: `Dear {{author_name}},

Greetings from Global Confluence Review (GCR).

This is a gentle reminder regarding the pending payment for your registration for the GCR International Multidisciplinary Conference Q3 (July–September), scheduled for 30 August 2026 at 9:30 AM IST.

Our records indicate that the payment for your registration has not yet been completed.

Payment Deadline:
28 August 2026
11:59 PM IST

We kindly request you to complete the payment by the above deadline to confirm your participation in the conference.

Complete Your Conference Payment:
https://www.globalconfluencereview.in/conferences/payment

Please note that the Zoom links for the GCR Colloquia/Workshop and Conference will be shared with participants whose payment has been successfully completed.

If you have already completed the payment, please disregard this reminder and, if necessary, share your payment confirmation with the GCR Editorial & Conference Office.

We look forward to your participation in the GCR International Multidisciplinary Conference.

Warm regards,
Global Confluence Review (GCR)
Editorial & Conference Office`,
    variables: VARS,
    isDefault: true,
  },
  {
    seedKey: "conference_zoom_links",
    name: "Zoom link for GCR Colloquia/Workshop and Conference",
    description:
      "Zoom meeting details for paid conference participants (Colloquia/Workshop and Conference).",
    audience: "conference" as const,
    subject: "Zoom link for GCR Colloquia/Workshop and Conference",
    bodyHtml: `<p>Dear {{author_name}},</p>

<p>Greetings from Global Confluence Review (GCR).</p>

<p>Thank you for registering for the GCR Colloquia/Workshop and GCR International Multidisciplinary Conference Q3 (July–September).</p>

<p>Please find the Zoom links below for the Colloquia/Workshop and the Conference:</p>

<p><strong>GCR Colloquia/Workshop</strong></p>

<p>
Date: 29 August 2026<br>
Time: 9:30 AM IST
</p>

<p>
<a href="https://us06web.zoom.us/j/82284991687?pwd=BcUgNr0XJePsic0mIiSPyR6judzlqz.1"
style="display:inline-block;padding:12px 22px;background:#1f4775;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
JOIN COLLOQUIA/WORKSHOP
</a>
</p>

<p>
Join Zoom Meeting:<br>
https://us06web.zoom.us/j/82284991687?pwd=BcUgNr0XJePsic0mIiSPyR6judzlqz.1
</p>

<p>
Meeting ID: 822 8499 1687<br>
Passcode: 719947
</p>

<p><strong>GCR International Multidisciplinary Conference Q3 (July–September)</strong></p>

<p>
Date: 30 August 2026<br>
Time: 9:30 AM IST
</p>

<p>
<a href="https://us06web.zoom.us/j/87422081934?pwd=opGXnxBEJrNc1JltmkCzEzH72Yfvsm.1"
style="display:inline-block;padding:12px 22px;background:#1f4775;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:bold;">
JOIN CONFERENCE
</a>
</p>

<p>
Join Zoom Meeting:<br>
https://us06web.zoom.us/j/87422081934?pwd=opGXnxBEJrNc1JltmkCzEzH72Yfvsm.1
</p>

<p>
Meeting ID: 874 2208 1934<br>
Passcode: 027216
</p>

<p>We request you to join the respective Zoom session a few minutes before the scheduled start time.</p>

<p>Please ensure that you use the appropriate Zoom link for the session you are attending.</p>

<p>We look forward to welcoming you to the GCR Colloquia/Workshop and International Multidisciplinary Conference.</p>

<p>Warm regards,</p>

<p>
<strong>Global Confluence Review (GCR)</strong><br>
<strong>Editorial &amp; Conference Office</strong>
</p>`,
    bodyText: `Dear {{author_name}},

Greetings from Global Confluence Review (GCR).

Thank you for registering for the GCR Colloquia/Workshop and GCR International Multidisciplinary Conference Q3 (July–September).

Please find the Zoom links below for the Colloquia/Workshop and the Conference:

GCR Colloquia/Workshop

Date: 29 August 2026
Time: 9:30 AM IST

Join Zoom Meeting:
https://us06web.zoom.us/j/82284991687?pwd=BcUgNr0XJePsic0mIiSPyR6judzlqz.1

Meeting ID: 822 8499 1687
Passcode: 719947

GCR International Multidisciplinary Conference Q3 (July–September)

Date: 30 August 2026
Time: 9:30 AM IST

Join Zoom Meeting:
https://us06web.zoom.us/j/87422081934?pwd=opGXnxBEJrNc1JltmkCzEzH72Yfvsm.1

Meeting ID: 874 2208 1934
Passcode: 027216

We request you to join the respective Zoom session a few minutes before the scheduled start time.

Please ensure that you use the appropriate Zoom link for the session you are attending.

We look forward to welcoming you to the GCR Colloquia/Workshop and International Multidisciplinary Conference.

Warm regards,
Global Confluence Review (GCR)
Editorial & Conference Office`,
    variables: VARS,
    isDefault: true,
  },
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
    "conference_abstract_accepted",
    "Conference – Abstract Accepted (Payment Link)",
    "Official abstract acceptance notification with conference payment link and registration details.",
    "conference",
    "Payment Link – GCR International Conference Q3 July–September 2026",
    [
      "Dear {{authorName}},",
      "Congratulations!",
      'We are pleased to inform you that your abstract, “{{title}}”, has been accepted for presentation at the GCR International Conference – Q3 July–September 2026.',
      "We are delighted to have your research as part of the conference and look forward to your participation.",
      "<strong>Conference Registration Fee Includes</strong>",
      "Your registration fee includes:",
      `<ul><li>${conferenceAcceptedEmailFeeIncludes.join("</li><li>")}</li></ul>`,
      "<strong>Publication Opportunity</strong>",
      publicationOpportunityLead,
      "Please note that conference registration or payment does not guarantee publication.",
      "All submitted manuscripts will be subject to the journal's applicable double-blind peer-review process, plagiarism screening, editorial evaluation, author revisions where required, publication ethics, journal scope, quality standards, and publication schedule.",
      "<strong>Registration Fee &amp; GST</strong>",
      "For National Participants:",
      "Registration Fee: USD 150",
      "GST (18%): USD 27",
      "Total Conference Registration Fee: USD 177",
      "The USD 177 amount includes 18% GST applicable to the conference registration fee.",
      "For International Participants:",
      "Conference Registration Fee: USD 200",
      "<strong>Payment Options</strong>",
      "Razorpay: Secure payment using the supported payment methods available through Razorpay.",
      "PayPal: Available as an alternative payment option, particularly for international participants.",
      "<strong>Razorpay Payment Note</strong>",
      "Razorpay may apply an additional payment processing/convenience fee, where applicable. Any such payment gateway charge is separate from the GCR conference registration fee and applicable GST.",
      "The applicable Razorpay charge, if any, will be displayed during Razorpay checkout before the payment is completed. Therefore, the final amount charged by Razorpay may be higher than the stated GCR registration amount.",
      "<strong>Complete Your Registration Payment</strong>",
      '<a href="https://www.globalconfluencereview.in/conferences/payment" style="display:inline-block;background:#1e3a5f;color:#fff;padding:10px 16px;text-decoration:none">Complete Registration Payment</a>',
      "After completing the payment, please retain your payment confirmation/receipt for your records.",
      "<strong>Conference Schedule</strong>",
      "GCR Colloquia/Workshop: 29 August 2026, 9:30 AM IST",
      "GCR International Conference: 30 August 2026, 9:30 AM IST",
      "Mode: Online via Zoom",
      "Registration deadline: 25 August 2026",
      "We request all accepted authors to complete their registration within the stipulated registration period to confirm their participation.",
      "We look forward to welcoming you and your research to the GCR International Conference Q3 July–September 2026.",
      "Warm regards,",
      "GCR Conference &amp; Editorial Team<br/>Global Confluence Review (GCR)",
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
