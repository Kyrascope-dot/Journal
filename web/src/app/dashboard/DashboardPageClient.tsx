"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth, useAuthSessionPending } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { AppShell } from "@/components/layout/AppShell";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { EditorDashboard } from "@/components/dashboard/EditorDashboard";
import { ReviewerDashboard } from "@/components/dashboard/ReviewerDashboard";
import { ScholarDashboard } from "@/components/dashboard/ScholarDashboard";
import { contentShell } from "@/lib/content-layout";
import {
  canAccessDashboardView,
  defaultDashboardView,
  type DashboardView,
} from "@/lib/dashboard-access";
import type { UserProfile } from "@/types/dashboard";

const VIEW_TITLES: Record<DashboardView, string> = {
  author: "Author dashboard",
  editor: "Editor dashboard",
  reviewer: "Reviewer dashboard",
  admin: "Admin dashboard",
};

function parseView(
  raw: string | null,
  role: UserProfile["role"],
): DashboardView {
  const fallback = defaultDashboardView(role);
  if (!raw) return fallback;
  const view = raw as DashboardView;
  if (!canAccessDashboardView(role, view)) return fallback;
  return view;
}

export function DashboardPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const sessionPending = useAuthSessionPending();
  const { profile, loading: profileLoading, refetch } = useUserProfile();

  const view = useMemo(
    () =>
      profile ? parseView(searchParams.get("view"), profile.role) : "author",
    [profile, searchParams],
  );

  useEffect(() => {
    if (authLoading || sessionPending) return;
    if (!user) {
      router.replace("/login?next=/dashboard");
    }
  }, [authLoading, sessionPending, user, router]);

  useEffect(() => {
    if (!profile) return;
    const requested = searchParams.get("view");
    if (
      requested &&
      !canAccessDashboardView(profile.role, requested as DashboardView)
    ) {
      router.replace(`/dashboard?view=${defaultDashboardView(profile.role)}`);
    }
  }, [profile, searchParams, router]);

  const loading = authLoading || sessionPending || profileLoading;

  return (
    <AppShell>
      <div className={`${contentShell} py-10`}>
        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
            <div className="h-4 w-64 animate-pulse rounded bg-zinc-100" />
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-zinc-100"
                />
              ))}
            </div>
          </div>
        ) : !user ? (
          <div className="py-16 text-center">
            <p className="text-[var(--journal-muted)]">
              Redirecting to sign in…
            </p>
          </div>
        ) : !profile ? (
          <div className="py-16 text-center">
            <p className="text-[var(--journal-muted)]">
              We could not load your profile. Check your connection and refresh,
              or contact the editorial office if this continues.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 text-sm font-medium text-[var(--journal-accent)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
                  {VIEW_TITLES[view]}
                </h1>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-medium capitalize ${
                    profile.role === "admin"
                      ? "bg-purple-50 text-purple-700"
                      : profile.role === "editor"
                        ? "bg-blue-50 text-blue-700"
                        : profile.role === "reviewer"
                          ? "bg-teal-50 text-teal-700"
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

            {view === "author" && (
              <ScholarDashboard profile={profile} onProfileUpdated={refetch} />
            )}
            {view === "editor" && <EditorDashboard profile={profile} />}
            {view === "reviewer" && <ReviewerDashboard profile={profile} />}
            {view === "admin" && <AdminDashboard profile={profile} />}
          </>
        )}
      </div>
    </AppShell>
  );
}
