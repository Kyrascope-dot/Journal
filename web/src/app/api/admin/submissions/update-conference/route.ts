import { Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import type { ConferenceFeeWaiver, ConferenceTrack } from "@/types/dashboard";

export const runtime = "nodejs";

const TRACK_VALUES: ConferenceTrack[] = [
  "track_1",
  "track_2",
  "track_3",
  "track_4",
  "track_5",
];

const WAIVER_VALUES: ConferenceFeeWaiver[] = ["none", "full", "partial"];

type Body = {
  submissionId?: string;
  conferenceTrack?: ConferenceTrack | null;
  conferenceFeeWaiver?: ConferenceFeeWaiver;
  paymentCompleted?: boolean;
  paymentLinkSent?: boolean;
  paymentReminderSent?: boolean;
};

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
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
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  const hasTrack = Object.prototype.hasOwnProperty.call(body, "conferenceTrack");
  const hasWaiver = Object.prototype.hasOwnProperty.call(body, "conferenceFeeWaiver");
  const hasPaymentCompleted = Object.prototype.hasOwnProperty.call(body, "paymentCompleted");
  const hasPaymentLinkSent = Object.prototype.hasOwnProperty.call(body, "paymentLinkSent");
  const hasPaymentReminderSent = Object.prototype.hasOwnProperty.call(
    body,
    "paymentReminderSent"
  );

  if (
    !hasTrack &&
    !hasWaiver &&
    !hasPaymentCompleted &&
    !hasPaymentLinkSent &&
    !hasPaymentReminderSent
  ) {
    return NextResponse.json(
      {
        error:
          "Provide at least one field to update (track, waiver, paymentCompleted, paymentLinkSent, or paymentReminderSent).",
      },
      { status: 400 }
    );
  }

  if (hasTrack && body.conferenceTrack != null && !TRACK_VALUES.includes(body.conferenceTrack)) {
    return NextResponse.json({ error: "Invalid conference track." }, { status: 400 });
  }

  if (
    hasWaiver &&
    body.conferenceFeeWaiver != null &&
    !WAIVER_VALUES.includes(body.conferenceFeeWaiver)
  ) {
    return NextResponse.json({ error: "Invalid fee waiver value." }, { status: 400 });
  }

  const db = getAdminFirestore();
  const submissionRef = db.doc(`submissions/${submissionId}`);
  const snap = await submissionRef.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Submission not found." }, { status: 404 });
  }

  const submission = snap.data()!;
  if (submission.submissionPurpose !== "conference") {
    return NextResponse.json(
      { error: "Conference fields apply to conference submissions only." },
      { status: 400 }
    );
  }

  const now = Timestamp.now();
  const update: Record<string, unknown> = {
    lastUpdatedAt: now,
  };

  if (hasTrack) {
    update.conferenceTrack = body.conferenceTrack ?? null;
  }
  if (hasWaiver) {
    update.conferenceFeeWaiver = body.conferenceFeeWaiver ?? "none";
  }
  if (hasPaymentCompleted) {
    update.paymentCompleted = Boolean(body.paymentCompleted);
  }
  if (hasPaymentLinkSent) {
    update.paymentLinkSent = Boolean(body.paymentLinkSent);
    update.paymentLinkSentAt = body.paymentLinkSent ? now : null;
  }
  if (hasPaymentReminderSent) {
    update.paymentReminderSent = Boolean(body.paymentReminderSent);
    update.paymentReminderSentAt = body.paymentReminderSent ? now : null;
  }

  await submissionRef.update(update);

  return NextResponse.json({
    ok: true,
    submissionId,
    registrationId: String(submission.registrationId ?? submissionId),
    conferenceTrack: hasTrack ? (body.conferenceTrack ?? null) : submission.conferenceTrack ?? null,
    conferenceFeeWaiver: hasWaiver
      ? (body.conferenceFeeWaiver ?? "none")
      : submission.conferenceFeeWaiver ?? "none",
    paymentCompleted: hasPaymentCompleted
      ? Boolean(body.paymentCompleted)
      : Boolean(submission.paymentCompleted ?? false),
    paymentLinkSent: hasPaymentLinkSent
      ? Boolean(body.paymentLinkSent)
      : Boolean(submission.paymentLinkSent ?? false),
    paymentReminderSent: hasPaymentReminderSent
      ? Boolean(body.paymentReminderSent)
      : Boolean(submission.paymentReminderSent ?? false),
  });
}
