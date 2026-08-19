import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TechResearchHubPage } from "@/components/tech-research/TechResearchHubPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "GCR Tech Research Hub",
  description:
    "A dedicated pathway for school and university students developing original research and projects in technology, computer science, engineering and emerging fields. Research. Build. Discover. Publish.",
  openGraph: {
    title: `GCR Tech Research Hub | ${siteConfig.shortName}`,
    description:
      "Submit original technology, computer science, and engineering research. For high-school students, undergraduates, and student teams.",
    url: `${siteConfig.siteUrl}/tech-research`,
  },
};

export default function TechResearchRoutePage() {
  return (
    <AppShell>
      <TechResearchHubPage />
    </AppShell>
  );
}
