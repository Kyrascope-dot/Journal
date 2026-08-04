"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  AuthErrorCodes,
} from "firebase/auth";
import { AppShell } from "@/components/layout/AppShell";
import { AuthDivider, GoogleButton } from "@/components/auth/GoogleButton";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";
import {
  messageForGoogleAuthError,
  signInWithGoogleAccount,
  waitForSignedInUser,
} from "@/lib/google-auth";

function friendlyError(code: string): string {
  switch (code) {
    case AuthErrorCodes.INVALID_EMAIL:
      return "That doesn't look like a valid email address.";
    case AuthErrorCodes.EMAIL_EXISTS:
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case AuthErrorCodes.WEAK_PASSWORD:
      return "Password must be at least 6 characters.";
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
      await waitForSignedInUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      setError(friendlyError(code));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
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
          label={googleLoading ? "Connecting…" : "Continue with Google"}
          disabled={!firebaseReady || busy}
          onClick={handleGoogleRegister}
        />

        <AuthDivider />

        <form className="space-y-4" onSubmit={handleRegister} noValidate>
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
            disabled={!firebaseReady || busy}
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
      </div>
    </AppShell>
  );
}
