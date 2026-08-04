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
import { JournalHomeClient } from "@/components/journal/JournalHomeClient";
import { contentShell } from "@/lib/content-layout";
import { getIssnLabel } from "@/lib/journal-settings";

export default function Home() {
  return (
    <AppShell>
      <HomeHero />
      <HomeTrustStrip issnLabel={getIssnLabel()} />
      <div className={contentShell}>
        <HomeAboutSection />
        <HomeYoungResearchersSection />
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
