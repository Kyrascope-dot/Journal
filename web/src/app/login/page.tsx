"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  AuthErrorCodes,
} from "firebase/auth";
import { AppShell } from "@/components/layout/AppShell";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  messageForGoogleAuthError,
  signInWithGoogleAccount,
  waitForSignedInUser,
} from "@/lib/google-auth";

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
    default:
      return "Sign-in failed. Please check your details and try again.";
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  useEffect(() => {
    if (authLoading || !user) return;
    router.replace("/dashboard");
  }, [authLoading, user, router]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseReady) return;
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      await waitForSignedInUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (!firebaseReady) return;
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithGoogleAccount();
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const msg = messageForGoogleAuthError(code);
      if (msg) setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  }

  const busy = loading || googleLoading;

  return (
    <AppShell>
      <div className={`${contentShell} py-16`}>
        <div className="mx-auto w-full max-w-md">
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
          label={googleLoading ? "Connecting…" : "Continue with Google"}
          disabled={!firebaseReady || busy}
          onClick={handleGoogleLogin}
        />

        <AuthDivider />

        <form className="space-y-4" onSubmit={handleEmailLogin} noValidate>
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
            disabled={!firebaseReady || busy}
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
      </div>
    </AppShell>
  );
}
