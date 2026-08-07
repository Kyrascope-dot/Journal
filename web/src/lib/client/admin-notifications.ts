"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import type { SubmissionStatus } from "@/types/dashboard";

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

export async function requestAdminStatusUpdate(payload: {
  submissionId: string;
  status: SubmissionStatus;
  statusNote?: string;
}): Promise<{
  statusUpdated: true;
  emailRequired: boolean;
  emailSent: boolean;
  notificationId?: string;
  error?: string;
}> {
  const response = await adminRequest("/api/admin/submissions/update-status", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    error?: string;
    statusUpdated?: boolean;
    emailRequired?: boolean;
    emailSent?: boolean;
    notificationId?: string;
  };
  if (!response.ok || !data.statusUpdated) {
    throw new Error(data.error ?? "Could not update status.");
  }
  return {
    statusUpdated: true,
    emailRequired: Boolean(data.emailRequired),
    emailSent: Boolean(data.emailSent),
    notificationId: data.notificationId,
    error: data.error,
  };
}

export async function requestRetryNotification(notificationId: string) {
  const response = await adminRequest("/api/admin/notifications/retry", {
    method: "POST",
    body: JSON.stringify({ notificationId }),
  });
  const data = (await response.json()) as { emailSent?: boolean; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Could not retry email.");
  return { emailSent: Boolean(data.emailSent), error: data.error };
}

export type AdminEmailLog = {
  id: string;
  registrationId: string;
  recipient: string;
  subject: string;
  template: string;
  deliveryStatus: string;
  error: string | null;
  notificationId: string | null;
  createdAt: string | null;
};

export async function requestAdminEmailLogs(): Promise<AdminEmailLog[]> {
  const response = await adminRequest("/api/admin/email-logs");
  const data = (await response.json()) as { logs?: AdminEmailLog[]; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Could not load email logs.");
  return data.logs ?? [];
}
