import { siteConfig } from "@/lib/site-config";
import { featuredConference } from "@/lib/conference-config";

export const conferenceTimezone = "IST | GMT +5:30";

export const conferenceSpeakers = [
  {
    role: "Speaker",
    name: "Dr. Tayyaba Rani",
    affiliation: "Xi'an Jiaotong University, China",
  },
  {
    role: "Additional Speaker",
    name: "Prof. Parthasarathi",
    affiliation: "Maharaja Agrasen College, University of Delhi, India",
    lines: [
      "Former Department Head; Coordinator, ISRO START Program",
      "Recipient, Rosalind Fellowship (London Press, 2021)",
    ],
  },
  {
    role: "Conference Chair & Convener",
    name: "Dr. Neha Dawar",
    affiliation: "Swiss School of Business and Management, Geneva, Switzerland",
  },
] as const;

export const conferenceSchedule = [
  { time: "9:30–10:00 AM", title: "Registration, Welcome & Inaugural Session" },
  {
    time: "10:00 AM–12:00 PM",
    title: "Parallel Academic Track Sessions – I (Tracks 1 & 2)",
    note: "Announcement of Best Presenter & Best Paper Awardees",
  },
  {
    time: "12:15–2:00 PM",
    title: "Parallel Academic Track Sessions – II (Track 3)",
    note: "Announcement of Best Presenter & Best Paper Awardees",
  },
  {
    time: "3:00–4:30 PM",
    title: "Parallel Academic Track Sessions – III (Track 4)",
    note: "Announcement of Best Presenter & Best Paper Awardees",
  },
  {
    time: "4:30–5:30 PM",
    title: "Parallel Academic Track Sessions – IV (Track 5: STEM)",
    note: "Announcement of Best Presenter & Best Paper Awardees",
  },
  {
    time: "5:30–6:00 PM",
    title: "Valedictory Session & Best Paper Awards",
  },
] as const;

export const conferenceRegistrationFees = [
  {
    label: "National Participants",
    amount: "USD 177 total",
    breakdown: [
      "Registration Fee: USD 150",
      "GST (18%): USD 27",
      "Total: USD 177",
    ],
  },
  {
    label: "International Participants",
    amount: "USD 200",
    breakdown: ["Registration Fee: USD 200"],
  },
] as const;

export const conferenceFeeWaiverText =
  "Full and Partial need-based fee waivers are available for talented students with demonstrated financial need, subject to eligibility and availability.";

export const conferenceFeeWaiverEmailText = `Students seeking financial assistance should email the Editor at ${siteConfig.email}.`;

export const importantConferenceDates = [
  { label: "Abstract Submission Deadline", value: "25 August 2026" },
  { label: "Registration Deadline", value: "25 August 2026" },
  {
    label: "GCR Colloquia/Workshop",
    value: `${featuredConference.colloquiaDateLabel}, ${featuredConference.colloquiaTime}`,
  },
  {
    label: "Conference Date",
    value: `${featuredConference.datesLabel}, ${featuredConference.conferenceTime}`,
  },
] as const;

export const howToRegisterSteps = [
  "Register on the GCR website",
  "Submit your research abstract",
  "Receive the abstract acceptance notification",
  "Complete registration payment",
  "Present your research at the conference via PPT",
] as const;

export const publicationOpportunityLead =
  "All authors who enroll/register for the GCR conference will have the opportunity to submit their full research manuscript for consideration for publication in Global Confluence Review (GCR).";

export const publicationOpportunityLegalClarification =
  "Submission for publication does not constitute a guarantee of publication. All submitted manuscripts will undergo the journal's applicable double-blind peer-review, plagiarism screening, editorial evaluation, and quality-assurance processes. Authors may be required to make revisions before a publication decision is made. Final publication is subject to the journal's scope, publication ethics, editorial standards, peer-review outcome, and publication schedule.";

export const publicationOpportunityParagraphs = [
  publicationOpportunityLead,
  publicationOpportunityLegalClarification,
] as const;

