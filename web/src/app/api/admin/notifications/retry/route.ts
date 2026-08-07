import { NextResponse } from "next/server";
import { notificationQueue } from "@/lib/email/submission-notifications";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let notificationId = "";
  try {
    const body = (await request.json()) as { notificationId?: string };
    notificationId = body.notificationId?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!notificationId) {
    return NextResponse.json({ error: "notificationId is required." }, { status: 400 });
  }

  const result = await notificationQueue.process(notificationId);
  return NextResponse.json({
    ok: true,
    emailSent: result.sent,
    notificationId,
    error: result.error,
  });
}
