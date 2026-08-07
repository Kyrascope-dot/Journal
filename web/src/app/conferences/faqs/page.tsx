import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = { title: "Conference FAQs" };

export default function ConferenceFaqsPage() {
  return (
    <StaticContentPage
      title="Conference FAQs"
      sections={[
        {
          heading: "How do I register?",
          paragraphs: [],
          list: [
            "Create an account.",
            "Submit your abstract.",
            "Editorial screening.",
            "Status visible in Author Dashboard.",
            "Acceptance email sent.",
            "Complete payment.",
            "Join conference.",
          ],
        },
        {
          heading: "What happens if I choose Best Presenter Award?",
          paragraphs: [],
          list: [
            "Prepare a PowerPoint presentation (PPT).",
            "Present during the conference.",
            "No manuscript needs to be emailed.",
          ],
        },
        {
          heading: "What happens if I choose Best Paper Award?",
          paragraphs: [],
          list: [
            "Prepare a PowerPoint presentation (PPT).",
            "Present during the conference.",
            "Submit the paper by email.",
            "Send a blinded manuscript.",
            "Send the title page separately.",
          ],
        },
        {
          heading: "What happens if I choose Both Awards?",
          paragraphs: [
            "Prepare a PowerPoint presentation, present during the conference, and email both the blinded manuscript and the separate title page to editorglobalconfluencereview@gmail.com.",
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
            "No. Winning Best Paper does not guarantee publication. Winning papers are invited for peer review.",
            "If accepted, the publication fee is waived.",
            "If not selected as Best Paper, authors may still submit through the regular journal submission process.",
            "Failure to win Best Paper does not indicate poor research quality.",
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
            "All award nominations are assessed independently by the Conference Evaluation Committee. Evaluation is based on the overall quality of the research and presentation. The committee’s decision is final.",
          ],
        },
        {
          heading: "Best Paper Award evaluation",
          paragraphs: ["The committee may consider factors such as:"],
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
          heading: "Additional Information",
          paragraphs: [
            "Awards may be presented separately for different academic levels (e.g., school students, undergraduate students, postgraduate students, PhD scholars, faculty members) depending on the number and quality of submissions.",
            "Separate awards may also be presented for qualitative, quantitative, and mixed-methods research, where appropriate.",
            "The Conference Evaluation Committee reserves the right to modify award categories or withhold an award if no submission meets the required standard.",
          ],
        },
      ]}
    >
      <FeeWaiverNotice className="mt-10" />
    </StaticContentPage>
  );
}
