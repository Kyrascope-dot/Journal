import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { getSiteBaseUrl } from "@/lib/email/reviewer-invitation";
import { sendSubmissionConfirmationEmail } from "@/lib/email/submission-confirmation";
import { verifyUserIdToken } from "@/lib/server/verify-user";
import {
  STATUS_LABELS,
  SUBMISSION_PURPOSE_LABELS,
  type ConferenceAwardIntent,
  type ConferenceQuarter,
  type SubmissionPurpose,
} from "@/types/dashboard";

export const runtime = "nodejs";

type Body = {
  title?: string;
  abstract?: string;
  affiliation?: string;
  category?: string;
  submissionPurpose?: SubmissionPurpose;
  conferenceQuarter?: ConferenceQuarter | null;
  conferenceAwardIntent?: ConferenceAwardIntent | null;
};

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server-side submission registration is not configured." },
      { status: 503 }
    );
  }

  const user = await verifyUserIdToken(request.headers.get("authorization"));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const title = cleanString(body.title, 500);
  const abstract = cleanString(body.abstract, 20_000);
  const affiliation = cleanString(body.affiliation, 500);
  const category = cleanString(body.category, 300);
  const purpose = body.submissionPurpose;
  const isConference = purpose === "conference";

  if (!title || !abstract || !affiliation || !category) {
    return NextResponse.json(
      { error: "Title, abstract, affiliation, and category are required." },
      { status: 400 }
    );
  }
  if (purpose !== "journal" && purpose !== "conference") {
    return NextResponse.json({ error: "Invalid submission type." }, { status: 400 });
  }
  if (
    isConference &&
    (!["q1", "q2", "q3", "q4"].includes(body.conferenceQuarter ?? "") ||
      !["best_paper", "best_presenter", "both"].includes(
        body.conferenceAwardIntent ?? ""
      ))
  ) {
    return NextResponse.json(
      { error: "Conference quarter and award category are required." },
      { status: 400 }
    );
  }

  const db = getAdminFirestore();
  const profileSnap = await db.doc(`users/${user.uid}`).get();
  const profile = profileSnap.data();
  const authorEmail = cleanString(profile?.email ?? user.email, 320);
  const authorName = cleanString(profile?.displayName ?? authorEmail, 300);
  const now = Timestamp.now();
  const year = now.toDate().getUTCFullYear();
  const prefix = isConference ? "GCRC" : "GCRJ";
  const counterRef = db.doc(`registrationCounters/${prefix}-${year}`);
  const submissionRef = db.collection("submissions").doc();

  let registrationId = "";
  await db.runTransaction(async (transaction) => {
    const counterSnap = await transaction.get(counterRef);
    const lastNumber = counterSnap.exists
      ? Number(counterSnap.data()?.lastNumber ?? 0)
      : 0;
    const nextNumber = lastNumber + 1;
    registrationId = `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`;
    const registrationRef = db.doc(`registrationIds/${registrationId}`);
    const registrationSnap = await transaction.get(registrationRef);
    if (registrationSnap.exists) {
      throw new Error("Registration ID collision. Please retry.");
    }

    transaction.set(
      counterRef,
      {
        prefix,
        year,
        lastNumber: nextNumber,
        updatedAt: now,
      },
      { merge: true }
    );
    transaction.create(registrationRef, {
      registrationId,
      submissionId: submissionRef.id,
      submissionPurpose: purpose,
      createdAt: now,
    });
    transaction.create(submissionRef, {
      registrationId,
      title,
      abstract,
      affiliation,
      category,
      submissionPurpose: purpose,
      conferenceQuarter: isConference ? body.conferenceQuarter : null,
      conferenceAwardIntent: isConference ? body.conferenceAwardIntent : null,
      authorId: user.uid,
      authorName,
      authorEmail,
      status: "pending",
      assignedEditorId: null,
      assignedEditorName: null,
      assignedReviewerId: null,
      assignedReviewerName: null,
      reviewDeadline: null,
      statusNote: null,
      submittedAt: now,
      lastUpdatedAt: now,
    });
    transaction.create(submissionRef.collection("statusHistory").doc(), {
      registrationId,
      status: "pending",
      note: "Submission received.",
      createdAt: now,
      changedById: user.uid,
      changedByName: "Author",
      changedByRole: "scholar",
    });
  });

  let emailSent = false;
  try {
    const result = await sendSubmissionConfirmationEmail({
      authorEmail,
      authorName,
      registrationId,
      title,
      submissionType: SUBMISSION_PURPOSE_LABELS[purpose],
      submittedAt: now.toDate().toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      }),
      status: STATUS_LABELS.pending,
      dashboardUrl: `${getSiteBaseUrl()}/dashboard?view=author`,
    });
    emailSent = true;
    await db.collection("email_logs").add({
      type: "submission_confirmation",
      submissionId: submissionRef.id,
      registrationId,
      recipient: authorEmail,
      providerMessageId: result.messageId,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch {
    // Submission remains valid if email delivery is temporarily unavailable.
  }

  return NextResponse.json({
    ok: true,
    submissionId: submissionRef.id,
    registrationId,
    submittedAt: now.toDate().toISOString(),
    emailSent,
  });
}
