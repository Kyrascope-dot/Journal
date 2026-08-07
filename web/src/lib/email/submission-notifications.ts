import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { emailService } from "@/lib/email/email-service";
import {
  renderSubmissionEmail,
  resolveSubmissionEmailTemplate,
  type SubmissionEmailContext,
  type SubmissionEmailTemplateKey,
} from "@/lib/email/templates/submission-status";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getSiteBaseUrl } from "@/lib/email/reviewer-invitation";
import {
  getSubmissionStatusLabel,
  type ConferenceAwardIntent,
  type SubmissionPurpose,
  type SubmissionStatus,
} from "@/types/dashboard";

export type QueuedSubmissionNotification = {
  submissionId: string;
  registrationId: string;
  templateKey: SubmissionEmailTemplateKey;
  recipient: string;
  context: SubmissionEmailContext;
  status: SubmissionStatus;
  queueStatus: "pending" | "sent" | "failed";
  attempts: number;
  createdAt: Timestamp;
};

type SubmissionRecord = {
  registrationId?: string;
  title?: string;
  authorName?: string;
  authorEmail?: string;
  submissionPurpose?: SubmissionPurpose;
  conferenceAwardIntent?: ConferenceAwardIntent | null;
  submittedAt?: { toDate(): Date };
};

function formatSubmissionDate(value: SubmissionRecord["submittedAt"]): string {
  if (!value?.toDate) return "—";
  return value.toDate().toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function prepareSubmissionNotification(
  submissionId: string,
  submission: SubmissionRecord,
  status: SubmissionStatus,
  trigger: "create" | "status_change" = "status_change"
): Omit<QueuedSubmissionNotification, "queueStatus" | "attempts" | "createdAt"> | null {
  const purpose =
    submission.submissionPurpose === "conference" ? "conference" : "journal";
  const templateKey = resolveSubmissionEmailTemplate(purpose, status, trigger);
  if (!templateKey) return null;

  const baseUrl = getSiteBaseUrl();
  const registrationId = String(submission.registrationId ?? submissionId);
  return {
    submissionId,
    registrationId,
    templateKey,
    recipient: String(submission.authorEmail ?? ""),
    status,
    context: {
      authorName: String(submission.authorName ?? submission.authorEmail ?? "Author"),
      authorEmail: String(submission.authorEmail ?? ""),
      registrationId,
      paperTitle: String(submission.title ?? ""),
      submissionDate: formatSubmissionDate(submission.submittedAt),
      currentStatus: getSubmissionStatusLabel(status, purpose),
      submissionPurpose: purpose,
      conferenceAwardIntent: submission.conferenceAwardIntent ?? null,
      dashboardUrl: `${baseUrl}/dashboard?view=author`,
      logoUrl: `${baseUrl}/GCR_logo.jpg`,
    },
  };
}

export async function processQueuedSubmissionNotification(
  notificationId: string
): Promise<{ sent: boolean; error?: string; messageId?: string | null }> {
  const db = getAdminFirestore();
  const queueRef = db.doc(`notificationQueue/${notificationId}`);
  const queueSnap = await queueRef.get();
  if (!queueSnap.exists) return { sent: false, error: "Notification not found." };

  const queued = queueSnap.data() as QueuedSubmissionNotification;
  const submissionRef = db.doc(`submissions/${queued.submissionId}`);
  const submissionSnap = await submissionRef.get();
  if (!submissionSnap.exists) {
    return { sent: false, error: "Submission not found." };
  }
  if (submissionSnap.data()?.status !== queued.status) {
    const error = "The submission status has changed; this email is no longer current.";
    await queueRef.update({
      queueStatus: "failed",
      deliveryStatus: "failed",
      error,
      lastAttemptAt: FieldValue.serverTimestamp(),
    });
    return { sent: false, error };
  }

  let email: ReturnType<typeof renderSubmissionEmail> | null = null;
  try {
    email = renderSubmissionEmail(queued.templateKey, queued.context);
    const result = await emailService.send({
      to: email.recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });
    const batch = db.batch();
    batch.update(queueRef, {
      queueStatus: "sent",
      deliveryStatus: result.deliveryStatus,
      subject: email.subject,
      providerMessageId: result.messageId,
      attempts: FieldValue.increment(1),
      error: null,
      sentAt: FieldValue.serverTimestamp(),
      lastAttemptAt: FieldValue.serverTimestamp(),
    });
    batch.update(submissionRef, {
      lastEmailSent: FieldValue.serverTimestamp(),
      lastEmailTemplate: queued.templateKey,
      emailStatus: "sent",
      emailTimestamp: FieldValue.serverTimestamp(),
      deliveryStatus: result.deliveryStatus,
    });
    batch.create(db.collection("email_logs").doc(), {
      type: "submission_status",
      submissionId: queued.submissionId,
      registrationId: queued.registrationId,
      template: queued.templateKey,
      recipient: email.recipient,
      subject: email.subject,
      deliveryStatus: result.deliveryStatus,
      providerMessageId: result.messageId,
      notificationId,
      error: null,
      createdAt: FieldValue.serverTimestamp(),
    });
    await batch.commit();
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Email delivery failed.";
    try {
      const batch = db.batch();
      batch.update(queueRef, {
        queueStatus: "failed",
        deliveryStatus: "failed",
        subject: email?.subject ?? null,
        attempts: FieldValue.increment(1),
        error: message,
        lastAttemptAt: FieldValue.serverTimestamp(),
      });
      batch.update(submissionRef, {
        lastEmailTemplate: queued.templateKey,
        emailStatus: "failed",
        emailTimestamp: FieldValue.serverTimestamp(),
        deliveryStatus: "failed",
      });
      batch.create(db.collection("email_logs").doc(), {
        type: "submission_status",
        submissionId: queued.submissionId,
        registrationId: queued.registrationId,
        template: queued.templateKey,
        recipient: email?.recipient ?? queued.recipient,
        subject: email?.subject ?? null,
        deliveryStatus: "failed",
        providerMessageId: null,
        notificationId,
        error: message,
        createdAt: FieldValue.serverTimestamp(),
      });
      await batch.commit();
    } catch (logError) {
      console.error("[notificationQueue] failed to persist email failure:", logError);
    }
    return { sent: false, error: message };
  }
}

export class TriggerService {
  prepare(
    submissionId: string,
    submission: SubmissionRecord,
    status: SubmissionStatus,
    trigger: "create" | "status_change" = "status_change"
  ) {
    return prepareSubmissionNotification(submissionId, submission, status, trigger);
  }
}

export class NotificationQueue {
  async enqueueAndProcess(input: {
    submissionId: string;
    submission: SubmissionRecord;
    status: SubmissionStatus;
    trigger?: "create" | "status_change";
    createdBy: string;
  }): Promise<{
    emailRequired: boolean;
    emailSent: boolean;
    notificationId?: string;
    error?: string;
  }> {
    const notification = prepareSubmissionNotification(
      input.submissionId,
      input.submission,
      input.status,
      input.trigger ?? "status_change"
    );
    if (!notification) {
      return { emailRequired: false, emailSent: false };
    }

    if (!emailService.isConfigured()) {
      return {
        emailRequired: true,
        emailSent: false,
        error: "RESEND_API_KEY is not configured.",
      };
    }

    const db = getAdminFirestore();
    const queueRef = db.collection("notificationQueue").doc();
    try {
      await queueRef.set({
        ...notification,
        queueStatus: "pending",
        deliveryStatus: "queued",
        attempts: 0,
        error: null,
        createdAt: Timestamp.now(),
        createdBy: input.createdBy,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not enqueue notification.";
      return { emailRequired: true, emailSent: false, error: message };
    }

    try {
      const result = await processQueuedSubmissionNotification(queueRef.id);
      return {
        emailRequired: true,
        emailSent: result.sent,
        notificationId: queueRef.id,
        error: result.error,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email delivery failed.";
      return {
        emailRequired: true,
        emailSent: false,
        notificationId: queueRef.id,
        error: message,
      };
    }
  }

  process(notificationId: string) {
    return processQueuedSubmissionNotification(notificationId);
  }
}

export const triggerService = new TriggerService();
export const notificationQueue = new NotificationQueue();
