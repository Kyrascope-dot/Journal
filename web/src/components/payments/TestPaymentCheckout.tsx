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
import { GATEWAY_TEST_PAYMENT_PLAN } from "@/lib/payments/plans";

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

export function TestPaymentCheckout() {
  const { user, loading } = useAuth();
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
      setHistory(
        payments.filter((payment) => payment.planId === GATEWAY_TEST_PAYMENT_PLAN.id)
      );
    } catch {
      // Optional UX.
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
        planId: GATEWAY_TEST_PAYMENT_PLAN.id,
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
          purpose: "gateway_test",
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
                  ? `Test payment already recorded. Payment ID: ${response.razorpay_payment_id}`
                  : `Test payment successful. Payment ID: ${response.razorpay_payment_id}`
              );
              await reloadHistory();
            } catch (verifyError) {
              setError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment was taken but verification failed. Contact support with your Razorpay payment ID."
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

  if (loading) {
    return <p className="mt-8 text-sm text-[var(--journal-muted)]">Loading…</p>;
  }

  if (!user) {
    return (
      <div className="mt-10 rounded-lg border border-[var(--journal-border)] bg-sky-50/60 p-5">
        <p className="text-sm font-medium text-[var(--journal-heading)]">Sign in required</p>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          Sign in to run a {GATEWAY_TEST_PAYMENT_PLAN.displayAmount} Razorpay test payment.
        </p>
        <Link
          href="/login?next=/payments/test"
          className="mt-4 inline-flex rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Sign in to test payment
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-5">
        <p className="text-sm font-semibold text-amber-950">Test mode only</p>
        <p className="mt-2 text-sm text-amber-950">
          This page charges <strong>{GATEWAY_TEST_PAYMENT_PLAN.displayAmount}</strong> through your
          configured Razorpay keys. Use Razorpay <strong>test mode</strong> keys (
          <code className="rounded bg-white/80 px-1">rzp_test_…</code>) and official test cards
          (e.g. <code className="rounded bg-white/80 px-1">4111 1111 1111 1111</code>) while
          testing. Disable this page in production by removing{" "}
          <code className="rounded bg-white/80 px-1">ENABLE_PAYMENT_TEST_PAGE</code>.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Pay {GATEWAY_TEST_PAYMENT_PLAN.displayAmount}
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          {GATEWAY_TEST_PAYMENT_PLAN.description}
        </p>
        <p className="mt-4 text-xs text-[var(--journal-muted)]">Signed in as {user.email}</p>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-5 rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy ? "Processing…" : `Pay ${GATEWAY_TEST_PAYMENT_PLAN.displayAmount} (test)`}
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
            Your test payments
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
                  {payment.razorpayPaymentId ? ` · Payment: ${payment.razorpayPaymentId}` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
