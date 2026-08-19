"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import type { TechResearchSubmissionPayload } from "@/lib/tech-research-application";

export type TechResearchSubmissionResult = {
  submissionId: string;
  registrationId: string;
  submittedAt: string;
  paymentRequired: boolean;
  submissionFeeDisplay: string;
};

export async function submitTechResearchApplication(
  payload: TechResearchSubmissionPayload
): Promise<TechResearchSubmissionResult> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("Please sign in to submit your Tech Research application.");
  }

  const idToken = await user.getIdToken();
  const response = await fetch("/api/submissions/create-tech-research", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await response.text();
  let data: TechResearchSubmissionResult & { error?: string };
  try {
    data = JSON.parse(raw) as typeof data;
  } catch {
    throw new Error(
      response.status >= 500
        ? "Submission service is temporarily unavailable. Please try again in a moment."
        : "Could not register submission. Please refresh the page and try again."
    );
  }

  if (!response.ok || !data.submissionId || !data.registrationId || !data.submittedAt) {
    throw new Error(data.error ?? "Could not register submission.");
  }

  return {
    submissionId: data.submissionId,
    registrationId: data.registrationId,
    submittedAt: data.submittedAt,
    paymentRequired: Boolean(data.paymentRequired),
    submissionFeeDisplay: data.submissionFeeDisplay ?? "USD 80",
  };
}
