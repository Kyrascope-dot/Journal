import { getAdminAuth, isFirebaseAdminConfigured } from "@/lib/firebase-admin";

export type VerifiedUser = {
  uid: string;
  email: string;
};

export async function verifyUserIdToken(
  authorizationHeader: string | null
): Promise<VerifiedUser | null> {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  if (!isFirebaseAdminConfigured()) return null;

  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
    };
  } catch {
    return null;
  }
}
