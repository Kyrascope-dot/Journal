import { NextResponse } from "next/server";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

type Body = {
  submissionId?: string;
};

async function deleteQueryBatch(
  query: FirebaseFirestore.Query,
  resolve: () => void
): Promise<void> {
  const db = getAdminFirestore();
  const snapshot = await query.limit(200).get();
  if (snapshot.empty) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  if (snapshot.size < 200) {
    resolve();
    return;
  }

  process.nextTick(() => {
    void deleteQueryBatch(query, resolve);
  });
}

function deleteCollection(collectionRef: FirebaseFirestore.CollectionReference) {
  return new Promise<void>((resolve, reject) => {
    deleteQueryBatch(collectionRef, resolve).catch(reject);
  });
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server-side submission management is not configured." },
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
  if (!submissionId) {
    return NextResponse.json({ error: "A valid submissionId is required." }, { status: 400 });
  }

  const db = getAdminFirestore();
  const submissionRef = db.doc(`submissions/${submissionId}`);

  try {
    const submissionSnap = await submissionRef.get();
    if (!submissionSnap.exists) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 });
    }

    const submission = submissionSnap.data()!;
    const registrationId = String(submission.registrationId ?? "");

    await Promise.all([
      deleteCollection(submissionRef.collection("comments")),
      deleteCollection(submissionRef.collection("statusHistory")),
    ]);

    const pendingNotifications = await db
      .collection("notificationQueue")
      .where("submissionId", "==", submissionId)
      .where("queueStatus", "==", "pending")
      .get();
    if (!pendingNotifications.empty) {
      const batch = db.batch();
      pendingNotifications.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    await submissionRef.delete();

    if (registrationId) {
      const registrationRef = db.doc(`registrationIds/${registrationId}`);
      const registrationSnap = await registrationRef.get();
      if (
        registrationSnap.exists &&
        String(registrationSnap.data()?.submissionId ?? "") === submissionId
      ) {
        await registrationRef.delete();
      }
    }

    return NextResponse.json({
      ok: true,
      submissionId,
      registrationId: registrationId || submissionId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
