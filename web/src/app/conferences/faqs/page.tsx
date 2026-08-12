import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { StaticContentPage } from "@/components/layout/StaticContentPage";
import {
  bestPaperAwardPolicyNote,
  bestPaperAwardPolicyParagraphs,
  conferenceParticipationCertificatesNote,
  howToRegisterSteps,
  timezonePresentationRequestNote,
} from "@/lib/conference-content";
import { manuscriptSubmissionTypes } from "@/lib/manuscript-templates";
import { siteConfig } from "@/lib/site-config";

export const metadata = { title: "Conference FAQs" };

export default function ConferenceFaqsPage() {
  return (
    <StaticContentPage
      title="Conference FAQs"
      sections={[
        {
          heading: "How do I register?",
          paragraphs: [],
          list: [...howToRegisterSteps],
        },
        {
          heading: "Important dates",
          paragraphs: [
            "Abstract Submission Deadline: 25 August 2026",
            "Registration Deadline: 25 August 2026",
            "Conference Date: 30 August 2026",
            "The Zoom link will be shared with registered participants.",
          ],
        },
        {
          heading: "Registration fees",
          paragraphs: [
            "National Participants: USD 150",
            "International Participants: USD 200",
            "Full and Partial need-based fee waivers are available for talented students with demonstrated financial need, subject to eligibility and availability.",
            `Students seeking financial assistance should email the Editor at ${siteConfig.email}.`,
          ],
        },
        {
          heading: "What can be submitted to the conference?",
          paragraphs: [
            "The conference accepts the same manuscript types listed under Manuscript Templates on the GCR website, including but not limited to:",
          ],
          list: [...manuscriptSubmissionTypes],
        },
        {
          heading: "Time zones and presentation timing",
          paragraphs: [timezonePresentationRequestNote],
        },
        {
          heading: "Certificates of participation",
          paragraphs: [conferenceParticipationCertificatesNote],
        },
        {
          heading: "What happens if I choose Best Presenter Award?",
          paragraphs: [],
          list: [
            "Prepare a PowerPoint presentation (PPT).",
            "Present during the conference.",
            "No manuscript needs to be emailed.",
            conferenceParticipationCertificatesNote,
          ],
        },
        {
          heading: "What happens if I choose Best Paper Award?",
          paragraphs: [...bestPaperAwardPolicyParagraphs, bestPaperAwardPolicyNote],
          list: [
            "Submit your paper by email after abstract acceptance.",
            "Send a blinded manuscript and separate title page for unpublished work, or the published PDF if already published.",
            "Oral presentation at the conference is optional.",
          ],
        },
        {
          heading: "What happens if I choose Both Awards?",
          paragraphs: [
            `Prepare a PowerPoint presentation for the Best Presenter component. For the Best Paper component, email the blinded manuscript and separate title page (or published PDF) to ${siteConfig.email}. Oral presentation is required for the Best Presenter component; see the Best Paper Award section above for paper submission details.`,
            conferenceParticipationCertificatesNote,
          ],
        },
        {
          heading: "Can already published papers participate?",
          paragraphs: [
            "Yes. Researchers whose work is already published may still compete.",
            "They should email the PDF of the published paper after abstract acceptance. Publication in GCR is not automatic.",
          ],
        },
        {
          heading: "Do I have to use the journal template?",
          paragraphs: [
            "The journal template is recommended but optional for the initial conference submission.",
            "Authors submitting through the conference for publication consideration are encouraged to use the journal template.",
            "If selected for Best Paper and invited for journal review, authors will be required to submit the revised manuscript in journal format before peer review.",
          ],
        },
        {
          heading: "Who can submit?",
          paragraphs: [],
          list: [
            "Researchers with already published work.",
            "Researchers with unpublished work.",
            "Faculty.",
            "Students.",
            "Industry professionals.",
            "Policy researchers.",
            "Independent scholars.",
          ],
        },
        {
          heading: "If I win Best Paper, is publication guaranteed?",
          paragraphs: [
            "No. Winning Best Paper does not guarantee publication. Top 10% of Best Paper submissions may be offered a publication opportunity, subject to peer review.",
            "Publication is optional for the author.",
            "Conference presentation does not automatically guarantee publication.",
            "If not selected for Best Paper, authors may still submit through the regular journal submission process.",
            "Failure to win Best Paper does not indicate poor research quality.",
            bestPaperAwardPolicyNote,
          ],
        },
        {
          heading: "Award Categories",
          paragraphs: [
            "Separate awards may be given for school students, undergraduate students, postgraduate students, PhD scholars, and faculty at the discretion of the Conference Evaluation Committee.",
            "Separate awards may also be given for qualitative research, quantitative research, and mixed methods research at the discretion of the Committee.",
          ],
        },
        {
          heading: "How are submissions evaluated?",
          paragraphs: [
            "All award nominations are assessed independently by the Conference Evaluation Committee. Evaluation is based on the overall quality of the research and, where applicable, the presentation. The committee’s decision is final.",
          ],
        },
        {
          heading: "Best Paper Award evaluation",
          paragraphs: [
            "All eligible Best Paper submissions are evaluated by the Conference Review Committee based on originality, research quality, methodology, relevance, clarity, and overall academic contribution.",
            "The committee may also consider factors such as:",
          ],
          list: [
            "Originality and novelty of the research",
            "Significance and contribution to the field",
            "Literature review and theoretical foundation",
            "Research methodology and design",
            "Data analysis and interpretation",
            "Quality of discussion and conclusions",
            "Overall organisation and clarity of the manuscript",
            "Academic writing and referencing",
          ],
        },
        {
          heading: "Best Presentation Award evaluation",
          paragraphs: ["The committee may consider factors such as:"],
          list: [
            "Clarity and organisation of the presentation",
            "Communication and presentation skills",
            "Quality and effectiveness of presentation slides",
            "Understanding of the research topic",
            "Ability to answer questions",
            "Time management",
            "Audience engagement",
          ],
        },
        {
          heading: "GCR Colloquia / Research Workshop",
          paragraphs: [
            "The GCR Colloquia/Workshop on 29 August 2026 is available free of charge to registered conference participants.",
            "No additional fee and no separate registration are required.",
            "Attendance is optional. Participants may present at the main conference without attending the Colloquia/Workshop.",
            "Separate e-certificates will be awarded to eligible Colloquia attendees.",
            "Scholars in the Best Paper Award category may attend the Colloquia/Workshop and will receive digital certificates.",
          ],
        },
      ]}
    >
      <FeeWaiverNotice className="mt-10" />
    </StaticContentPage>
  );
}
