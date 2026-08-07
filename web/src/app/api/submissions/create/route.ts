import { Timestamp } from "firebase-admin/firestore";
import { after, NextResponse } from "next/server";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { notificationQueue } from "@/lib/email/submission-notifications";
import { verifyUserIdToken } from "@/lib/server/verify-user";
import type {
  ConferenceAwardIntent,
  ConferenceQuarter,
  SubmissionPurpose,
  SubmissionStatus,
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
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        {
          error:
            "Server-side submission registration is not configured. Ask the administrator to set Firebase Admin credentials on the server.",
        },
        { status: 503 }
      );
    }

    const user = await verifyUserIdToken(request.headers.get("authorization"));
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in again and retry." },
        { status: 401 }
      );
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
    if (!authorEmail) {
      return NextResponse.json(
        { error: "Your account email is missing. Update your profile and try again." },
        { status: 400 }
      );
    }

    const now = Timestamp.now();
    const year = now.toDate().getUTCFullYear();
    const prefix = isConference ? "GCRC" : "GCRJ";
    const initialStatus: SubmissionStatus = isConference
      ? "pending"
      : "editorial_screening";
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
        status: initialStatus,
        assignedEditorId: null,
        assignedEditorName: null,
        assignedReviewerId: null,
        assignedReviewerName: null,
        reviewDeadline: null,
        statusNote: null,
        lastEmailSent: null,
        lastEmailTemplate: isConference
          ? "conference_submission_received"
          : "journal_submission_received",
        emailStatus: "pending",
        emailTimestamp: now,
        deliveryStatus: "queued",
        submittedAt: now,
        lastUpdatedAt: now,
      });
      transaction.create(submissionRef.collection("statusHistory").doc(), {
        registrationId,
        status: initialStatus,
        note: isConference
          ? "Conference abstract submitted."
          : "Manuscript received and entered editorial screening.",
        createdAt: now,
        changedById: user.uid,
        changedByName: "Author",
        changedByRole: "scholar",
      });
    });

    // Never block registration on email. Attempt delivery after the response is sent.
    const emailPayload = {
      submissionId: submissionRef.id,
      submission: {
        registrationId,
        title,
        authorName,
        authorEmail,
        submissionPurpose: purpose,
        conferenceAwardIntent: isConference ? body.conferenceAwardIntent : null,
        submittedAt: now,
      },
      status: initialStatus,
      trigger: "create" as const,
      createdBy: user.uid,
    };

    after(() => {
      void notificationQueue
        .enqueueAndProcess(emailPayload)
        .then(async (result) => {
          if (result.emailSent || !result.emailRequired) return;
          try {
            await submissionRef.update({
              emailStatus: "failed",
              deliveryStatus: "failed",
              emailTimestamp: Timestamp.now(),
            });
          } catch {
            // Best-effort metadata only.
          }
        })
        .catch(async (emailError) => {
          console.error("[submissions/create] confirmation email failed:", emailError);
          try {
            await submissionRef.update({
              emailStatus: "failed",
              deliveryStatus: "failed",
              emailTimestamp: Timestamp.now(),
            });
          } catch {
            // Submission is already saved.
          }
        });
    });

    return NextResponse.json({
      ok: true,
      submissionId: submissionRef.id,
      registrationId,
      submittedAt: now.toDate().toISOString(),
      // Email is attempted asynchronously; treat registration as success either way.
      emailSent: false,
      emailQueued: true,
    });
  } catch (error) {
    console.error("[submissions/create]", error);
    const message =
      error instanceof Error ? error.message : "Could not register submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
