"use client";

import { getFirebaseAuth } from "@/lib/firebase";
import type {
  CampaignRecipientPreview,
  CommunicationsStats,
  CreateCampaignPayload,
  EmailCampaignSummary,
  EmailTemplateRecord,
  PersonalizedEmailPreview,
  RecipientFilters,
  CommunicationHistoryItem,
  SendIndividualPayload,
} from "@/types/communications";
import type { SubmissionPurpose } from "@/types/dashboard";

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

export async function requestCommunicationTemplates(): Promise<EmailTemplateRecord[]> {
  const response = await adminRequest("/api/admin/communications/templates");
  const data = (await response.json()) as {
    templates?: EmailTemplateRecord[];
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load templates.");
  return data.templates ?? [];
}

export async function requestSaveCommunicationTemplate(payload: {
  id?: string;
  name: string;
  description?: string;
  audience: EmailTemplateRecord["audience"];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}): Promise<EmailTemplateRecord> {
  const response = await adminRequest("/api/admin/communications/templates", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    template?: EmailTemplateRecord;
    error?: string;
  };
  if (!response.ok || !data.template) {
    throw new Error(data.error ?? "Could not save template.");
  }
  return data.template;
}

export async function requestPreviewRecipients(payload: {
  filters: RecipientFilters;
  purpose?: SubmissionPurpose;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  limit?: number;
}): Promise<{
  count: number;
  recipients: CampaignRecipientPreview[];
  previews: PersonalizedEmailPreview[];
}> {
  const response = await adminRequest("/api/admin/communications/preview-recipients", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    count?: number;
    recipients?: CampaignRecipientPreview[];
    previews?: PersonalizedEmailPreview[];
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not preview recipients.");
  return {
    count: data.count ?? 0,
    recipients: data.recipients ?? [],
    previews: data.previews ?? [],
  };
}

export async function requestCreateCampaign(payload: CreateCampaignPayload): Promise<{
  campaign: EmailCampaignSummary;
  queued: boolean;
  processedImmediately: boolean;
}> {
  const response = await adminRequest("/api/admin/communications/campaigns", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    campaign?: EmailCampaignSummary;
    queued?: boolean;
    processedImmediately?: boolean;
    error?: string;
  };
  if (!response.ok || !data.campaign) {
    throw new Error(data.error ?? "Could not create campaign.");
  }
  return {
    campaign: data.campaign,
    queued: Boolean(data.queued),
    processedImmediately: Boolean(data.processedImmediately),
  };
}

export async function requestCommunicationCampaigns(): Promise<EmailCampaignSummary[]> {
  const response = await adminRequest("/api/admin/communications/campaigns");
  const data = (await response.json()) as {
    campaigns?: EmailCampaignSummary[];
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load campaigns.");
  return data.campaigns ?? [];
}

export async function requestExportCampaignCsv(campaignId: string): Promise<void> {
  const response = await adminRequest(
    `/api/admin/communications/campaigns/${campaignId}/export`
  );
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? "Could not export campaign CSV.");
  }
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const filename = match?.[1] ?? `campaign-${campaignId}.csv`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function requestProcessCampaignBatch(campaignId: string): Promise<{
  campaign: EmailCampaignSummary;
  processed: number;
  sent: number;
  failed: number;
  remaining: number;
}> {
  const response = await adminRequest(
    `/api/admin/communications/campaigns/${campaignId}/process`,
    { method: "POST" }
  );
  const data = (await response.json()) as {
    campaign?: EmailCampaignSummary;
    processed?: number;
    sent?: number;
    failed?: number;
    remaining?: number;
    error?: string;
  };
  if (!response.ok || !data.campaign) {
    throw new Error(data.error ?? "Could not process campaign batch.");
  }
  return {
    campaign: data.campaign,
    processed: data.processed ?? 0,
    sent: data.sent ?? 0,
    failed: data.failed ?? 0,
    remaining: data.remaining ?? 0,
  };
}

export async function requestSendIndividualEmail(payload: SendIndividualPayload) {
  const response = await adminRequest("/api/admin/communications/send-individual", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    sent?: boolean;
    messageId?: string | null;
    error?: string;
  };
  if (!response.ok || !data.sent) {
    throw new Error(data.error ?? "Could not send email.");
  }
  return data;
}

export async function requestCommunicationHistory(
  submissionId: string
): Promise<CommunicationHistoryItem[]> {
  const response = await adminRequest(
    `/api/admin/communications/history?submissionId=${encodeURIComponent(submissionId)}`
  );
  const data = (await response.json()) as {
    history?: CommunicationHistoryItem[];
    error?: string;
  };
  if (!response.ok) throw new Error(data.error ?? "Could not load history.");
  return data.history ?? [];
}

export async function requestCommunicationsStats(): Promise<CommunicationsStats> {
  const response = await adminRequest("/api/admin/communications/stats");
  const data = (await response.json()) as {
    stats?: CommunicationsStats;
    error?: string;
  };
  if (!response.ok || !data.stats) {
    throw new Error(data.error ?? "Could not load stats.");
  }
  return data.stats;
}

export async function requestSendTestEmail(payload: {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  sampleSubmissionId?: string | null;
}) {
  const response = await adminRequest("/api/admin/communications/test-email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as {
    sent?: boolean;
    messageId?: string | null;
    error?: string;
  };
  if (!response.ok || !data.sent) {
    throw new Error(data.error ?? "Could not send test email.");
  }
  return data;
}
