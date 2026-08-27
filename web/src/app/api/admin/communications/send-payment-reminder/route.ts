import { NextResponse } from "next/server";
import { sendConferencePaymentReminderEmail } from "@/lib/conference-admin-email";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

type Body = {
  submissionId?: string;
  recipient?: string;
  paymentCompleted?: boolean;
};

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
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
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  try {
    const result = await sendConferencePaymentReminderEmail(admin, submissionId);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send payment reminder.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
