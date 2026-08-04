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

  const text = await res.text();
  let data: { error?: string; messageId?: string | null; ok?: boolean };
  try {
    data = text ? (JSON.parse(text) as typeof data) : {};
  } catch {
    throw new Error(
      res.ok
        ? "Unexpected response from server."
        : `Server error (${res.status}). Check FIREBASE_SERVICE_ACCOUNT_JSON is valid single-line JSON or use FIREBASE_ADMIN_* variables.`
    );
  }

  if (!res.ok) {
    throw new Error(data.error ?? "Could not send email.");
  }

  return { ok: true, messageId: data.messageId ?? null };
}