export const conferenceRegistrationFeeIncludes = [
  `Participation in the International Multidisciplinary Conference 2026 on ${featuredConference.datesLabel}.`,
  "Presentation of the accepted research abstract before an international audience of academicians, researchers, and industry experts.",
  `Complimentary access to the GCR Colloquia/Workshop on ${featuredConference.colloquiaDateLabel}.`,
  "Exclusive Fireside Chat with the Editors.",
  "Opportunity for ALL enrolled conference authors to submit their full research manuscript for consideration for publication in Global Confluence Review (GCR), subject to double-blind peer review, plagiarism screening, editorial evaluation, author revisions where required, publication ethics, journal scope, editorial standards, and publication schedule.",
  "Digital Conference Participation Certificate.",
  "Separate E-Certificate for participation in the GCR Colloquia/Workshop.",
  "Opportunity to compete for Best Paper and Best Presenter Awards.",
  "Networking opportunities with researchers, editors, academicians, and scholars.",
] as const;

export const conferencePaymentPublicationNote = [
  "All authors who register/enroll for the GCR conference are eligible to submit their full research manuscript for consideration for publication in Global Confluence Review (GCR).",
  "Conference registration provides an opportunity to submit a manuscript; it does not guarantee publication.",
  "All submitted manuscripts are subject to the journal's applicable double-blind peer-review process, plagiarism screening, editorial evaluation, author revisions where required, publication ethics, journal scope, quality standards, and publication schedule.",
  "A final publication decision will be made only after completion of the applicable editorial and peer-review process.",
] as const;

export const conferencePaymentApcNote =
  "If a separate journal publication fee or article processing charge (APC) applies, it is governed by the journal's current Publication Fees & Fee Waivers policy and is not automatically covered by the conference registration fee.";

export const razorpayPaymentNote =
  "Razorpay Payment Note: Razorpay may apply an additional payment processing/convenience fee, where applicable. Any such payment gateway charge is separate from the GCR conference registration fee and applicable GST. The applicable charge, if any, will be displayed by Razorpay during checkout before the payment is completed. The final amount charged by Razorpay may therefore be higher than the stated GCR registration amount.";

export const conferenceAcceptedEmailFeeIncludes = [
  "Conference participation and presentation of your accepted abstract.",
  "Complimentary participation in the GCR Colloquia and Workshop.",
  "Exclusive Fireside Chat with the Editors.",
  "Opportunity for all enrolled conference authors to submit their full research manuscript for consideration for publication in Global Confluence Review (GCR), subject to peer review, plagiarism screening, editorial evaluation, author revisions where required, and applicable publication standards.",
  "Digital Conference Participation Certificate.",
  "Separate E-Certificate for participation in the GCR Colloquia/Workshop.",
  "Opportunity to compete for Best Paper and Best Presenter Awards.",
  "Networking opportunities with researchers, editors, academicians, and scholars.",
] as const;

export const conferenceAwards = [
  "Best Paper Award",
  "Best Presenter Award",
  "Digital Certificates",
] as const;

export const conferenceAwardsNotes = [
  "Digital certificates are provided separately for eligible conference and Colloquia/Workshop participation.",
  "A Certificate of Participation will be given to all participants in the Best Paper, Best Presenter, and Both award categories, whether or not they receive an award.",
  "Top 10% of Best Paper Award submissions may be offered an opportunity to publish in GCR, subject to peer review; publication is optional for the author.",
] as const;

/** Best Paper Award policy — used on FAQs, dashboard, and acceptance emails. */
export const bestPaperAwardPolicyParagraphs = [
  "Authors may submit their papers for consideration for the Best Paper Award without being required to present the paper at the conference. It is optional to present.",
  "All eligible submissions will be evaluated by the Conference Review Committee based on originality, research quality, methodology, relevance, clarity, and overall academic contribution.",
  "The selected Best Paper Award winner(s) will receive an official Best Paper Award Certificate. Participation in the award category does not require an oral presentation. Published and unpublished research will be accepted.",
  "The top 10% of research will be chosen for the Best Paper Awards and will be offered an opportunity to publish, subject to peer review. However, it is optional for the author to publish or not publish.",
  "Scholars in the Best Paper Award category may attend the GCR Colloquia/Workshop and will receive digital certificates. If a scholar does not receive an award, a Certificate of Participation will still be given.",
] as const;

export const bestPaperAwardPolicyNote =
  "Note: Submission for the Best Paper Award does not guarantee selection. The award will be granted solely on the basis of the quality and merit of the submitted research.";

export const conferenceParticipationCertificatesNote =
  "A Certificate of Participation will be given to all participants in the Best Paper, Best Presenter, and Both award categories, whether or not they receive an award.";

