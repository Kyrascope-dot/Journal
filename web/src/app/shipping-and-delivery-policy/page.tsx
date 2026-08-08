import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Shipping and delivery policy",
  description: "Digital delivery terms for Global Confluence Review academic services.",
};

export default function ShippingAndDeliveryPolicyPage() {
  return (
    <StaticContentPage
      title="Shipping & Delivery Policy"
      intro="Global Confluence Review provides only digital academic services. No physical products are shipped."
      sections={[
        {
          heading: "Services",
          paragraphs: ["Services include:"],
          list: [
            "Journal publication",
            "Conference registration",
            "Certificates",
            "Workshops",
            "Webinars",
            "Editorial services",
            "Conference participation",
          ],
        },
        {
          heading: "Electronic delivery",
          paragraphs: [
            "All communication occurs electronically. Accepted papers, invoices, receipts, and other applicable documents are delivered digitally by email or through the relevant online service.",
            "Certificates are delivered digitally unless otherwise announced.",
          ],
        },
        {
          heading: "Delivery queries",
          paragraphs: [
            "If an expected digital document has not arrived, contact editor@globalconfluencereview.in with your name and submission or registration ID.",
          ],
        },
      ]}
    />
  );
}
