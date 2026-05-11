"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
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
    case AuthErrorCodes.EMAIL_EXISTS:
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "Password must be at least 6 characters.";
    case "auth/popup-closed-by-user":
      return "Sign-in window was closed. Please try again.";
    default:
      return "Registration failed. Please check your details and try again.";
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseReady) return;
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email,
        password
      );
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
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
          Create account
        </h1>
        <p className="mt-2 text-sm text-[var(--journal-muted)]">
          Register to access author tools, track submissions, and receive updates from{" "}
          <strong>{siteConfig.name}</strong>.
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
          label={googleLoading ? "Redirecting…" : "Sign up with Google"}
          disabled={!firebaseReady || googleLoading || loading}
          onClick={handleGoogle}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 disabled:opacity-60"
        />

        <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex-1 border-t border-zinc-200" />
          <span>or register with email</span>
          <div className="flex-1 border-t border-zinc-200" />
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleRegister} noValidate>
          <div>
            <label
              className="block text-sm font-medium text-[var(--journal-heading)]"
              htmlFor="display-name"
            >
              Full name <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="name"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-[var(--journal-heading)]"
              htmlFor="reg-email"
            >
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="email"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-[var(--journal-heading)]"
              htmlFor="reg-password"
            >
              Password <span className="font-normal text-zinc-400">(min. 6 characters)</span>
            </label>
            <input
              id="reg-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-[var(--journal-heading)]"
              htmlFor="reg-confirm"
            >
              Confirm password
            </label>
            <input
              id="reg-confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
              autoComplete="new-password"
            />
          </div>
          <p className="text-xs text-[var(--journal-muted)]">
            By creating an account you agree to use it responsibly and in line with our{" "}
            <a className="text-[var(--journal-accent)] hover:underline" href="/about/ethics">
              publication ethics
            </a>{" "}
            guidelines.
          </p>
          <button
            type="submit"
            disabled={!firebaseReady || loading || googleLoading}
            className="w-full rounded bg-[var(--journal-accent)] py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--journal-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[var(--journal-accent)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
