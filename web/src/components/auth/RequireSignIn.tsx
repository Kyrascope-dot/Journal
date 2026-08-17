"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth, useAuthSessionPending } from "@/context/AuthContext";

type RequireSignInProps = {
  children: ReactNode;
  /** Path to return to after sign-in (e.g. /conferences/payment). */
  nextPath: string;
  message?: string;
};

export function RequireSignIn({
  children,
  nextPath,
  message = "You must sign in before continuing.",
}: RequireSignInProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const sessionPending = useAuthSessionPending();
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  useEffect(() => {
    if (loading || sessionPending) return;
    if (!user) {
      router.replace(loginHref);
    }
  }, [loading, sessionPending, user, router, loginHref]);

  if (loading || sessionPending) {
    return (
      <p className="mt-8 text-sm text-[var(--journal-muted)]" role="status">
        Checking sign-in…
      </p>
    );
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-lg border border-[var(--journal-border)] bg-sky-50/60 p-5">
        <p className="text-sm font-medium text-[var(--journal-heading)]">Sign in required</p>
        <p className="mt-2 text-sm text-[var(--journal-body)]">{message}</p>
        <p className="mt-3 text-sm text-[var(--journal-muted)]">Redirecting to sign in…</p>
        <Link
          href={loginHref}
          className="mt-4 inline-flex rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Sign in to continue
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
