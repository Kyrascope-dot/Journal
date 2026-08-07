import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase";
import type {
  Comment,
  ConferenceAwardIntent,
  ConferenceQuarter,
  Submission,
  SubmissionPurpose,
  SubmissionStatus,
  SubmissionStatusEvent,
  UserRole,
} from "@/types/dashboard";

function mapSubmission(
  id: string,
  data: Record<string, unknown>
): Submission {
  return {
    id,
    registrationId: String(data.registrationId ?? id),
    title: String(data.title ?? ""),
    abstract: String(data.abstract ?? ""),
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    authorEmail: String(data.authorEmail ?? ""),
    affiliation: String(data.affiliation ?? ""),
    category: String(data.category ?? ""),
    submissionPurpose:
      data.submissionPurpose === "conference" ? "conference" : "journal",
    conferenceQuarter:
      data.submissionPurpose === "conference" &&
      (data.conferenceQuarter === "q1" ||
        data.conferenceQuarter === "q2" ||
        data.conferenceQuarter === "q3" ||
        data.conferenceQuarter === "q4")
        ? data.conferenceQuarter
        : null,
    conferenceAwardIntent:
      data.submissionPurpose === "conference" &&
      (data.conferenceAwardIntent === "best_paper" ||
        data.conferenceAwardIntent === "best_presenter" ||
        data.conferenceAwardIntent === "both")
        ? data.conferenceAwardIntent
        : null,
    status: (data.status as SubmissionStatus) ?? "pending",
    submittedAt: data.submittedAt as Submission["submittedAt"],
    lastUpdatedAt: data.lastUpdatedAt as Submission["lastUpdatedAt"],
    reviewDeadline: (data.reviewDeadline ?? null) as Submission["reviewDeadline"],
    assignedEditorId: data.assignedEditorId
      ? String(data.assignedEditorId)
      : null,
    assignedEditorName: data.assignedEditorName
      ? String(data.assignedEditorName)
      : null,
    assignedReviewerId: data.assignedReviewerId
      ? String(data.assignedReviewerId)
      : null,
    assignedReviewerName: data.assignedReviewerName
      ? String(data.assignedReviewerName)
      : null,
    statusNote: data.statusNote ? String(data.statusNote) : null,
    lastEmailSent: (data.lastEmailSent ?? null) as Submission["lastEmailSent"],
    lastEmailTemplate: data.lastEmailTemplate
      ? String(data.lastEmailTemplate)
      : null,
    emailStatus:
      data.emailStatus === "pending" ||
      data.emailStatus === "sent" ||
      data.emailStatus === "failed"
        ? data.emailStatus
        : "not_required",
    emailTimestamp: (data.emailTimestamp ?? null) as Submission["emailTimestamp"],
    deliveryStatus:
      data.deliveryStatus === "queued" ||
      data.deliveryStatus === "sent" ||
      data.deliveryStatus === "failed"
        ? data.deliveryStatus
        : "not_applicable",
  };
}

function mapStatusEvent(
  id: string,
  data: Record<string, unknown>
): SubmissionStatusEvent {
  return {
    id,
    registrationId: String(data.registrationId ?? ""),
    status: (data.status as SubmissionStatus) ?? "pending",
    note: data.note ? String(data.note) : null,
    createdAt: data.createdAt as SubmissionStatusEvent["createdAt"],
    changedByName: String(data.changedByName ?? ""),
    changedByRole: (data.changedByRole as UserRole) ?? "editor",
  };
}

function mapComment(id: string, data: Record<string, unknown>): Comment {
  return {
    id,
    text: String(data.text ?? ""),
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    authorRole: (data.authorRole as UserRole) ?? "scholar",
    createdAt: data.createdAt as Comment["createdAt"],
  };
}

