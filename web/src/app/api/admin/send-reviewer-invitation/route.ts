import { NextResponse } from "next/server";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import {
  getSiteBaseUrl,
  sendReviewerInvitationEmail,
} from "@/lib/email/reviewer-invitation";
import { STATUS_LABELS } from "@/types/dashboard";
import type { SubmissionStatus } from "@/types/dashboard";

export const runtime = "nodejs";

type Body = {
  submissionId?: string;
  reviewerId?: string;
};

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Server email is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON and RESEND_API_KEY.",
      },
      { status: 503 }
    );
  }

  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const submissionId = body.submissionId?.trim();
  const reviewerId = body.reviewerId?.trim();
  if (!submissionId || !reviewerId) {
    return NextResponse.json(
      { error: "submissionId and reviewerId are required." },
      { status: 400 }
    );
  }

  const db = getAdminFirestore();
  const subSnap = await db.doc(`submissions/${submissionId}`).get();
  if (!subSnap.exists) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const sub = subSnap.data()!;
  if (sub.assignedReviewerId !== reviewerId) {
    return NextResponse.json(
      { error: "Save the reviewer assignment before sending the invitation email." },
      { status: 400 }
    );
  }

  const reviewerSnap = await db.doc(`users/${reviewerId}`).get();
  if (!reviewerSnap.exists) {
    return NextResponse.json({ error: "Reviewer profile not found." }, { status: 404 });
  }

  const reviewer = reviewerSnap.data()!;
  const reviewerEmail = String(reviewer.email ?? "").trim();
  if (!reviewerEmail) {
    return NextResponse.json({ error: "Reviewer has no email on file." }, { status: 400 });
  }

  const status = (sub.status as SubmissionStatus) ?? "pending";
  const statusLabel = STATUS_LABELS[status] ?? status;
  const baseUrl = getSiteBaseUrl();

  try {
    const { messageId } = await sendReviewerInvitationEmail({
      reviewerEmail,
      reviewerName: String(reviewer.displayName || reviewerEmail),
      submissionId,
      title: String(sub.title ?? ""),
      abstract: String(sub.abstract ?? ""),
      category: String(sub.category ?? ""),
      status: statusLabel,
      dashboardUrl: `${baseUrl}/dashboard?view=reviewer`,
    });

    await db.collection("email_logs").add({
      type: "reviewer_invitation",
      submissionId,
      reviewerId,
      recipient: reviewerEmail,
      sentBy: admin.uid,
      providerMessageId: messageId,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true, messageId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
