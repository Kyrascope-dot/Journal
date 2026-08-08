import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Refund and cancellation policy",
  description: "Refund and cancellation terms for Global Confluence Review payments and services.",
};

export default function RefundAndCancellationPolicyPage() {
  return (
    <StaticContentPage
      title="Refund and cancellation policy"
      intro="This policy applies to publication, conference, registration, and other payments made to Global Confluence Review. Read the applicable fee information before completing a payment."
      sections={[
        {
          heading: "General refund terms",
          paragraphs: [
            "Fees are non-refundable once payment has been processed unless different terms were stated in writing before payment or a refund is required by applicable law.",
            "Payment does not guarantee manuscript acceptance, journal publication, an award, indexing, or any particular editorial decision.",
          ],
        },
        {
          heading: "Journal submissions and publication fees",
          paragraphs: [
            "No APC is charged during submission. An article processing charge, where applicable, is charged only after acceptance.",
            "Withdrawing a manuscript after paying an applicable publication or processing fee does not automatically create a right to a refund. Editorial work already completed, peer-review activity, production work, and administrative processing may be taken into account.",
          ],
        },
        {
          heading: "Conference registration",
          paragraphs: [
            "Conference registration fees are separate from journal publication charges. A participant who cancels or does not attend is not automatically entitled to a refund.",
            "If Global Confluence Review cancels or materially changes a paid conference, affected participants will be contacted with the available arrangements.",
          ],
        },
        {
          heading: "Duplicate or incorrect payments",
          paragraphs: [
            "If you believe you made a duplicate payment or were charged an incorrect amount, contact the editorial office promptly and provide the payer’s name, payment date, amount, transaction reference, and supporting receipt. The request will be reviewed against payment records.",
          ],
        },
        {
          heading: "How to request a cancellation or refund review",
          paragraphs: [
            "Email editor@globalconfluencereview.in with your name, submission or registration ID, payment reference, reason for the request, and proof of payment. Submitting a request does not guarantee approval.",
          ],
        },
        {
          heading: "Approved refunds",
          paragraphs: [
            "Where a refund is approved, it will be returned through an available payment method after verification. Processing time may depend on the payment provider and banking system.",
          ],
        },
        {
          heading: "Policy changes",
          paragraphs: [
            "Global Confluence Review may update this policy. The terms communicated at the time of payment and any mandatory legal rights continue to apply.",
          ],
        },
      ]}
    >
      <FeeWaiverNotice className="mt-10" />
    </StaticContentPage>
  );
}
