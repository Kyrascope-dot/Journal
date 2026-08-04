import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = { title: "Copyright and licensing" };

export default function CopyrightAndLicensingPage() {
  return (
    <StaticContentPage
      title="Copyright and licensing"
      sections={[
        {
          paragraphs: [
            "Authors retain copyright of their work. Upon acceptance, articles are published under the Creative Commons Attribution 4.0 International Licence (CC BY 4.0) unless otherwise agreed in writing.",
            "Authors grant Global Confluence Review a non-exclusive right to publish, distribute, and make the article publicly available in line with the chosen licence.",
          ],
        },
      ]}
    />
  );
}