/** Scholar: create a new submission. */
export async function createSubmission(payload: {
  title: string;
  abstract: string;
  affiliation: string;
  category: string;
  submissionPurpose: SubmissionPurpose;
  conferenceQuarter?: ConferenceQuarter | null;
  conferenceAwardIntent?: ConferenceAwardIntent | null;
  authorId: string;
  authorName: string;
  authorEmail: string;
}): Promise<{
  submissionId: string;
  registrationId: string;
  submittedAt: string;
  emailSent: boolean;
}> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("You must be signed in to submit.");
  const idToken = await user.getIdToken();
  const response = await fetch("/api/submissions/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: payload.title,
      abstract: payload.abstract,
      affiliation: payload.affiliation,
      category: payload.category,
      submissionPurpose: payload.submissionPurpose,
      conferenceQuarter: payload.conferenceQuarter ?? null,
      conferenceAwardIntent: payload.conferenceAwardIntent ?? null,
    }),
  });
  const data = (await response.json()) as {
    error?: string;
    submissionId?: string;
    registrationId?: string;
    submittedAt?: string;
    emailSent?: boolean;
  };
  if (!response.ok || !data.submissionId || !data.registrationId || !data.submittedAt) {
    throw new Error(data.error ?? "Could not register submission.");
  }
  return {
    submissionId: data.submissionId,
    registrationId: data.registrationId,
    submittedAt: data.submittedAt,
    emailSent: Boolean(data.emailSent),
  };
}

/** Sort submissions newest-first in memory (avoids composite index requirement). */
function sortByDate(submissions: Submission[]): Submission[] {
  return [...submissions].sort((a, b) => {
    const toMs = (v: Submission["submittedAt"]) => {
      if (!v) return 0;
      if (v instanceof Date) return v.getTime();
      return (v as { toMillis(): number }).toMillis();
    };
    return toMs(b.submittedAt) - toMs(a.submittedAt);
  });
}

/** Scholar: get all submissions by a specific author. */
export async function getSubmissionsByAuthor(
  authorId: string
): Promise<Submission[]> {
  const db = getDb();
  // No orderBy — sort client-side to avoid needing a composite index.
  const snap = await getDocs(
    query(collection(db, "submissions"), where("authorId", "==", authorId))
  );
  const results = snap.docs.map((d) =>
    mapSubmission(d.id, d.data() as Record<string, unknown>)
  );
  return sortByDate(results);
}

export async function getSubmissionById(
  submissionId: string
): Promise<Submission | null> {
  const db = getDb();
  const snap = await getDoc(doc(db, "submissions", submissionId));
  return snap.exists()
    ? mapSubmission(snap.id, snap.data() as Record<string, unknown>)
    : null;
}

/** Editor: papers explicitly assigned to this editor. */
export async function getSubmissionsByAssignedEditor(
  editorId: string
): Promise<Submission[]> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, "submissions"), where("assignedEditorId", "==", editorId))
  );
  const results = snap.docs.map((d) =>
    mapSubmission(d.id, d.data() as Record<string, unknown>)
  );
  return sortByDate(results);
}

/** Reviewer: papers assigned to this reviewer. */
export async function getSubmissionsByAssignedReviewer(
  reviewerId: string
): Promise<Submission[]> {
  const db = getDb();
  const snap = await getDocs(
    query(
      collection(db, "submissions"),
      where("assignedReviewerId", "==", reviewerId)
    )
  );
  const results = snap.docs.map((d) =>
    mapSubmission(d.id, d.data() as Record<string, unknown>)
  );
  return sortByDate(results);
}

/** Editor: assigned papers plus category queue (deduplicated). */
export async function getSubmissionsForEditor(
  editorId: string,
  categories: string[]
): Promise<Submission[]> {
  const [assigned, byCategory] = await Promise.all([
    getSubmissionsByAssignedEditor(editorId),
    categories.length > 0 ? getSubmissionsByCategories(categories) : Promise.resolve([]),
  ]);
  const byId = new Map<string, Submission>();
  for (const s of [...assigned, ...byCategory]) {
    byId.set(s.id, s);
  }
  return sortByDate([...byId.values()]);
}

/** Editor: get all submissions for a set of categories. */
export async function getSubmissionsByCategories(
  categories: string[]
): Promise<Submission[]> {
  if (categories.length === 0) return [];
  const db = getDb();
  // No orderBy — sort client-side to avoid needing a composite index.
  const snap = await getDocs(
    query(collection(db, "submissions"), where("category", "in", categories))
  );
  const results = snap.docs.map((d) =>
    mapSubmission(d.id, d.data() as Record<string, unknown>)
  );
  return sortByDate(results);
}

