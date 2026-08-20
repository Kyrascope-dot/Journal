import { NextResponse } from "next/server";
import type {
  ConferenceAwardIntent,
  ConferenceQuarter,
  SubmissionPurpose,
  SubmissionStatus,
} from "@/types/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  title?: string;
  abstract?: string;
  affiliation?: string;
  category?: string;
  submissionPurpose?: SubmissionPurpose;
  conferenceQuarter?: ConferenceQuarter | null;
  conferenceAwardIntent?: ConferenceAwardIntent | null;
  authorName?: string;
  coAuthors?: unknown;
};

function cleanString(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function cleanCoAuthors(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const names: string[] = [];
  for (const item of value) {
    const name = cleanString(item, 300);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export async function POST(request: Request) {
  try {
    // Dynamic imports keep cold-start failures inside the handler (JSON),
    // instead of crashing the whole route module into an HTML 500 page.
    const { getAdminFirestore, isFirebaseAdminConfigured } = await import(
      "@/lib/firebase-admin"
    );
    const { verifyUserIdToken } = await import("@/lib/server/verify-user");
    const { Timestamp } = await import("firebase-admin/firestore");

    if (!isFirebaseAdminConfigured()) {
      return jsonError(
        "Server-side submission registration is not configured. Set Firebase Admin credentials on Vercel (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_ADMIN_*).",
        503
      );
    }

    const user = await verifyUserIdToken(request.headers.get("authorization"));
    if (!user) {
      return jsonError("Unauthorized. Please sign in again and retry.", 401);
    }

    let body: Body;
    try {
      body = (await request.json()) as Body;
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }

    const title = cleanString(body.title, 500);
    const abstract = cleanString(body.abstract, 20_000);
    const affiliation = cleanString(body.affiliation, 500);
    const category = cleanString(body.category, 300);
    const purpose = body.submissionPurpose;
    const isConference = purpose === "conference";

    if (!title || !abstract || !affiliation || !category) {
      return jsonError(
        "Title, abstract, affiliation, and category are required.",
        400
      );
    }
    if (purpose !== "journal" && purpose !== "conference") {
      return jsonError("Invalid submission type.", 400);
    }
    if (
      isConference &&
      (!["q1", "q2", "q3", "q4"].includes(body.conferenceQuarter ?? "") ||
        !["best_paper", "best_presenter", "both"].includes(
          body.conferenceAwardIntent ?? ""
        ))
    ) {
      return jsonError(
        "Conference quarter and award category are required.",
        400
      );
    }

    const db = getAdminFirestore();
    const profileSnap = await db.doc(`users/${user.uid}`).get();
    const profile = profileSnap.data();
    const authorEmail = cleanString(profile?.email ?? user.email, 320);
    const authorName = cleanString(body.authorName, 300) || cleanString(profile?.displayName ?? authorEmail, 300);
    const coAuthors = cleanCoAuthors(body.coAuthors);
    if (!authorEmail) {
      return jsonError(
        "Your account email is missing. Update your profile and try again.",
        400
      );
    }
    if (!authorName) {
      return jsonError("Author name is required.", 400);
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
        coAuthors,
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

    // Fire-and-forget confirmation email. Never block or fail registration.
    void import("@/lib/email/submission-notifications")
      .then(({ notificationQueue }) =>
        notificationQueue.enqueueAndProcess({
          submissionId: submissionRef.id,
          submission: {
            registrationId,
            title,
            authorName,
            authorEmail,
            submissionPurpose: purpose,
            conferenceAwardIntent: isConference
              ? body.conferenceAwardIntent
              : null,
            submittedAt: now,
          },
          status: initialStatus,
          trigger: "create",
          createdBy: user.uid,
        })
      )
      .then(async (result) => {
        if (!result || result.emailSent || !result.emailRequired) return;
        try {
          await submissionRef.update({
            emailStatus: "failed",
            deliveryStatus: "failed",
            emailTimestamp: Timestamp.now(),
          });
        } catch {
          // ignore
        }
      })
      .catch(async (emailError) => {
        console.error("[submissions/create] email skipped/failed:", emailError);
        try {
          await submissionRef.update({
            emailStatus: "failed",
            deliveryStatus: "failed",
            emailTimestamp: Timestamp.now(),
          });
        } catch {
          // ignore
        }
      });

    return NextResponse.json({
      ok: true,
      submissionId: submissionRef.id,
      registrationId,
      submittedAt: now.toDate().toISOString(),
      emailSent: false,
      emailQueued: true,
    });
  } catch (error) {
    console.error("[submissions/create]", error);
    const message =
      error instanceof Error ? error.message : "Could not register submission.";
    return jsonError(message, 500);
  }
}
