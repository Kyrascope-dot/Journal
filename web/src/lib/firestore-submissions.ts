import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type {
  Comment,
  Submission,
  SubmissionStatus,
  UserRole,
} from "@/types/dashboard";

function mapSubmission(
  id: string,
  data: Record<string, unknown>
): Submission {
  return {
    id,
    title: String(data.title ?? ""),
    abstract: String(data.abstract ?? ""),
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    authorEmail: String(data.authorEmail ?? ""),
    affiliation: String(data.affiliation ?? ""),
    category: String(data.category ?? ""),
    status: (data.status as SubmissionStatus) ?? "pending",
    submittedAt: data.submittedAt as Submission["submittedAt"],
    lastUpdatedAt: data.lastUpdatedAt as Submission["lastUpdatedAt"],
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
  authorId: string;
  authorName: string;
  authorEmail: string;
}): Promise<string> {
  const db = getDb();
  const ref = await addDoc(collection(db, "submissions"), {
    ...payload,
    status: "pending" as SubmissionStatus,
    assignedEditorId: null,
    assignedEditorName: null,
    assignedReviewerId: null,
    assignedReviewerName: null,
    statusNote: null,
    submittedAt: serverTimestamp(),
    lastUpdatedAt: serverTimestamp(),
  });
  return ref.id;
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
  statusNote?: string
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "submissions", submissionId), {
    status,
    statusNote: statusNote ?? null,
    lastUpdatedAt: serverTimestamp(),
  });
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
    status: "under_review" as SubmissionStatus,
    lastUpdatedAt: serverTimestamp(),
  });
}

/** Admin: assign a peer reviewer (identity visible only to admin and that reviewer). */
export async function assignReviewer(
  submissionId: string,
  reviewerId: string | null,
  reviewerName: string | null
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "submissions", submissionId), {
    assignedReviewerId: reviewerId,
    assignedReviewerName: reviewerName,
    lastUpdatedAt: serverTimestamp(),
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
