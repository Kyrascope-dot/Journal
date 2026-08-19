import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { TechResearchApplyForm } from "@/components/tech-research/TechResearchApplyForm";

export const metadata: Metadata = {
  title: "Submit Tech Research",
  description:
    "Submit your student technology research project to the GCR Tech Research Hub for editorial review.",
};

export default function TechResearchApplyPage() {
  return (
    <AppShell>
      <TechResearchApplyForm />
    </AppShell>
  );
}
