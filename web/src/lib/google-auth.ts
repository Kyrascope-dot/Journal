import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";

export async function signInWithGoogleAccount() {
  const auth = getFirebaseAuth();
  const cred = await signInWithPopup(auth, getGoogleProvider());
  await waitForAuthUser(auth, cred.user);
  return cred;
}

/** Ensures auth state is settled before the app navigates away from login. */
function waitForAuthUser(
  auth: ReturnType<typeof getFirebaseAuth>,
  expected: { uid: string } | null
): Promise<void> {
  if (expected && auth.currentUser?.uid === expected.uid) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const timeout = window.setTimeout(resolve, 3000);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && (!expected || u.uid === expected.uid)) {
        window.clearTimeout(timeout);
        unsub();
        resolve();
      }
    });
  });
}

export async function waitForSignedInUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return;
  await waitForAuthUser(auth, null);
}

/** Returns null when the user closed the popup (no alert needed). */
export function messageForGoogleAuthError(code: string): string | null {
  if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
    return null;
  }
  if (code === "auth/account-exists-with-different-credential") {
    return "An account already exists with this email using a different sign-in method. Try email and password, or link accounts in Firebase.";
  }
  if (code === "auth/popup-blocked") {
    return "The sign-in popup was blocked. Allow popups for this site and try again.";
  }
  return "Google sign-in failed. Please try again or use email and password.";
}
