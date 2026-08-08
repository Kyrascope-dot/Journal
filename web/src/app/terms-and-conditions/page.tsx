import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Terms and conditions",
  description: "Terms governing use of the Global Confluence Review website and services.",
};

export default function TermsAndConditionsPage() {
  return (
    <StaticContentPage
      title="Terms and conditions"
      intro="Effective date: 2 May 2026. These terms govern access to and use of the Global Confluence Review website and its journal services. By using the website, you agree to these terms."
      sections={[
        {
          heading: "1. Eligibility",
          paragraphs: [
            "By using this website, you confirm that you are at least 18 years old or legally authorised to submit academic work, that the information you provide is accurate and complete, and that you have the legal right to submit the manuscript or content.",
          ],
        },
        {
          heading: "2. Journal services",
          paragraphs: [
            "Our services include research-paper submission, editorial assessment, peer review, academic publication, journal communications, and related support. We may modify, suspend, or discontinue a service where necessary.",
          ],
        },
        {
          heading: "3. Manuscript submission",
          paragraphs: [
            "Authors confirm that submitted work is original, has not been published elsewhere unless clearly disclosed, is not simultaneously under consideration by another journal, contains proper citations and acknowledgements, and has been approved by all co-authors.",
            "The journal may reject or remove submissions that violate ethical, academic, legal, or editorial standards.",
          ],
        },
        {
          heading: "4. Peer review and editorial decisions",
          paragraphs: [
            "Submissions may undergo editorial screening and peer review. The journal may accept or reject a submission, request revisions, appoint editors and reviewers, and edit formatting and presentation for publication. Editorial decisions are final, subject to the journal’s complaints and appeals policy.",
          ],
        },
        {
          heading: "5. Publication ethics",
          paragraphs: [
            "Authors must comply with academic and publication ethics. Plagiarism, fabricated or falsified data, copyright infringement, and unethical research practices are prohibited. The journal may correct or retract work that violates these standards.",
          ],
        },
        {
          heading: "6. Intellectual property",
          paragraphs: [
            "Authors retain ownership of their original work unless otherwise agreed. By submitting content, authors grant the journal a non-exclusive right to assess, edit, publish, archive, and distribute an accepted manuscript in accordance with the applicable publication licence.",
          ],
        },
        {
          heading: "7. User conduct",
          paragraphs: [
            "Users must not provide false or misleading information, upload malicious content, attempt unauthorised access, interfere with website security or operations, or use the platform unlawfully. Violations may result in suspended or terminated access.",
          ],
        },
        {
          heading: "8. Fees and payments",
          paragraphs: [
            "Applicable publication, processing, conference, or other fees will be communicated before payment. Payment does not influence editorial decisions or guarantee publication. Fees are governed by the Refund and Cancellation Policy.",
          ],
        },
        {
          heading: "9. Disclaimer",
          paragraphs: [
            "The journal provides content for academic and informational purposes. It does not guarantee publication acceptance, indexing approval, citation performance, uninterrupted service, or the accuracy of third-party content. Opinions in published articles belong to their authors.",
          ],
        },
        {
          heading: "10. Limitation of liability",
          paragraphs: [
            "To the maximum extent permitted by law, the journal is not liable for data loss, publication delays, technical interruptions, indirect or consequential losses, or errors in submitted or published material. Users access the website at their own risk.",
          ],
        },
        {
          heading: "11. Third-party links",
          paragraphs: [
            "The website may link to third-party services or academic platforms. Global Confluence Review is not responsible for the content, policies, availability, or practices of external websites.",
          ],
        },
        {
          heading: "12. Privacy",
          paragraphs: [
            "Use of the website is also governed by the Global Confluence Review Privacy Policy.",
          ],
        },
        {
          heading: "13. Termination",
          paragraphs: [
            "We may suspend or terminate access to services when users violate these terms or engage in unethical, harmful, or unlawful activity.",
          ],
        },
        {
          heading: "14. Changes to these terms",
          paragraphs: [
            "We may update these terms. The revised version and effective date will be published on this page. Continued use after an update constitutes acceptance of the revised terms.",
          ],
        },
        {
          heading: "15. Governing law",
          paragraphs: [
            "These terms are governed by the laws of India. Disputes arising from these terms fall under the jurisdiction of the appropriate courts in India.",
          ],
        },
        {
          heading: "16. Contact",
          paragraphs: [
            "Questions about these terms may be sent to editor@globalconfluencereview.in. Global Confluence Review is located in New Delhi, India.",
          ],
        },
      ]}
    >
      <FeeWaiverNotice className="mt-10" />
    </StaticContentPage>
  );
}
