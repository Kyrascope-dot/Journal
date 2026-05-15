"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { AppShell } from "@/components/layout/AppShell";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { isFirebaseConfigured, getFirebaseAuth } from "@/lib/firebase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firebaseReady = isFirebaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firebaseReady) return;
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/user-not-found" || code === "auth/invalid-email") {
        // Don't reveal whether the email exists — always show the sent message
        setSent(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className={`${contentShell} py-16`}>
        <div className="mx-auto w-full max-w-md">
        <h1 className="font-serif text-2xl font-semibold text-[var(--journal-heading)]">
          Reset your password
        </h1>

        {sent ? (
          <div className="mt-6">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              If an account exists for that email, you will receive a password-reset link
              shortly. Check your inbox (and spam folder).
            </div>
            <p className="mt-6 text-center text-sm text-[var(--journal-muted)]">
              <Link href="/login" className="font-medium text-[var(--journal-accent)] hover:underline">
                Back to sign in
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-[var(--journal-muted)]">
              Enter the email address associated with your{" "}
              <strong>{siteConfig.shortName}</strong> account and we will send you a
              link to reset your password.
            </p>

            {!firebaseReady && (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Firebase is not configured. Add your{" "}
                <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_FIREBASE_*</code>{" "}
                environment variables to enable this.
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--journal-heading)]"
                  htmlFor="reset-email"
                >
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={!firebaseReady || loading}
                className="w-full rounded bg-[var(--journal-accent)] py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--journal-muted)]">
              Remembered it?{" "}
              <Link href="/login" className="font-medium text-[var(--journal-accent)] hover:underline">
                Back to sign in
              </Link>
            </p>
          </>
        )}
      </div>
      </div>
    </AppShell>
  );
}
