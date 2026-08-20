import { NextResponse } from "next/server";
import { getSiteBaseUrl } from "@/lib/email/reviewer-invitation";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

const PAYMENT_LINK_TEMPLATE_ID = "conference_q3_2026_payment_link";
const PAYMENT_LINK_TEMPLATE_NAME = "Payment Link - GCR Conference July–September 2026";
const PAYMENT_LINK_SUBJECT = "Payment Link - GCR International Conference Q3 2026";

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && value !== null && "toDate" in value) {
    const dated = value as { toDate(): Date };
    if (typeof dated.toDate === "function") return dated.toDate().toISOString();
  }
  return null;
}

function isPaymentLinkLog(
  data: Record<string, unknown>,
  paymentTemplateIds: Set<string>
): boolean {
  if (String(data.deliveryStatus ?? "sent") !== "sent") return false;
  const template = String(data.template ?? "");
  const subject = String(data.subject ?? "");
  return paymentTemplateIds.has(template) || subject === PAYMENT_LINK_SUBJECT;
}

function buildPaymentLink(registrationId: string, waiver: string): string {
  const url = new URL("/conferences/payment", getSiteBaseUrl());
  url.searchParams.set("registrationId", registrationId);
  if (waiver === "partial" || waiver === "full") {
    url.searchParams.set("planId", "fee_waiver_usd");
  }
  return url.toString();
}

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const db = getAdminFirestore();
  const [submissionsSnap, logsSnap, templatesSnap] = await Promise.all([
    db
      .collection("submissions")
      .where("submissionPurpose", "==", "conference")
      .where("status", "==", "accepted")
      .get(),
    db.collection("email_logs").limit(2000).get(),
    db.collection("emailTemplates").get(),
  ]);

  const paymentTemplateIds = new Set<string>([PAYMENT_LINK_TEMPLATE_ID]);
  for (const doc of templatesSnap.docs) {
    const data = doc.data();
    if (
      data.seedKey === PAYMENT_LINK_TEMPLATE_ID ||
      data.name === PAYMENT_LINK_TEMPLATE_NAME ||
      data.subject === PAYMENT_LINK_SUBJECT
    ) {
      paymentTemplateIds.add(doc.id);
    }
  }

  const sentRegistrationIds = new Set<string>();
  const sentSubmissionIds = new Set<string>();
  for (const doc of logsSnap.docs) {
    const data = doc.data();
    if (!isPaymentLinkLog(data, paymentTemplateIds)) continue;
    const registrationId = String(data.registrationId ?? "").trim();
    const submissionId = String(data.submissionId ?? "").trim();
    if (registrationId) sentRegistrationIds.add(registrationId);
    if (submissionId) sentSubmissionIds.add(submissionId);
  }

  const pending = submissionsSnap.docs
    .map((doc) => {
      const data = doc.data();
      const registrationId = String(data.registrationId ?? doc.id);
      const waiver = String(data.conferenceFeeWaiver ?? "none");
      return {
        submissionId: doc.id,
        registrationId,
        authorName: String(data.authorName ?? ""),
        authorEmail: String(data.authorEmail ?? ""),
        title: String(data.title ?? ""),
        conferenceFeeWaiver: waiver,
        submittedAt: toIso(data.submittedAt),
        paymentLink: buildPaymentLink(registrationId, waiver),
      };
    })
    .filter(
      (submission) =>
        !sentRegistrationIds.has(submission.registrationId) &&
        !sentSubmissionIds.has(submission.submissionId)
    )
    .sort((a, b) => a.registrationId.localeCompare(b.registrationId));

  return NextResponse.json({
    totalAccepted: submissionsSnap.size,
    pendingCount: pending.length,
    pending,
  });
}
