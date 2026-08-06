import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Privacy policy",
  description: "How Global Confluence Review collects, uses, stores, and protects personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <StaticContentPage
      title="Privacy policy"
      intro="Effective date: 2 May 2026. This policy explains how Global Confluence Review collects, uses, stores, and protects information supplied by authors, reviewers, readers, conference participants, and website visitors."
      sections={[
        {
          heading: "1. Information we collect",
          paragraphs: [
            "When you register, submit research, review a manuscript, attend a conference, contact us, or subscribe to updates, we may collect your name, email address, institutional affiliation, phone number or postal address where provided, academic information, manuscripts, abstracts, and related files.",
            "We may also receive technical information such as IP address, browser and device type, operating system, referring page, pages visited, and access date and time. Cookies or analytics tools may be used to support security, functionality, and performance.",
          ],
        },
        {
          heading: "2. How we use information",
          paragraphs: [
            "Information is used to manage accounts, submissions, editorial assessment, peer review, publication, conferences, payments, communications, academic records, website security, fraud prevention, and service improvements.",
          ],
        },
        {
          heading: "3. Research submissions and publications",
          paragraphs: [
            "Submitted material may be shared with authorised editors and reviewers for assessment. If work is accepted, author names, affiliations, abstracts, keywords, article files, and other publication metadata may become publicly available.",
            "Authors are responsible for ensuring that submitted material may lawfully be processed and does not violate privacy, copyright, confidentiality, or third-party rights.",
          ],
        },
        {
          heading: "4. Sharing and disclosure",
          paragraphs: [
            "We do not sell or rent personal information. Information may be shared with editors and reviewers, trusted providers that support website or payment operations, or public authorities where required by law. It may also be disclosed where necessary to protect users, journal integrity, legal rights, or website security.",
          ],
        },
        {
          heading: "5. Data security and retention",
          paragraphs: [
            "We use reasonable technical and organisational safeguards against unauthorised access, loss, misuse, alteration, or disclosure. No internet-based system is completely secure.",
            "Information is retained for as long as reasonably necessary for editorial records, publication integrity, conference administration, legal compliance, dispute resolution, and the purposes described in this policy.",
          ],
        },
        {
          heading: "6. Cookies and analytics",
          paragraphs: [
            "Cookies may remember preferences, maintain secure sessions, analyse website traffic, and improve functionality. Browser settings can be used to limit or disable cookies, although some features may then be unavailable.",
          ],
        },
        {
          heading: "7. Third-party services",
          paragraphs: [
            "The website may link to or use third-party platforms, including authentication, payment, analytics, academic identifier, indexing, and communication services. Their processing is governed by their own privacy policies.",
          ],
        },
        {
          heading: "8. Children’s privacy",
          paragraphs: [
            "The website is not directed to children under 13, and we do not knowingly collect their personal information. A student who is legally required to obtain permission from a parent, guardian, school, or institution must do so before submitting information or research.",
          ],
        },
        {
          heading: "9. Intellectual property",
          paragraphs: [
            "Published articles, website materials, journal branding, and submitted content remain protected under applicable copyright and intellectual-property laws. Author rights are governed by the journal’s Copyright Notice and applicable publication licence.",
          ],
        },
        {
          heading: "10. Your choices and rights",
          paragraphs: [
            "Subject to applicable law and preservation of the scholarly record, you may ask to access or correct your personal information, request deletion where legally permissible, or withdraw consent for optional communications.",
          ],
        },
        {
          heading: "11. Policy changes",
          paragraphs: [
            "We may update this policy. Material changes and the revised effective date will be published on this page.",
          ],
        },
        {
          heading: "12. Contact",
          paragraphs: [
            "For privacy questions or requests, email editorglobalconfluencereview@gmail.com or contact Global Confluence Review at 10/130 Malviya Nagar, New Delhi – 110097, India.",
          ],
        },
      ]}
    />
  );
}
