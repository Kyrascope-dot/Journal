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
import {
  CONFERENCE_PAYMENT_PLANS,
  type PaymentPlanId,
} from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type ConferencePaymentPlanId = Exclude<PaymentPlanId, "gateway_test_usd">;

export function ConferencePaymentCheckout() {
  return (
    <RequireSignIn
      nextPath="/conferences/payment"
      message="You must sign in to your GCR account before conference payment can begin."
    >
      <ConferencePaymentCheckoutSignedIn />
    </RequireSignIn>
  );
}

function ConferencePaymentCheckoutSignedIn() {
  const { user } = useAuth();
  const [planId, setPlanId] = useState<ConferencePaymentPlanId>("national_usd");
  const [registrationId, setRegistrationId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
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
        planId,
        registrationId: registrationId.trim() || undefined,
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
          registrationId: registrationId.trim(),
        },
        onSuccess: async (verified) => {
          setMessage(
            verified.alreadyPaid
              ? `Payment already recorded. Payment ID: ${verified.razorpay_payment_id}`
              : `Payment successful. Payment ID: ${verified.razorpay_payment_id}. Keep this reference for your records.`
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

  const selectedPlan = CONFERENCE_PAYMENT_PLANS[planId];

  if (!user) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Secure checkout
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          All fees are charged in USD through Razorpay. International Visa/Mastercard payments
          require a valid mobile number and Razorpay International Payments on your account.
        </p>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Select fee category
          </legend>
          {(Object.keys(CONFERENCE_PAYMENT_PLANS) as ConferencePaymentPlanId[]).map((id) => {
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
                  </span>
                  <span className="mt-1 block text-xs text-[var(--journal-accent)]">
                    {plan.checkoutHint}
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
            Required for international USD card payments. Use a real number with country code —
            dummy values can cause Razorpay to reject the transaction.
          </span>
        </label>

        <div className="mt-5 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Payable now</p>
          <p className="mt-1 text-lg font-semibold text-[var(--journal-accent)]">
            {selectedPlan.displayAmount}
          </p>
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Charged in {selectedPlan.currency} via Razorpay · Signed in as {user.email}
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
                  {payment.razorpayPaymentId ? ` · Payment: ${payment.razorpayPaymentId}` : ""}
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
