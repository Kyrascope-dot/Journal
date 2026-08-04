import { StaticContentPage } from "@/components/layout/StaticContentPage";

export const metadata = { title: "Archiving and preservation" };

export default function ArchivingAndPreservationPage() {
  return (
    <StaticContentPage
      title="Archiving and preservation"
      sections={[
        {
          paragraphs: [
            "Global Confluence Review is committed to long-term preservation of published scholarly content. Archiving arrangements and public preservation statements are maintained through journal administration and will be updated as formal agreements are verified.",
            "Contact the editorial office for questions about access to back issues or preservation policy.",
          ],
        },
      ]}
    />
  );
}
