import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AwardWinnersContent } from "@/components/conferences/AwardWinnersContent";
import { getSiteOrigin } from "@/lib/seo";

const title = "GCR International Conference 2026 | Best Presenter Award Winners";
const description =
  "Official Best Presenter Award results for the GCR International Multidisciplinary Conference 2026, including Best Presenters, PhD Scholar Best Presenter, PhD Scholar Runner-Ups and Runner-Up awardees across conference tracks.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: `${getSiteOrigin()}/conferences/award-winners`,
    type: "website",
  },
};

export default function AwardWinnersPage() {
  return (
    <AppShell>
      <AwardWinnersContent />
    </AppShell>
  );
}
