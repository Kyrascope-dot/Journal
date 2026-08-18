import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight probe used to verify API routes are reachable on Vercel. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "gcr-web",
    firebaseAdminConfigured: Boolean(
      process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim() ||
        (process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
          process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
          process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim())
    ),
    resendConfigured: Boolean(process.env.RESEND_API_KEY?.trim()),
    paypalConfigured: Boolean(
      process.env.PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim()
    ),
    timestamp: new Date().toISOString(),
  });
}
