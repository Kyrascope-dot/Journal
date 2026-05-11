"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getOrCreateUserProfile } from "@/lib/firestore-users";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { UserProfile } from "@/types/dashboard";

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || !isFirebaseConfigured()) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const p = await getOrCreateUserProfile(user);
        if (!cancelled) setProfile(p);
      } catch {
        if (!cancelled) setProfile(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const refetch = async () => {
    if (!user || !isFirebaseConfigured()) return;
    setLoading(true);
    try {
      const p = await getOrCreateUserProfile(user);
      setProfile(p);
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, refetch };
}
