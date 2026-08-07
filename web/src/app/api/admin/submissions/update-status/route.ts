import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import {
  notificationQueue,
  triggerService,
} from "@/lib/email/submission-notifications";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import type { SubmissionStatus } from "@/types/dashboard";

export const runtime = "nodejs";

const ALLOWED_STATUSES: SubmissionStatus[] = [
  "pending",
  "editorial_screening",
  "desk_rejected",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
];

type Body = {
  submissionId?: string;
  status?: SubmissionStatus;
  statusNote?: string;
};

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server-side email notifications are not configured." },
      { status: 503 }
    );
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const submissionId = body.submissionId?.trim();
  const status = body.status;
  const statusNote = body.statusNote?.trim().slice(0, 2_000) || null;
  if (!submissionId || !status || !ALLOWED_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "A valid submissionId and status are required." },
      { status: 400 }
    );
  }

  const db = getAdminFirestore();
  const submissionRef = db.doc(`submissions/${submissionId}`);
  const queueRef = db.collection("notificationQueue").doc();
  const historyRef = submissionRef.collection("statusHistory").doc();
  const now = Timestamp.now();
  let notificationCreated = false;
  let registrationId = submissionId;

  try {
    await db.runTransaction(async (transaction) => {
      const submissionSnap = await transaction.get(submissionRef);
      if (!submissionSnap.exists) throw new Error("Submission not found.");
      const submission = submissionSnap.data()!;
      registrationId = String(submission.registrationId ?? submissionId);
      if (submission.status === status && (submission.statusNote ?? null) === statusNote) {
        throw new Error("The submission already has this status and note.");
      }

      const notification = triggerService.prepare(submissionId, submission, status);
      transaction.update(submissionRef, {
        status,
        statusNote,
        lastUpdatedAt: now,
        lastEmailTemplate: notification?.templateKey ?? null,
        emailStatus: notification ? "pending" : "not_required",
        emailTimestamp: notification ? now : null,
        deliveryStatus: notification ? "queued" : "not_applicable",
      });
      transaction.create(historyRef, {
        registrationId,
        status,
        note: statusNote,
        createdAt: now,
        changedById: admin.uid,
        changedByName: admin.email,
        changedByRole: "admin",
        emailTemplate: notification?.templateKey ?? null,
        emailStatus: notification ? "pending" : "not_required",
      });
      if (notification) {
        notificationCreated = true;
        transaction.create(queueRef, {
          ...notification,
          queueStatus: "pending",
          deliveryStatus: "queued",
          attempts: 0,
          error: null,
          createdAt: now,
          createdBy: admin.uid,
        });
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Status update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (!notificationCreated) {
    return NextResponse.json({
      ok: true,
      statusUpdated: true,
      emailSent: false,
      emailRequired: false,
      registrationId,
    });
  }

  const result = await notificationQueue.process(queueRef.id);
  return NextResponse.json({
    ok: true,
    statusUpdated: true,
    emailRequired: true,
    emailSent: result.sent,
    notificationId: queueRef.id,
    registrationId,
    error: result.error,
  });
}
