import { NextResponse } from "next/server";
import { getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import { verifyAdminIdToken } from "@/lib/server/verify-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json({ error: "Email service is not configured." }, { status: 503 });
  }
  const admin = await verifyAdminIdToken(request.headers.get("authorization"));
  if (!admin) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const snapshot = await getAdminFirestore()
    .collection("email_logs")
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  return NextResponse.json({
    logs: snapshot.docs.map((document) => {
      const data = document.data();
      return {
        id: document.id,
        registrationId: String(data.registrationId ?? data.submissionId ?? "—"),
        recipient: String(data.recipient ?? ""),
        subject: String(data.subject ?? data.type ?? ""),
        template: String(data.template ?? data.type ?? ""),
        deliveryStatus: String(data.deliveryStatus ?? "sent"),
        error: data.error ? String(data.error) : null,
        notificationId: data.notificationId ? String(data.notificationId) : null,
        createdAt:
          typeof data.createdAt?.toDate === "function"
            ? data.createdAt.toDate().toISOString()
            : null,
      };
    }),
  });
}
