import { NextResponse } from "next/server";
import { getSubmissionActionEmailStatus } from "@/lib/conference-admin-email";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const submissionId = searchParams.get("submissionId")?.trim();
  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required." }, { status: 400 });
  }

  try {
    const status = await getSubmissionActionEmailStatus(submissionId);
    return NextResponse.json({ status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load submission email status.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
