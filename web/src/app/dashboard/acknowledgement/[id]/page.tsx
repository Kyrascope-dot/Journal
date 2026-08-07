import { AppShell } from "@/components/layout/AppShell";
import { SubmissionAcknowledgement } from "@/components/dashboard/SubmissionAcknowledgement";
import { contentShell } from "@/lib/content-layout";

export const metadata = {
  title: "Submission acknowledgement",
  robots: { index: false, follow: false },
};

export default async function SubmissionAcknowledgementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <div className={`${contentShell} py-10`}>
        <SubmissionAcknowledgement submissionId={id} />
      </div>
    </AppShell>
  );
}
