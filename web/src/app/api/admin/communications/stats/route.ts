import { NextResponse } from "next/server";
import {
  getCommunicationsStats,
  processDueScheduledCampaigns,
} from "@/lib/email/bulk-email-service";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    await processDueScheduledCampaigns(2);
    const stats = await getCommunicationsStats();
    return NextResponse.json({ stats });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
