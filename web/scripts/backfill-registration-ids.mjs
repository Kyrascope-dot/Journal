import { cert, getApps, initializeApp } from "firebase-admin/app";
import { Timestamp, getFirestore } from "firebase-admin/firestore";

const apply = process.argv.includes("--apply");

function loadCredential() {
  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    return cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Firebase Admin credentials are required.");
  }
  const account = JSON.parse(raw);
  return cert({
    projectId: account.project_id,
    clientEmail: account.client_email,
    privateKey: account.private_key,
  });
}

if (getApps().length === 0) {
  initializeApp({ credential: loadCredential() });
}

const db = getFirestore();
const snapshot = await db.collection("submissions").get();
const submissions = snapshot.docs
  .map((document) => ({ document, data: document.data() }))
  .sort((a, b) => {
    const aTime = a.data.submittedAt?.toMillis?.() ?? 0;
    const bTime = b.data.submittedAt?.toMillis?.() ?? 0;
    return aTime - bTime;
  });

const existingMaximums = new Map();
for (const { data } of submissions) {
  const match = String(data.registrationId ?? "").match(
    /^(GCRJ|GCRC)-(\d{4})-(\d{6})$/
  );
  if (!match) continue;
  const key = `${match[1]}-${match[2]}`;
  existingMaximums.set(
    key,
    Math.max(existingMaximums.get(key) ?? 0, Number(match[3]))
  );
}

const missing = submissions.filter(({ data }) => !data.registrationId);
console.log(
  `${submissions.length} submissions found; ${missing.length} require Registration IDs.`
);

if (!apply) {
  console.log("Dry run only. Re-run with --apply to write changes.");
  process.exit(0);
}

for (const [key, maximum] of existingMaximums) {
  const [prefix, year] = key.split("-");
  await db.doc(`registrationCounters/${key}`).set(
    {
      prefix,
      year: Number(year),
      lastNumber: maximum,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}

for (const { document, data } of missing) {
  const submittedAt = data.submittedAt?.toDate?.() ?? new Date();
  const year = submittedAt.getUTCFullYear();
  const prefix = data.submissionPurpose === "conference" ? "GCRC" : "GCRJ";
  const counterRef = db.doc(`registrationCounters/${prefix}-${year}`);

  const registrationId = await db.runTransaction(async (transaction) => {
    const counter = await transaction.get(counterRef);
    const nextNumber = Number(counter.data()?.lastNumber ?? 0) + 1;
    const nextId = `${prefix}-${year}-${String(nextNumber).padStart(6, "0")}`;
    const indexRef = db.doc(`registrationIds/${nextId}`);
    const index = await transaction.get(indexRef);
    if (index.exists) throw new Error(`Collision detected for ${nextId}.`);

    transaction.set(
      counterRef,
      {
        prefix,
        year,
        lastNumber: nextNumber,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    transaction.update(document.ref, {
      registrationId: nextId,
      lastUpdatedAt: data.lastUpdatedAt ?? Timestamp.now(),
    });
    transaction.create(indexRef, {
      registrationId: nextId,
      submissionId: document.id,
      submissionPurpose: data.submissionPurpose ?? "journal",
      createdAt: data.submittedAt ?? Timestamp.now(),
      backfilled: true,
    });
    transaction.create(document.ref.collection("statusHistory").doc(), {
      registrationId: nextId,
      status: data.status ?? "pending",
      note: "Existing submission registered.",
      createdAt: data.lastUpdatedAt ?? data.submittedAt ?? Timestamp.now(),
      changedById: "migration",
      changedByName: "System migration",
      changedByRole: "admin",
    });
    return nextId;
  });

  console.log(`${document.id} -> ${registrationId}`);
}

console.log("Registration ID backfill complete.");
