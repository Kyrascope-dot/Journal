import { AppShell } from "@/components/layout/AppShell";
import { JournalArchivesClient } from "@/components/journal/JournalArchivesClient";

/** Revalidate hourly so newly published issues appear without a full redeploy. */
export const revalidate = 3600;

export default function IssuesPage() {
  return (
    <AppShell>
      <JournalArchivesClient />
    </AppShell>
  );
}
