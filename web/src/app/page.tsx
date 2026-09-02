import { AppShell } from "@/components/layout/AppShell";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeTrustStrip } from "@/components/home/HomeSections";
import {
  HomeAboutSection,
  HomeWhyPublishSection,
  HomeYoungResearchersSection,
} from "@/components/home/HomeSections";
import { HomeEditorialPreview } from "@/components/home/HomeEditorialPreview";
import { HomeIndexingPreview } from "@/components/home/HomeIndexingPreview";
import { HomeCompetitionPreview } from "@/components/home/HomeCompetitionPreview";
import { HomeConferencePreview } from "@/components/home/HomeConferencePreview";
import { ConferencePopup } from "@/components/home/ConferencePopup";
import { HomeFinancialAssistance } from "@/components/fees/FeeWaiverNotice";
import { JournalHomeClient } from "@/components/journal/JournalHomeClient";
import { contentShell } from "@/lib/content-layout";
import { getIssnLabel } from "@/lib/journal-settings";

/** Revalidate hourly so newly published issues appear without a full redeploy. */
export const revalidate = 3600;

export default async function Home() {
  return (
    <AppShell>
      <ConferencePopup />
      <HomeHero />
      <HomeTrustStrip issnLabel={getIssnLabel()} />
      <div className={contentShell}>
        <HomeAboutSection />
        <HomeYoungResearchersSection />
        <HomeFinancialAssistance />
        <HomeWhyPublishSection />
        <HomeEditorialPreview />
        <HomeIndexingPreview />
        <HomeCompetitionPreview />
        <HomeConferencePreview />
      </div>
      <JournalHomeClient />
    </AppShell>
  );
}
