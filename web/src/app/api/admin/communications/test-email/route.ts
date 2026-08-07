import { NextResponse } from "next/server";
import { sendTestEmail } from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = (await request.json()) as {
      to?: string;
      subject?: string;
      bodyHtml?: string;
      bodyText?: string;
      sampleSubmissionId?: string | null;
    };
    if (!body.to?.trim() || !body.subject?.trim() || !body.bodyHtml?.trim()) {
      return NextResponse.json(
        { error: "to, subject, and bodyHtml are required." },
        { status: 400 }
      );
    }
    const result = await sendTestEmail({
      to: body.to.trim(),
      subject: body.subject.trim(),
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      sampleSubmissionId: body.sampleSubmissionId,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send test email.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