/** Admin: get all submissions, with optional filters applied client-side. */
export async function getAllSubmissions(filters?: {
  category?: string;
  status?: SubmissionStatus;
}): Promise<Submission[]> {
  const db = getDb();
  // Fetch everything without orderBy to avoid composite-index requirements,
  // then filter and sort in memory.
  const snap = await getDocs(collection(db, "submissions"));
  let results = snap.docs.map((d) =>
    mapSubmission(d.id, d.data() as Record<string, unknown>)
  );

  if (filters?.category) {
    results = results.filter((s) => s.category === filters.category);
  }
  if (filters?.status) {
    results = results.filter((s) => s.status === filters.status);
  }

  return sortByDate(results);
}

/** Editor/Admin: update the status of a submission. */
export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus,
  statusNote?: string,
  actor?: { id: string; name: string; role: UserRole; registrationId: string }
): Promise<void> {
  const db = getDb();
  const batch = writeBatch(db);
  batch.update(doc(db, "submissions", submissionId), {
    status,
    statusNote: statusNote ?? null,
    lastUpdatedAt: serverTimestamp(),
  });
  if (actor) {
    const historyRef = doc(
      collection(db, "submissions", submissionId, "statusHistory")
    );
    batch.set(historyRef, {
      registrationId: actor.registrationId,
      status,
      note: statusNote ?? null,
      createdAt: serverTimestamp(),
      changedById: actor.id,
      changedByName: actor.name,
      changedByRole: actor.role,
    });
  }
  await batch.commit();
}

/** Admin: assign an editor to a submission. */
export async function assignEditor(
  submissionId: string,
  editorId: string,
  editorName: string
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "submissions", submissionId), {
    assignedEditorId: editorId,
    assignedEditorName: editorName,
    lastUpdatedAt: serverTimestamp(),
  });
}

/** Admin: assign a peer reviewer (identity visible only to admin and that reviewer). */
export async function assignReviewer(
  submissionId: string,
  reviewerId: string | null,
  reviewerName: string | null,
  reviewDeadline: Date | null = null
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "submissions", submissionId), {
    assignedReviewerId: reviewerId,
    assignedReviewerName: reviewerName,
    reviewDeadline: reviewerId ? reviewDeadline : null,
    lastUpdatedAt: serverTimestamp(),
  });
}

export async function getSubmissionStatusHistory(
  submissionId: string
): Promise<SubmissionStatusEvent[]> {
  const db = getDb();
  const snap = await getDocs(
    collection(db, "submissions", submissionId, "statusHistory")
  );
  const events = snap.docs.map((item) =>
    mapStatusEvent(item.id, item.data() as Record<string, unknown>)
  );
  return events.sort((a, b) => {
    const toMs = (value: SubmissionStatusEvent["createdAt"]) => {
      if (!value) return 0;
      if (value instanceof Date) return value.getTime();
      return (value as { toMillis(): number }).toMillis();
    };
    return toMs(a.createdAt) - toMs(b.createdAt);
  });
}

/** Add a comment to a submission (editors and admins). */
export async function addComment(
  submissionId: string,
  payload: {
    text: string;
    authorId: string;
    authorName: string;
    authorRole: UserRole;
  }
): Promise<void> {
  const db = getDb();
  await addDoc(collection(db, "submissions", submissionId, "comments"), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}

/** Fetch all comments for a submission, sorted oldest-first. */
export async function getComments(submissionId: string): Promise<Comment[]> {
  const db = getDb();
  const snap = await getDocs(
    collection(db, "submissions", submissionId, "comments")
  );
  const results = snap.docs.map((d) =>
    mapComment(d.id, d.data() as Record<string, unknown>)
  );
  return results.sort((a, b) => {
    const toMs = (v: Comment["createdAt"]) => {
      if (!v) return 0;
      if (v instanceof Date) return v.getTime();
      return (v as { toMillis(): number }).toMillis();
    };
    return toMs(a.createdAt) - toMs(b.createdAt);
  });
}
