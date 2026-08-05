import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = { title: "Conference FAQs" };

export default function ConferenceFaqsPage() {
  return (
    <StaticContentPage
      title="Conference FAQs"
      sections={[
        {
          heading: "Does conference registration guarantee journal publication?",
          paragraphs: [
            "No. Conference participation does not guarantee journal publication. Selected manuscripts may be considered for publication subject to peer review, editorial evaluation, author revisions, and the journal’s publication schedule.",
          ],
        },
        {
          heading: "What does the Best Paper Award category include?",
          paragraphs: [
            "Winners of the Best Paper Award in their track will be offered a publication opportunity in an upcoming issue of Global Confluence Review (GCR), subject to rigorous journal peer review.",
            "After winning, the author must submit the complete paper using the GCR journal manuscript template. The paper will then receive full consideration for publication in the upcoming GCR issue. Winning the award does not bypass peer review or guarantee acceptance.",
          ],
        },
        {
          heading: "What does the Best Presenter Award category include?",
          paragraphs: [
            "Participants in this category may present their paper at the GCR conference through a PowerPoint presentation (PPT). This category does not include publication in Global Confluence Review.",
            "Authors whose papers have already been published in another journal, or are currently under consideration by another journal, may present their work at the GCR conference but will not receive GCR journal publication through this category.",
          ],
        },
        {
          heading: "Can I apply for both Best Paper and Best Presenter Awards?",
          paragraphs: [
            "Yes. Select the Both option during conference submission to be considered for the Best Paper Award and the Best Presenter Award.",
            "The presentation conditions of the Best Presenter category apply. A publication opportunity is available only if the participant wins the Best Paper Award in their track, and the complete manuscript must still undergo rigorous GCR peer review and editorial consideration.",
          ],
        },
        {
          heading: "How do I receive my registration ID?",
          paragraphs: [
            "After successful registration you will receive a confirmation email with your registration ID. Save this ID for payment, paper submission, and dashboard access.",
          ],
        },
        {
          heading: "Where are fees listed?",
          paragraphs: [
            "Participant fees are configured in the admin pricing table and shown at checkout when payment is enabled. Fees are separate from journal article processing charges (APC).",
          ],
        },
      ]}
    />
  );
}
