"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import type { AdminApcRecord } from "@/types/apc-payments";

async function adminRequest(path: string, init?: RequestInit) {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("You must be signed in as an administrator.");
  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
}

export async function requestAdminApcRecords(): Promise<{
  records: AdminApcRecord[];
  officeEmail: string;
}> {
  const response = await adminRequest("/api/admin/apc-payments");
  const data = (await response.json()) as {
    records?: AdminApcRecord[];
    officeEmail?: string;
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load APC payments.");
  return { records: data.records ?? [], officeEmail: data.officeEmail ?? "" };
}

/** Sends the billing-details email to the Editorial Office again. */
export async function requestResendApcOfficeEmail(paymentId: string): Promise<string> {
  const response = await adminRequest("/api/admin/apc-payments/resend-email", {
    method: "POST",
    body: JSON.stringify({ paymentId }),
  });
  const data = (await response.json()) as { ok?: boolean; recipient?: string; error?: string };
  if (!response.ok || !data.ok) throw new Error(data.error ?? "Could not send the email.");
  return data.recipient ?? "";
}
