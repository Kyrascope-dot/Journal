import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Copyright notice",
  description: "Copyright ownership and permitted use of Global Confluence Review content.",
};

export default function CopyrightNoticePage() {
  return (
    <StaticContentPage
      title="Copyright notice"
      intro="This notice explains the ownership and permitted use of material published by Global Confluence Review."
      sections={[
        {
          heading: "Journal website and branding",
          paragraphs: [
            "Unless otherwise stated, the Global Confluence Review name, logo, website design, editorial material, conference material, graphics, and other journal-created content are protected by applicable copyright and intellectual-property laws.",
            "Journal branding may not be copied, altered, presented as an endorsement, or used in a misleading manner without prior written permission.",
          ],
        },
        {
          heading: "Author copyright",
          paragraphs: [
            "Authors retain copyright in their original articles unless a different arrangement is agreed in writing. Authors grant Global Confluence Review the non-exclusive rights needed to assess, edit, publish, distribute, archive, and make accepted work publicly available.",
          ],
        },
        {
          heading: "Article licences",
          paragraphs: [
            "Accepted articles are published under the Creative Commons Attribution 4.0 International Licence (CC BY 4.0) unless the article states otherwise. This licence permits sharing and adaptation when appropriate credit is given, a link to the licence is provided, and changes are indicated.",
            "The licence displayed on an article governs use of that article. Third-party images, datasets, or other material may have separate rights or restrictions.",
          ],
        },
        {
          heading: "Permitted website use",
          paragraphs: [
            "Users may view, download, and print website material for lawful personal, educational, and research use. Uses beyond an applicable open licence require written permission from the relevant rights holder.",
          ],
        },
        {
          heading: "Reporting infringement",
          paragraphs: [
            "To report suspected copyright infringement, email editorglobalconfluencereview@gmail.com with the material’s location, details of the protected work, your contact information, and the basis of your claim.",
          ],
        },
      ]}
    />
  );
}
