"use client";

import { useEffect, useState } from "react";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import { useAuth } from "@/context/AuthContext";
import {
  requestCreatePaymentOrder,
  requestCreatePayPalOrder,
  requestMyPayments,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import {
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  type PaymentPlanId,
} from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type PaymentMethod = "razorpay" | "paypal";

const manuscriptPlanOrder: PaymentPlanId[] = [
  "manuscript_national_normal_inr",
  "manuscript_national_fasttrack_inr",
  "manuscript_international_standard_usd",
  "manuscript_international_fasttrack_usd",
];

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
  const [selectedPlanId, setSelectedPlanId] =
    useState<PaymentPlanId>("manuscript_national_normal_inr");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [manuscriptId, setManuscriptId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Array<{ id: string; displayAmount: string }>>([]);

  useEffect(() => {
    void (async () => {
      if (!user) return;
      try {
        const payments = await requestMyPayments();
        setHistory(
          payments.filter((p) => p.planId.startsWith("manuscript_"))
        );
      } catch {
        setHistory([]);
      }
    })();
  }, [user]);

  async function handlePay() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    if (!manuscriptId.trim()) {
      setError("Please enter your Manuscript ID.");
      return;
    }

    const selectedPlan = getPaymentPlan(selectedPlanId);
    if (!selectedPlan) {
      setError("Invalid payment option.");
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
          registrationId: manuscriptId.trim(),
          returnPath: "/for-authors/publication-fees",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const order = await requestCreatePaymentOrder({
        planId: selectedPlanId,
        registrationId: manuscriptId.trim(),
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
          manuscriptId: manuscriptId.trim(),
          purpose: "manuscript_publication",
        },
        onSuccess: async () => {
          setMessage(
            "Payment successful. Please keep this reference and share it with the editorial office together with your Manuscript ID."
          );
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

  const selectedPlan = getPaymentPlan(selectedPlanId);
  const checkout = selectedPlan ? getPaymentCheckoutBreakdown(selectedPlanId) : null;

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
            {manuscriptPlanOrder.map((planId) => {
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
                    onChange={() => setSelectedPlanId(planId)}
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
              className={`flex cursor-pointer items-start gap-3 rounded border px-3 py-3 text-sm ${
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
                className="mt-1"
              />
              <span className="font-medium text-[var(--journal-heading)]">PayPal</span>
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
                  {payment.displayAmount} · {payment.status}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
