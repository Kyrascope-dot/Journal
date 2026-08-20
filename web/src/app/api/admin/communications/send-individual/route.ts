import { NextResponse } from "next/server";
import { previewIndividualEmail, sendIndividualEmail } from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";
import type { SendIndividualPayload } from "@/types/communications";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const body = (await request.json()) as SendIndividualPayload;
    if (!body.submissionId?.trim()) {
      return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
    }
    if (!body.subject?.trim() || !body.bodyHtml?.trim()) {
      return NextResponse.json(
        { error: "subject and bodyHtml are required." },
        { status: 400 }
      );
    }

    const payload = {
      submissionId: body.submissionId.trim(),
      subject: body.subject.trim(),
      bodyHtml: body.bodyHtml,
      bodyText: body.bodyText,
      templateId: body.templateId,
    };

    if (body.previewOnly) {
      const preview = await previewIndividualEmail(payload);
      return NextResponse.json({ preview });
    }

    const result = await sendIndividualEmail(admin, payload);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not send email.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
