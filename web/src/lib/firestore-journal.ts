/**
 * Firestore layout (public reads):
 * - issues/{issueId}: volume, issueNumber, year, monthLabel, title, publishedAt (Timestamp),
 *   slug (string, unique), isCurrent (boolean, optional),
 *   pdfUrl (optional string — path like "/GCR_Vol1_Issue1_FINAL.pdf" or a full HTTPS URL)
 * - issues/{issueId}/articles/{articleId}: title, authors (string[]), pageStart, pageEnd,
 *   pdfUrl (optional, HTTPS to Storage or external), orderIndex (number)
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import type { Article, Issue, IssueWithArticles } from "@/types/journal";
import { getDb } from "@/lib/firebase";

function mapIssue(id: string, data: Record<string, unknown>): Issue {
  return {
    id,
    volume: Number(data.volume),
    issueNumber: Number(data.issueNumber),
    year: Number(data.year),
    monthLabel: String(data.monthLabel ?? ""),
    title: String(data.title ?? ""),
    publishedAt: data.publishedAt as Issue["publishedAt"],
    slug: String(data.slug ?? id),
    isCurrent: Boolean(data.isCurrent),
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
  };
}

function mapArticle(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    title: String(data.title ?? ""),
    authors: Array.isArray(data.authors)
      ? (data.authors as unknown[]).map(String)
      : [],
    pageStart: Number(data.pageStart ?? 0),
    pageEnd: Number(data.pageEnd ?? 0),
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
    orderIndex: Number(data.orderIndex ?? 0),
  };
}

export async function fetchCurrentIssue(): Promise<IssueWithArticles | null> {
  const db = getDb();
  const byFlag = query(
    collection(db, "issues"),
    where("isCurrent", "==", true),
    limit(1)
  );
  const snap = await getDocs(byFlag);
  let issueDoc = snap.docs[0];
  if (!issueDoc) {
    const latest = query(
      collection(db, "issues"),
      orderBy("publishedAt", "desc"),
      limit(1)
    );
    const latestSnap = await getDocs(latest);
    issueDoc = latestSnap.docs[0];
  }
  if (!issueDoc) return null;

  const issue = mapIssue(issueDoc.id, issueDoc.data());
  const articlesSnap = await getDocs(
    query(
      collection(db, "issues", issueDoc.id, "articles"),
      orderBy("orderIndex", "asc")
    )
  );
  const articles = articlesSnap.docs.map((d) =>
    mapArticle(d.id, d.data() as Record<string, unknown>)
  );
  return { ...issue, articles };
}

export async function fetchIssueBySlug(
  slug: string
): Promise<IssueWithArticles | null> {
  const db = getDb();
  const q = query(collection(db, "issues"), where("slug", "==", slug), limit(1));
  const snap = await getDocs(q);
  const issueDoc = snap.docs[0];
  if (!issueDoc) return null;
  const issue = mapIssue(issueDoc.id, issueDoc.data());
  const articlesSnap = await getDocs(
    query(
      collection(db, "issues", issueDoc.id, "articles"),
      orderBy("orderIndex", "asc")
    )
  );
  const articles = articlesSnap.docs.map((d) =>
    mapArticle(d.id, d.data() as Record<string, unknown>)
  );
  return { ...issue, articles };
}

export async function fetchAllIssues(): Promise<Issue[]> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, "issues"), orderBy("publishedAt", "desc"))
  );
  return snap.docs.map((d) => mapIssue(d.id, d.data()));
}

export async function fetchIssueById(
  issueId: string
): Promise<IssueWithArticles | null> {
  const db = getDb();
  const ref = doc(db, "issues", issueId);
  const issueDoc = await getDoc(ref);
  if (!issueDoc.exists()) return null;
  const issue = mapIssue(issueDoc.id, issueDoc.data() as Record<string, unknown>);
  const articlesSnap = await getDocs(
    query(
      collection(db, "issues", issueId, "articles"),
      orderBy("orderIndex", "asc")
    )
  );
  const articles = articlesSnap.docs.map((d) =>
    mapArticle(d.id, d.data() as Record<string, unknown>)
  );
  return { ...issue, articles };
}
