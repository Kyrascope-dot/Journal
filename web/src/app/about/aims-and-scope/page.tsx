import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = {
  title: "Aims and scope",
};

export default function AimsAndScopePage() {
  return (
    <StaticContentPage
      title="Aims and scope"
      sections={[
        {
          heading: "Scope",
          paragraphs: [
            "Global Confluence Review (GCR) is an international, peer-reviewed, open-access, multidisciplinary journal committed to original research and scholarly dialogue that addresses contemporary global and local challenges.",
            "We welcome contributions from high-school researchers, undergraduate and postgraduate students, research scholars, independent researchers, academicians, professionals, and interdisciplinary teams.",
          ],
        },
        {
          heading: "Article types",
          paragraphs: [
            "Original research articles, narrative and systematic reviews, bibliometric studies, policy papers, research essays, case studies, conceptual papers, interdisciplinary research, conference papers, and high-school research papers, subject to editorial scope and quality standards.",
          ],
        },
        {
          heading: "What we look for",
          paragraphs: [
            "Clear research questions, rigorous methods where applicable, ethical compliance, transparent reporting, and meaningful contribution to knowledge or practice. All submissions undergo academic, ethical, and editorial assessment; acceptance is not guaranteed.",
          ],
        },
      ]}
    />
  );
}
