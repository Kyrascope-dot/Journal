import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getDb } from "@/lib/firebase";
import type { UserProfile, UserRole } from "@/types/dashboard";

/** Emails that are always treated as admins, regardless of the Firestore role field. */
const ADMIN_EMAILS = [
  "sonam.dobriyal@athenaeducation.co.in",
  "editorglobalconfluencereview@gmail.com",
];

function resolveRole(email: string, storedRole: UserRole): UserRole {
  return ADMIN_EMAILS.includes(email.toLowerCase()) ? "admin" : storedRole;
}

function mapProfile(id: string, data: Record<string, unknown>): UserProfile {
  const email = String(data.email ?? "");
  const storedRole = (data.role as UserRole) ?? "scholar";
  return {
    uid: id,
    email,
    displayName: String(data.displayName ?? ""),
    role: resolveRole(email, storedRole),
    affiliation: data.affiliation ? String(data.affiliation) : undefined,
    assignedCategories: Array.isArray(data.assignedCategories)
      ? (data.assignedCategories as unknown[]).map(String)
      : [],
    createdAt: data.createdAt as UserProfile["createdAt"],
  };
}

/** Fetch existing profile or create one. Admin emails get role 'admin' automatically. */
export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const db = getDb();
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const email = user.email ?? "";
  const role: UserRole = resolveRole(email, "scholar");

  if (snap.exists()) {
    const profile = mapProfile(snap.id, snap.data() as Record<string, unknown>);
    // If the stored role is still 'scholar' but the email is an admin email,
    // upgrade the stored role so the Firestore rules also reflect it.
    if (
      ADMIN_EMAILS.includes(email.toLowerCase()) &&
      (snap.data() as Record<string, unknown>).role !== "admin"
    ) {
      await updateDoc(ref, { role: "admin" });
    }
    return profile;
  }

  const data = {
    email,
    displayName: user.displayName ?? "",
    role,
    affiliation: "",
    assignedCategories: [],
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return { uid: user.uid, ...data, createdAt: new Date() };
}

/** Update scholar profile fields (displayName, affiliation). */
export async function updateScholarProfile(
  uid: string,
  data: { displayName?: string; affiliation?: string }
): Promise<void> {
  const db = getDb();
  await updateDoc(doc(db, "users", uid), data);
}

/** Admin: change a user's role and optional editor categories. */
export async function setUserRole(
  uid: string,
  role: UserRole,
  assignedCategories?: string[]
): Promise<void> {
  const db = getDb();
  const update: Record<string, unknown> = { role };
  if (assignedCategories !== undefined) {
    update.assignedCategories = assignedCategories;
  }
  await updateDoc(doc(db, "users", uid), update);
}

/** Admin: fetch all user profiles. */
export async function getAllUsers(): Promise<UserProfile[]> {
  const db = getDb();
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) =>
    mapProfile(d.id, d.data() as Record<string, unknown>)
  );
}

/** Fetch all editors (users with role = 'editor'). */
export async function getAllEditors(): Promise<UserProfile[]> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("role", "==", "editor"))
  );
  return snap.docs.map((d) =>
    mapProfile(d.id, d.data() as Record<string, unknown>)
  );
}

/** Look up a user by email (for admin assigning editor role). */
export async function findUserByEmail(
  email: string
): Promise<UserProfile | null> {
  const db = getDb();
  const snap = await getDocs(
    query(collection(db, "users"), where("email", "==", email))
  );
  if (snap.empty) return null;
  return mapProfile(
    snap.docs[0].id,
    snap.docs[0].data() as Record<string, unknown>
  );
}
