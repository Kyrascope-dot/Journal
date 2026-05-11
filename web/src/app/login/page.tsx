"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  AuthErrorCodes,
} from "firebase/auth";
import { AppShell } from "@/components/layout/AppShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { siteConfig } from "@/lib/site-config";
import { isFirebaseConfigured, getFirebaseAuth, getGoogleProvider } from "@/lib/firebase";

function friendlyError(code: string): string {
  switch (code) {
    case AuthErrorCodes.INVALID_EMAIL:
      return "That doesn't look like a valid email address.";
    case AuthErrorCodes.USER_DELETED:
    case "auth/user-not-found":
      return "No account found for this email. Please register first.";
    case AuthErrorCodes.INVALID_PASSWORD:
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in window was closed. Please try again.";
    default:
      return "Sign-in failed. Please check your details and try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseReady) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!firebaseReady) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <h1 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-[var(--journal-muted)]">
          Welcome back to <strong>{siteConfig.name}</strong>. Sign in to access
          author tools and submission tracking.
        </p>

        {!firebaseReady && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Firebase is not configured yet. Add your{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_FIREBASE_*</code>{" "}
            environment variables to enable authentication.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}

        <GoogleButton
          label={googleLoading ? "Redirecting…" : "Continue with Google"}
          disabled={!firebaseReady || googleLoading || loading}
          onClick={handleGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60"
        />

        <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex-1 border-t border-zinc-200" />
          <span>or continue with email</span>
          <div className="flex-1 border-t border-zinc-200" />
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleEmailLogin} noValidate>
          <div>
            <label
              className="block text-sm font-medium text-[var(--journal-heading)]"
              htmlFor="login-email"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <label
                className="block text-sm font-medium text-[var(--journal-heading)]"
                htmlFor="login-password"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-[var(--journal-accent)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={!firebaseReady || loading || googleLoading}
            className="w-full rounded bg-[var(--journal-accent)] py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--journal-muted)]">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-[var(--journal-accent)] hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
