"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  requestCreatePaymentOrder,
  requestMyPayments,
  requestVerifyPayment,
  type PaymentHistoryItem,
} from "@/lib/client/payments";
import {
  CONFERENCE_PAYMENT_PLANS,
  type PaymentPlanId,
} from "@/lib/payments/plans";

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      if (window.Razorpay) resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function ConferencePaymentCheckout() {
  const { user, loading } = useAuth();
  const [planId, setPlanId] = useState<PaymentPlanId>("international_usd");
  const [registrationId, setRegistrationId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);

  const reloadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    try {
      const payments = await requestMyPayments();
      setHistory(payments);
    } catch {
      // History is optional UX; checkout can still proceed.
    }
  }, [user]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  async function handlePay() {
    setError("");
    setMessage("");
    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    setBusy(true);
    try {
      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        throw new Error("Could not load Razorpay Checkout. Please try again.");
      }

      const order = await requestCreatePaymentOrder({
        planId,
        registrationId: registrationId.trim() || undefined,
      });

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: order.name,
        description: order.description,
        order_id: order.orderId,
        prefill: {
          email: order.prefill.email || user.email || "",
          name: user.displayName || "",
        },
        notes: {
          planId: order.planId,
          registrationId: registrationId.trim(),
        },
        theme: { color: "#0f4c81" },
        handler: (response) => {
          void (async () => {
            try {
              const verified = await requestVerifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              setMessage(
                verified.alreadyPaid
                  ? `Payment already recorded. Payment ID: ${response.razorpay_payment_id}`
                  : `Payment successful. Payment ID: ${response.razorpay_payment_id}. Keep this reference for your records.`
              );
              await reloadHistory();
            } catch (verifyError) {
              setError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment was taken but verification failed. Contact the editorial office with your Razorpay payment ID."
              );
            } finally {
              setBusy(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setMessage("Payment window closed. No charge was completed.");
          },
        },
      });

      rzp.on("payment.failed", (response: unknown) => {
        const details = response as {
          error?: { description?: string; reason?: string };
        };
        setError(
          details.error?.description ||
            details.error?.reason ||
            "Payment failed. Please try again."
        );
        setBusy(false);
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
      setBusy(false);
    }
  }

  const selectedPlan = CONFERENCE_PAYMENT_PLANS[planId];

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--journal-muted)]">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-lg border border-[var(--journal-border)] bg-sky-50/60 p-5">
        <p className="text-sm font-medium text-[var(--journal-heading)]">
          Sign in required for secure checkout
        </p>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          International conference registration is USD 200 and is processed securely through
          Razorpay. Please sign in to continue.
        </p>
        <Link
          href="/login?next=/conferences/payment"
          className="mt-4 inline-flex rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Sign in to pay
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Secure checkout
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          Pay with Razorpay. Amounts are fixed on the server and cannot be altered in the browser.
        </p>
        <p className="mt-3 rounded border border-amber-200 bg-amber-50/80 px-3 py-2 text-xs leading-relaxed text-amber-950">
          <strong>USD / international cards:</strong> Razorpay must have{" "}
          <strong>International payments</strong> activated on your account. If you see
          &quot;Currency is not supported&quot;, open Razorpay Dashboard → Account &amp; Settings →
          International payments → Activate International Cards, then wait for approval. Until then,
          only INR checkout will work.
        </p>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Select fee category
          </legend>
          {(Object.keys(CONFERENCE_PAYMENT_PLANS) as PaymentPlanId[]).map((id) => {
            const plan = CONFERENCE_PAYMENT_PLANS[id];
            return (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-3 text-sm ${
                  planId === id
                    ? "border-[var(--journal-accent)] bg-sky-50"
                    : "border-[var(--journal-border)] bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="plan"
                  value={id}
                  checked={planId === id}
                  onChange={() => setPlanId(id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium text-[var(--journal-heading)]">
                    {plan.label}: {plan.displayAmount}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                    {plan.description}
                    {id === "international_usd" ? " · International payments enabled" : ""}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <label className="mt-5 block text-sm">
          <span className="font-medium text-[var(--journal-heading)]">
            Registration ID (optional)
          </span>
          <input
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
            placeholder="e.g. GCRC-2026-000123"
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-[var(--journal-muted)]">
            Add your conference Registration ID if you already have one.
          </span>
        </label>

        <div className="mt-5 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Payable now</p>
          <p className="mt-1 text-lg font-semibold text-[var(--journal-accent)]">
            {selectedPlan.displayAmount}
          </p>
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Signed in as {user.email}
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-5 rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy ? "Processing…" : `Pay ${selectedPlan.displayAmount} securely`}
        </button>

        {message ? (
          <p className="mt-4 text-sm text-emerald-700" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {history.length > 0 ? (
        <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
            Your recent payments
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((payment) => (
              <li
                key={payment.id}
                className="rounded border border-[var(--journal-border)] px-3 py-2"
              >
                <p className="font-medium text-[var(--journal-heading)]">
                  {payment.displayAmount} · {payment.status}
                </p>
                <p className="text-xs text-[var(--journal-muted)]">
                  Order: {payment.razorpayOrderId}
                  {payment.razorpayPaymentId
                    ? ` · Payment: ${payment.razorpayPaymentId}`
                    : ""}
                  {payment.paidAt
                    ? ` · ${new Date(payment.paidAt).toLocaleString("en-GB")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
