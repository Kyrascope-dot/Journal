"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { EditorDashboard } from "@/components/dashboard/EditorDashboard";
import { ScholarDashboard } from "@/components/dashboard/ScholarDashboard";
import { contentShell } from "@/lib/content-layout";

const ROLE_TITLES = {
  scholar: "Scholar Dashboard",
  editor: "Editor Dashboard",
  admin: "Admin Dashboard",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, refetch } = useUserProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, user, router]);

  const loading = authLoading || profileLoading;

  return (
    <AppShell>
      <div className={`${contentShell} py-10`}>
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-zinc-100" />
              ))}
            </div>
          </div>
        ) : !profile ? (
          <div className="text-center py-16">
            <p className="text-[var(--journal-muted)]">
              Please{" "}
              <a href="/login" className="text-[var(--journal-accent)] hover:underline">
                sign in
              </a>{" "}
              to access your dashboard.
            </p>
          </div>
        ) : (
          <>
            {/* Dashboard header */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
                  {ROLE_TITLES[profile.role]}
                </h1>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                    profile.role === "admin"
                      ? "bg-purple-50 text-purple-700"
                      : profile.role === "editor"
                      ? "bg-blue-50 text-blue-700"
                      : "bg-zinc-100 text-zinc-700"
                  }`}
                >
                  {profile.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--journal-muted)]">
                {profile.displayName || profile.email}
                {profile.affiliation ? ` · ${profile.affiliation}` : ""}
              </p>
            </div>

            {/* Role-specific dashboard */}
            {profile.role === "scholar" && (
              <ScholarDashboard profile={profile} onProfileUpdated={refetch} />
            )}
            {profile.role === "editor" && (
              <EditorDashboard profile={profile} />
            )}
            {profile.role === "admin" && (
              <AdminDashboard profile={profile} />
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
