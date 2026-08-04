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