export const timezonePresentationRequestNote = `Scholars in different time zones who have timing constraints may request to present first in the programme. Please write to ${siteConfig.email}.`;

export const onlineConferenceBenefits = [
  "Build global academic networks",
  "Exchange knowledge and research ideas",
  "Engage with researchers from different disciplines",
  "Participate in interdisciplinary discussions",
  "Learn from experienced researchers and academics",
  "Receive e-certificates",
] as const;

export const colloquiaDetails = {
  title: "GCR Colloquia / Research Workshop 2026",
  subtitle: "Research Presentations by Experts from Top Institutions",
  date: "29 August 2026",
  time: "9:30 AM – 12:30 PM IST",
  mode: "Live on Zoom",
  duration: "3 Hours",
  feeLabel: "FREE FOR CONFERENCE PARTICIPANTS",
  points: [
    "No Additional Fee",
    "No Separate Registration",
    "The GCR Colloquia/Workshop is available free of charge to registered conference participants.",
    "Separate e-certificates will be awarded to eligible Colloquia attendees.",
    "Attendance is optional. Participants may present at the main conference without attending the Colloquia/Workshop.",
  ],
} as const;

export const firesideChatTopics = [
  "Research",
  "Academic Publishing",
  "Peer Review",
  "Research Careers",
  "Manuscript Preparation",
  "Publication Strategies",
] as const;

export const colloquiaExpertIds = [
  "tayyaba-rani",
  "vishal-dagar",
  "mariam-aloulou",
  "parthasarathi",
] as const;

export const colloquiaExpertHighlights: Record<
  (typeof colloquiaExpertIds)[number],
  string[]
> = {
  "tayyaba-rani": [
    "Expert in energy economics, environmental sustainability, digital transformation & financial development",
    "19+ publications in high-impact journals",
  ],
  "vishal-dagar": [
    "Economist & researcher; listed among the global top 2% of scientists (Elsevier–Stanford, 2023–2025)",
    "Associate Professor, Great Lakes Institute of Management, Gurugram, India",
    "75+ SSCI/SCI publications in 25+ journals",
    "1,500+ peer reviews for 250+ journals",
    "FT 50; ABDC A+, A, B",
  ],
  "mariam-aloulou": [
    "College of Business Administration, American University in the Emirates (AUE), UAE",
    "Expert in FinTech, Circular Economy & Sustainability Strategies",
    "Certified in FinTech (Harvard VPAL)",
    "Reviewer for multiple journals and conferences",
    "Recipient of multiple research grants and awards",
  ],
  parthasarathi: [
    "Physics, Non-Hermitian Quantum Mechanics, Complex Phase Space Quantum Mechanics, and Plasmonics",
    "Maharaja Agrasen College, University of Delhi, India",
    "Former Coordinator, ISRO START Programme",
    "Recipient, Rosalind Fellowship (London Press, 2021)",
  ],
};

export const colloquiaBenefits = [
  {
    title: "High-Quality Research Presentations",
    description:
      "Learn from leading scientists and researchers across diverse disciplines.",
  },
  {
    title: "E-Certificate",
    description:
      "Eligible attendees will receive a separate e-certificate for the Colloquia.",
  },
  {
    title: "Learn & Network",
    description:
      "Gain valuable insights, explore research opportunities and connect with experts and peers.",
  },
  {
    title: "Interactive Q&A",
    description:
      "Engage directly with experts and have research-related questions answered.",
  },
] as const;

export const colloquiaParticipantGains = [
  "Understand how to publish in international journals",
  "Learn research design, methodologies and analysis",
  "Discover strategies for high-impact publications",
  "Receive guidance on peer review",
  "Learn about manuscripts and research careers",
  "Explore emerging research trends",
  "Engage in interdisciplinary discussions",
  "Participate in discussions and knowledge exchange",
  "Gain practical insights for researchers",
] as const;

export const colloquiaTracks = [
  "Economics, Finance & Management",
  "Public Policy, Governance & Development",
  "Education, Psychology & Social Sciences",
  "Humanities, Culture & Communication",
  "Science, Technology, Engineering & Mathematics",
] as const;

export const colloquiaWhoCanParticipate = [
  "Students",
  "Researchers",
  "Academicians",
  "Professionals",
  "Industry Experts",
] as const;

export const conferenceEditorEmail = siteConfig.email;

export const conferenceOverviewTitle = featuredConference.title;
