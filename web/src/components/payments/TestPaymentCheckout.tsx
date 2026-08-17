"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import { useAuth } from "@/context/AuthContext";
import {
  requestCreatePaymentOrder,
  requestMyPayments,
  type PaymentHistoryItem,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import { GATEWAY_TEST_PAYMENT_PLAN } from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

export function TestPaymentCheckout() {
  return (
    <RequireSignIn
      nextPath="/payments/test"
      message="You must sign in before running a payment gateway test."
    >
      <TestPaymentCheckoutSignedIn />
    </RequireSignIn>
  );
}

function TestPaymentCheckoutSignedIn() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [contactPhone, setContactPhone] = useState("");
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

    const contactError = validateInternationalCheckoutContact(contactPhone);
    if (contactError) {
      setError(contactError);
      return;
    }

    setBusy(true);
    try {
      const order = await requestCreatePaymentOrder({
        planId: GATEWAY_TEST_PAYMENT_PLAN.id,
      });

      await openRazorpayCheckout({
        order,
        prefill: {
          email: order.prefill.email || user.email || "",
          name: user.displayName || "",
          contact: contactPhone.trim(),
        },
        notes: {
          planId: order.planId,
          purpose: "gateway_test",
        },
        onSuccess: async (verified) => {
          setMessage(
            verified.alreadyPaid
              ? `Test payment already recorded. Payment ID: ${verified.razorpay_payment_id}`
              : `Test payment successful. Payment ID: ${verified.razorpay_payment_id}`
          );
          await reloadHistory();
          setBusy(false);
        },
        onDismiss: () => {
          setBusy(false);
          setMessage("Payment window closed. No charge was completed.");
        },
        onFailure: (failureMessage) => {
          setError(failureMessage);
          setBusy(false);
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? formatCheckoutPaymentError(err.message)
          : "Could not start payment."
      );
      setBusy(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Pay {GATEWAY_TEST_PAYMENT_PLAN.displayAmount}
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          {GATEWAY_TEST_PAYMENT_PLAN.description}
        </p>

        <label className="mt-5 block text-sm">
          <span className="font-medium text-[var(--journal-heading)]">
            Mobile number <span className="text-red-500">*</span>
          </span>
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="e.g. +1 555 123 4567 or +91 98765 43210"
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
            autoComplete="tel"
          />
          <span className="mt-1 block text-xs text-[var(--journal-muted)]">
            Required for international USD card payments. Use a real number with country code.
          </span>
        </label>

        <div className="mt-5 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Payable now</p>
          <p className="mt-1 text-lg font-semibold text-[var(--journal-accent)]">
            {GATEWAY_TEST_PAYMENT_PLAN.displayAmount}
          </p>
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Charged in USD via Razorpay · Signed in as {user.email}
          </p>
        </div>

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
