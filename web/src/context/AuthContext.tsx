"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

type AuthState = {
  user: User | null;
  /** true while the initial auth state is being determined */
  loading: boolean;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    // Sync immediately so navigation after signInWithPopup sees the session
    setUser(auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signOutUser = async () => {
    if (!isFirebaseConfigured()) return;
    await signOut(getFirebaseAuth());
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}

/** True when Firebase has a session but React context has not caught up yet. */
export function useAuthSessionPending(): boolean {
  const { user, loading } = useAuth();
  if (loading || user) return false;
  if (!isFirebaseConfigured()) return false;
  return getFirebaseAuth().currentUser != null;
}
