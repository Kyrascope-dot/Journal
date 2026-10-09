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
  type CreateOrderResponse,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import { getPaymentCheckoutBreakdown, type PaymentPlanId } from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type ManuscriptPaymentPlanId =
  | "manuscript_national_normal"
  | "manuscript_national_fasttrack"
  | "manuscript_international_standard"
  | "manuscript_international_fasttrack";

type PaymentMethod = "razorpay" | "paypal";

interface ManuscriptPlanConfig {
  label: string;
  description: string;
  baseAmount: number;
  currency: "INR" | "USD";
  displayAmount: string;
  gst: number | null;
}

const MANUSCRIPT_PLANS: Record<ManuscriptPaymentPlanId, ManuscriptPlanConfig> = {
  manuscript_national_normal: {
    label: "Normal Route",
    description: "Standard review process (Within 2 months)",
    baseAmount: 9995,
    currency: "INR",
    displayAmount: "₹9,995",
    gst: 1799.1,
  },
  manuscript_national_fasttrack: {
    label: "Fast-Track Route",
    description: "Expedited review process (Within 1 week)",
    baseAmount: 12288.14,
    currency: "INR",
    displayAmount: "₹12,288.14",
    gst: 2211.86,
  },
  manuscript_international_standard: {
    label: "Regular Publication",
    description: "Standard review process (Within 2 months)",
    baseAmount: 150,
    currency: "USD",
    displayAmount: "USD 150",
    gst: null,
  },
  manuscript_international_fasttrack: {
    label: "Fast-Track Publication",
    description: "Expedited review process (Within 1 week)",
    baseAmount: 200,
    currency: "USD",
    displayAmount: "USD 200",
    gst: null,
  },
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
  const [planId, setPlanId] = useState<ManuscriptPaymentPlanId>("manuscript_national_normal");
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
      setHistory(payments);
    } catch {
      // Optional UX.
    }
  }, [user]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  const getPaymentConfig = (): { amount: number; currency: PaymentPlanId; total: number; gst: number | null } | null => {
    const plan = MANUSCRIPT_PLANS[planId];
    if (!plan) return null;

    const gst = plan.gst || 0;
    const total = plan.baseAmount + gst;
    const amount = Math.round(total * 100); // Convert to minor units (paise/cents)

    return {
      amount,
      currency: "international_usd" as PaymentPlanId,
      total,
      gst: plan.gst,
    };
  };

  async function handlePay() {
    setError("");
    setMessage("");
    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    const normalizedManuscriptId = manuscriptId.trim();
    if (!normalizedManuscriptId) {
      setError("Please enter your Manuscript ID.");
      return;
    }

    const plan = MANUSCRIPT_PLANS[planId];
    if (paymentMethod === "razorpay" && plan.currency === "USD") {
      const contactError = validateInternationalCheckoutContact(contactPhone);
      if (contactError) {
        setError(contactError);
        return;
      }
    }

    setBusy(true);
    try {
      const orderInput = {
        planId: "international_usd" as PaymentPlanId,
        registrationId: normalizedManuscriptId,
      };

      if (paymentMethod === "paypal") {
        const order = await requestCreatePayPalOrder({
          ...orderInput,
          returnPath: "/for-authors/publication-fees",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const order = await requestCreatePaymentOrder(orderInput);

      await openRazorpayCheckout({
        order: order as CreateOrderResponse,
        prefill: {
          email: order.prefill?.email || user.email || "",
          name: user.displayName || "",
          contact: contactPhone.trim(),
        },
        notes: {
          planId: planId,
          manuscriptId: normalizedManuscriptId,
          paymentPurpose: "manuscript_publication",
        },
        onSuccess: async (verified) => {
          setMessage(
            verified.alreadyPaid
              ? `Payment already recorded. Payment ID: ${verified.razorpay_payment_id}`
              : `Payment successful! Payment ID: ${verified.razorpay_payment_id}. Keep this for your records.`,
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
          : "Could not start payment.",
      );
      setBusy(false);
    }
  }

  const plan = MANUSCRIPT_PLANS[planId];
  const config = getPaymentConfig();

  const nationalPlans = (Object.entries(MANUSCRIPT_PLANS) as Array<[ManuscriptPaymentPlanId, ManuscriptPlanConfig]>).filter(
    (entry) => entry[1].currency === "INR",
  );
  const internationalPlans = (Object.entries(MANUSCRIPT_PLANS) as Array<[ManuscriptPaymentPlanId, ManuscriptPlanConfig]>).filter(
    (entry) => entry[1].currency === "USD",
  );

  if (!user || !plan || !config) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Manuscript Publication Payment
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          Select your publication fee category and proceed with secure payment via Razorpay or PayPal.
        </p>

        <fieldset className="mt-6 space-y-4">
          <div>
            <legend className="text-sm font-semibold text-[var(--journal-heading)]">
              For Indian Authors – National Publication
            </legend>
            <div className="mt-3 space-y-2">
              {nationalPlans.map(([id, cfg]) => (
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
                      {cfg.label}: {cfg.displayAmount}
                      {cfg.gst ? ` + ₹${cfg.gst.toFixed(2)} GST` : ""}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                      {cfg.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-[var(--journal-border)] pt-4">
            <legend className="text-sm font-semibold text-[var(--journal-heading)]">
              For International Authors
            </legend>
            <div className="mt-3 space-y-2">
              {internationalPlans.map(([id, cfg]) => (
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
                      {cfg.label}: {cfg.displayAmount}
                    </span>
                    <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                      {cfg.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Payment Method
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

        <label className="mt-6 block text-sm">
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
            Enter your manuscript ID assigned by the editorial office.
          </span>
        </label>

        {plan.currency === "USD" && paymentMethod === "razorpay" ? (
          <label className="mt-6 block text-sm">
            <span className="font-medium text-[var(--journal-heading)]">
              Mobile Number <span className="text-red-500">*</span>
            </span>
            <input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
              autoComplete="tel"
            />
            <span className="mt-1 block text-xs text-[var(--journal-muted)]">
              Required for international payments. Use country code.
            </span>
          </label>
        ) : null}

        <div className="mt-6 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Total Amount Payable</p>
          <dl className="mt-3 space-y-1 text-[var(--journal-body)]">
            <div className="flex justify-between">
              <dt>Fee</dt>
              <dd className="font-medium">{plan.displayAmount}</dd>
            </div>
            {config.gst ? (
              <>
                <div className="flex justify-between">
                  <dt>GST (18%)</dt>
                  <dd className="font-medium">₹{config.gst.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--journal-border)] pt-2">
                  <dt className="font-medium text-[var(--journal-heading)]">Total</dt>
                  <dd className="text-lg font-semibold text-[var(--journal-accent)]">₹{config.total.toFixed(2)}</dd>
                </div>
              </>
            ) : null}
          </dl>
          <p className="mt-2 text-xs text-[var(--journal-muted)]">
            Via {paymentMethod === "paypal" ? "PayPal" : "Razorpay"} • Signed in as {user.email}
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-6 w-full rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy ? "Processing..." : `Pay Now`}
        </button>

        {message && <p className="mt-4 text-sm text-emerald-700 rounded bg-emerald-50 p-3">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-700 rounded bg-red-50 p-3">{error}</p>}
      </div>
    </div>
  );
}
