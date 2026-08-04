"use client";

import { getFirebaseAuth } from "@/lib/firebase";

export async function requestSendReviewerInvitation(
  submissionId: string,
  reviewerId: string
): Promise<{ ok: true; messageId: string | null }> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("You must be signed in as an administrator.");
  }
  const idToken = await user.getIdToken();

  const res = await fetch("/api/admin/send-reviewer-invitation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submissionId, reviewerId }),
  });

  const data = (await res.json()) as { error?: string; messageId?: string | null; ok?: boolean };

  if (!res.ok) {
    throw new Error(data.error ?? "Could not send email.");
  }

  return { ok: true, messageId: data.messageId ?? null };
}
