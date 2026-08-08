import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { listPaymentsForUser } from "@/lib/payments/payment-store";
import { verifyUserIdToken } from "@/lib/server/verify-user";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({ error: "Not configured." }, { status: 503 });
    }
    const user = await verifyUserIdToken(request.headers.get("authorization"));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const payments = await listPaymentsForUser(user.uid);
    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[payments/mine]", error);
    const message = error instanceof Error ? error.message : "Could not load payments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
