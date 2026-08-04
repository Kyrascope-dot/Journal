import { isBootstrapAdminEmail } from "@/lib/admin-emails";
import { getAdminAuth, getAdminFirestore, isFirebaseAdminConfigured } from "@/lib/firebase-admin";
import type { UserRole } from "@/types/dashboard";

export async function verifyAdminIdToken(
  authorizationHeader: string | null
): Promise<{ uid: string; email: string } | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  if (!isFirebaseAdminConfigured()) return null;

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const email = decoded.email ?? "";
    const uid = decoded.uid;

    if (isBootstrapAdminEmail(email)) {
      return { uid, email };
    }

    const snap = await getAdminFirestore().doc(`users/${uid}`).get();
    const role = snap.exists ? (snap.data()?.role as UserRole) : "scholar";
    if (role === "admin") {
      return { uid, email };
    }
    return null;
  } catch {
    return null;
  }
}
