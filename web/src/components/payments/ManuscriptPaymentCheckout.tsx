"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import { useAuth } from "@/context/AuthContext";
import {
  requestCapturePayPalOrder,
  requestCreatePaymentOrder,
  requestCreatePayPalOrder,
  requestMyPayments,
  type PaymentHistoryItem,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import {
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  isManuscriptPlan,
  MANUSCRIPT_PLAN_IDS,
  type ManuscriptPaymentPlanId,
} from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type PaymentMethod = "razorpay" | "paypal";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: "Paid",
  created: "Not completed",
  failed: "Failed",
  refunded: "Refunded",
};

export function ManuscriptPaymentCheckout() {
  return (
    <RequireSignIn
      nextPath="/for-authors/publication-fees"
      message="You must sign in to your GCR account to proceed with manuscript publication payment."
    >
      <ManuscriptPaymentCheckoutSignedIn />
    </RequireSignIn>
  );
}

function ManuscriptPaymentCheckoutSignedIn() {
  const { user } = useAuth();
  const [selectedPlanId, setSelectedPlanId] = useState<ManuscriptPaymentPlanId>(
    "manuscript_national_normal_inr",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [manuscriptId, setManuscriptId] = useState("");
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
      setHistory(payments.filter((payment) => isManuscriptPlan(payment.planId)));
    } catch {
      // Optional UX.
    }
  }, [user]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  // PayPal redirects back to this page with ?paypal_return=1&token=<orderId>
  // (or ?paypal_cancelled=1). Capture the order so the payment is completed.
  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const returnedFromPayPal = params.get("paypal_return") === "1";
    const orderId = params.get("token");
    const cancelled = params.get("paypal_cancelled") === "1";

    const clearPayPalParams = () => {
      params.delete("paypal_return");
      params.delete("paypal_cancelled");
      params.delete("token");
      params.delete("PayerID");
      const nextSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
      );
    };

    if (cancelled) {
      setMessage("PayPal payment was cancelled. No charge was completed.");
      clearPayPalParams();
      return;
    }

    if (!returnedFromPayPal || !orderId) return;

    setBusy(true);
    setError("");
    setMessage("Finalizing PayPal payment...");
    void requestCapturePayPalOrder({ orderId })
      .then(async (captured) => {
        setMessage(
          captured.alreadyPaid
            ? `PayPal payment already recorded. Payment ID: ${captured.paypalCaptureId}`
            : `PayPal payment successful. Payment ID: ${captured.paypalCaptureId}. Please share this reference with the editorial office together with your Manuscript ID.`,
        );
        await reloadHistory();
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? formatCheckoutPaymentError(err.message)
            : "Could not finalize PayPal payment.",
        );
        setMessage("");
      })
      .finally(() => {
        clearPayPalParams();
        setBusy(false);
      });
  }, [reloadHistory, user]);

  const selectedPlan = getPaymentPlan(selectedPlanId);
  const checkout = selectedPlan ? getPaymentCheckoutBreakdown(selectedPlanId) : null;
  // PayPal can only charge USD; INR (Indian) categories are paid via Razorpay.
  const payPalAvailable = selectedPlan?.currency === "USD";

  function selectPlan(planId: ManuscriptPaymentPlanId) {
    setSelectedPlanId(planId);
    if (getPaymentPlan(planId)?.currency !== "USD") {
      setPaymentMethod("razorpay");
    }
  }

  async function handlePay() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    const trimmedManuscriptId = manuscriptId.trim();
    if (!trimmedManuscriptId) {
      setError("Please enter your Manuscript ID.");
      return;
    }

    if (!selectedPlan) {
      setError("Invalid payment option.");
      return;
    }

    if (paymentMethod === "paypal" && !payPalAvailable) {
      setError("PayPal supports USD payments only. Please choose Razorpay for INR fee categories.");
      return;
    }

    if (paymentMethod === "razorpay" && selectedPlan.currency === "USD") {
      const contactError = validateInternationalCheckoutContact(contactPhone);
      if (contactError) {
        setError(contactError);
        return;
      }
    }

    setBusy(true);

    try {
      if (paymentMethod === "paypal") {
        const order = await requestCreatePayPalOrder({
          planId: selectedPlanId,
          registrationId: trimmedManuscriptId,
          returnPath: "/for-authors/publication-fees",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const order = await requestCreatePaymentOrder({
        planId: selectedPlanId,
        registrationId: trimmedManuscriptId,
      });

      await openRazorpayCheckout({
        order,
        prefill: {
          email: order.prefill.email || user.email || "",
          name: user.displayName || "",
          contact: contactPhone.trim(),
        },
        notes: {
          planId: selectedPlanId,
          manuscriptId: trimmedManuscriptId,
          purpose: "manuscript_publication",
        },
        onSuccess: async (result) => {
          setMessage(
            result.alreadyPaid
              ? `Payment already recorded. Razorpay payment ID: ${result.razorpay_payment_id}`
              : `Payment successful. Razorpay payment ID: ${result.razorpay_payment_id}. Please share this reference with the editorial office together with your Manuscript ID.`,
          );
          setBusy(false);
          await reloadHistory();
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
          : "Could not start payment.",
      );
      setBusy(false);
    }
  }

  if (!user || !selectedPlan || !checkout) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Manuscript Publication Payment
        </h2>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Select your fee category
          </legend>

          <div className="space-y-2">
            {MANUSCRIPT_PLAN_IDS.map((planId) => {
              const plan = getPaymentPlan(planId);
              const breakdown = plan ? getPaymentCheckoutBreakdown(planId) : null;

              if (!plan || !breakdown) return null;

              return (
                <label
                  key={planId}
                  className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-3 text-sm ${
                    selectedPlanId === planId
                      ? "border-[var(--journal-accent)] bg-sky-50"
                      : "border-[var(--journal-border)] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={planId}
                    checked={selectedPlanId === planId}
                    onChange={() => selectPlan(planId)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium text-[var(--journal-heading)]">
                      {plan.label}: {breakdown.displaySummary}
                    </span>
                    {plan.description ? (
                      <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                        {plan.description}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Payment method
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-3 text-sm ${
                paymentMethod === "razorpay"
                  ? "border-[var(--journal-accent)] bg-sky-50"
                  : "border-[var(--journal-border)] bg-white"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="razorpay"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                className="mt-1"
              />
              <span className="font-medium text-[var(--journal-heading)]">Razorpay</span>
            </label>

            <label
              className={`flex items-start gap-3 rounded border px-3 py-3 text-sm ${
                payPalAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
              } ${
                paymentMethod === "paypal"
                  ? "border-[var(--journal-accent)] bg-sky-50"
                  : "border-[var(--journal-border)] bg-white"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={paymentMethod === "paypal"}
                onChange={() => setPaymentMethod("paypal")}
                disabled={!payPalAvailable}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-[var(--journal-heading)]">PayPal</span>
                {!payPalAvailable ? (
                  <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                    Available for USD (international) categories only.
                  </span>
                ) : null}
              </span>
            </label>
          </div>
        </fieldset>

        <label className="mt-5 block text-sm">
          <span className="font-medium text-[var(--journal-heading)]">
            Manuscript ID <span className="text-red-500">*</span>
          </span>
          <input
            value={manuscriptId}
            onChange={(e) => setManuscriptId(e.target.value)}
            placeholder="e.g. GCRVOL-2026-00123"
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-[var(--journal-muted)]">
            Enter your Manuscript ID as assigned by the editorial office.
          </span>
        </label>

        {selectedPlan.currency === "USD" && paymentMethod === "razorpay" ? (
          <label className="mt-5 block text-sm">
            <span className="font-medium text-[var(--journal-heading)]">
              Mobile number <span className="text-red-500">*</span>
            </span>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
              autoComplete="tel"
            />
            <span className="mt-1 block text-xs text-[var(--journal-muted)]">
              Required for Razorpay international USD checkout.
            </span>
          </label>
        ) : null}

        <div className="mt-5 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Payable now</p>

          {checkout.gstRate ? (
            <dl className="mt-2 space-y-1 text-[var(--journal-body)]">
              <div className="flex justify-between gap-4">
                <dt>Publication fee</dt>
                <dd>{checkout.displayBaseAmount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>GST (18%)</dt>
                <dd>{checkout.displayGstAmount}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--journal-border)] pt-2">
                <dt className="font-medium text-[var(--journal-heading)]">Total</dt>
                <dd className="text-lg font-semibold text-[var(--journal-accent)]">
                  {checkout.displayTotalAmount}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-1 text-lg font-semibold text-[var(--journal-accent)]">
              {checkout.displayTotalAmount}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-5 w-full rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy
            ? "Processing..."
            : paymentMethod === "paypal"
              ? `Continue to PayPal for ${checkout.displayTotalAmount}`
              : `Pay ${checkout.displayTotalAmount} securely`}
        </button>

        {message ? (
          <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      {history.length > 0 ? (
        <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
            Your recent manuscript payments
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {history.map((payment) => (
              <li
                key={payment.id}
                className="rounded border border-[var(--journal-border)] px-3 py-2"
              >
                <p className="font-medium text-[var(--journal-heading)]">
                  {payment.displayAmount} ·{" "}
                  {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                </p>
                <p className="mt-0.5 text-xs text-[var(--journal-muted)]">
                  {getPaymentPlan(payment.planId)?.label ?? payment.planId}
                  {payment.registrationId ? ` · Manuscript ID: ${payment.registrationId}` : ""}
                  {payment.gateway ? ` · ${payment.gateway === "paypal" ? "PayPal" : "Razorpay"}` : ""}
                  {payment.paidAt
                    ? ` · Paid ${new Date(payment.paidAt).toLocaleDateString()}`
                    : payment.createdAt
                      ? ` · Started ${new Date(payment.createdAt).toLocaleDateString()}`
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
