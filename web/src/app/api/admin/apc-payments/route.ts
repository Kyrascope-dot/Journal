import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { listApcRecordsForAdmin } from "@/lib/payments/apc-admin";
import { getApcOfficeRecipient } from "@/lib/payments/apc-payment-notification";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** APC Payment and Billing Details Forms with their payments (admins only). */
export async function GET(request: Request) {
  try {
    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json({ error: "Payment service is not configured." }, { status: 503 });
    }
    const admin = await verifyAdminIdToken(request.headers.get("authorization"));
    if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    return NextResponse.json({
      records: await listApcRecordsForAdmin(),
      officeEmail: getApcOfficeRecipient(),
    });
  } catch (error) {
    console.error("[admin/apc-payments]", error);
    const message = error instanceof Error ? error.message : "Could not load APC payments.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
