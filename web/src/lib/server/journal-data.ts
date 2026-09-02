import "server-only";
import type { DocumentData } from "firebase-admin/firestore";
import type { Article, Issue, IssueWithArticles } from "@/types/journal";
import { isFirebaseAdminConfigured, getAdminFirestore } from "@/lib/firebase-admin";

/**
 * Server-side (Firebase Admin) reads of journal content, used from Server
 * Components so real article/issue data is present in the initial HTML
 * response. This matters because AI crawlers and link-preview fetchers
 * (GPTBot, ChatGPT's URL reader, Perplexity, etc.) generally fetch raw HTML
 * and do not execute client-side JavaScript, so data that only loads via a
 * client `useEffect` fetch is invisible to them.
 */

function mapIssue(id: string, data: DocumentData): Issue {
  return {
    id,
    volume: Number(data.volume),
    issueNumber: Number(data.issueNumber),
    year: Number(data.year),
    monthLabel: String(data.monthLabel ?? ""),
    title: String(data.title ?? ""),
    archiveDisplayName: data.archiveDisplayName
      ? String(data.archiveDisplayName)
      : undefined,
    publishedAt: (data.publishedAt as Issue["publishedAt"]) ?? null,
    slug: String(data.slug ?? id),
    isCurrent: Boolean(data.isCurrent),
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
  };
}

function mapArticle(id: string, data: DocumentData): Article {
  return {
    id,
    title: String(data.title ?? ""),
    authors: Array.isArray(data.authors) ? (data.authors as unknown[]).map(String) : [],
    pageStart: Number(data.pageStart ?? 0),
    pageEnd: Number(data.pageEnd ?? 0),
    pdfUrl: data.pdfUrl ? String(data.pdfUrl) : undefined,
    orderIndex: Number(data.orderIndex ?? 0),
  };
}

async function fetchArticlesForIssue(issueId: string): Promise<Article[]> {
  const db = getAdminFirestore();
  const snap = await db
    .collection("issues")
    .doc(issueId)
    .collection("articles")
    .orderBy("orderIndex", "asc")
    .get();
  return snap.docs.map((d) => mapArticle(d.id, d.data()));
}

export async function fetchAllIssuesServer(): Promise<Issue[]> {
  if (!isFirebaseAdminConfigured()) return [];
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("issues").orderBy("publishedAt", "desc").get();
    return snap.docs.map((d) => mapIssue(d.id, d.data()));
  } catch (err) {
    console.error("[journal-data] fetchAllIssuesServer failed:", err);
    return [];
  }
}

export async function fetchIssueBySlugServer(
  slug: string
): Promise<IssueWithArticles | null> {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    const db = getAdminFirestore();
    const snap = await db.collection("issues").where("slug", "==", slug).limit(1).get();
    const issueDoc = snap.docs[0];
    if (!issueDoc) return null;
    const issue = mapIssue(issueDoc.id, issueDoc.data());
    const articles = await fetchArticlesForIssue(issueDoc.id);
    return { ...issue, articles };
  } catch (err) {
    console.error("[journal-data] fetchIssueBySlugServer failed:", err);
    return null;
  }
}

export async function fetchCurrentIssueServer(): Promise<IssueWithArticles | null> {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    const db = getAdminFirestore();
    let issueDoc = (
      await db.collection("issues").where("isCurrent", "==", true).limit(1).get()
    ).docs[0];
    if (!issueDoc) {
      issueDoc = (
        await db.collection("issues").orderBy("publishedAt", "desc").limit(1).get()
      ).docs[0];
    }
    if (!issueDoc) return null;
    const issue = mapIssue(issueDoc.id, issueDoc.data());
    const articles = await fetchArticlesForIssue(issueDoc.id);
    return { ...issue, articles };
  } catch (err) {
    console.error("[journal-data] fetchCurrentIssueServer failed:", err);
    return null;
  }
}
