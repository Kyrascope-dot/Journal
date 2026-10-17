"use client";

import { useCallback, useEffect, useState } from "react";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import {
  ApcBillingForm,
  ApcPaymentSummary,
  emptyApcBillingForm,
  type ApcBillingFormState,
} from "@/components/payments/ApcBillingForm";
import { useAuth } from "@/context/AuthContext";
import {
  requestCapturePayPalOrder,
  requestCreatePaymentOrder,
  requestCreatePayPalOrder,
  requestMyPayments,
  type PaymentHistoryItem,
} from "@/lib/client/payments";
import { APC_FORM_TITLE } from "@/lib/payments/apc-billing";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import {
  getPaymentCheckoutBreakdown,
  getPaymentPlan,
  isManuscriptPlan,
  MANUSCRIPT_PLAN_DETAILS,
  MANUSCRIPT_PLAN_IDS,
  type ManuscriptPaymentPlanId,
} from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";
import { siteConfig } from "@/lib/site-config";

type PaymentMethod = "razorpay" | "paypal";

/** 1. choose the publication route → 2. APC billing form → 3. pay. */
type Step = "route" | "form" | "payment";

const STEPS: { key: Step; label: string }[] = [
  { key: "route", label: "Author category" },
  { key: "form", label: "APC form" },
  { key: "payment", label: "Payment" },
];

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
  const [step, setStep] = useState<Step>("route");
  const [selectedPlanId, setSelectedPlanId] = useState<ManuscriptPaymentPlanId | "">("");
  const [billingForm, setBillingForm] = useState<ApcBillingFormState | null>(null);
  const [billingFormId, setBillingFormId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [contactPhone, setContactPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [paid, setPaid] = useState(false);
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
            : `PayPal payment successful. Payment ID: ${captured.paypalCaptureId}. Your billing details have been sent to the Editorial Office for invoicing.`,
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

  const selectedPlan = selectedPlanId ? getPaymentPlan(selectedPlanId) : null;
  const checkout = selectedPlan ? getPaymentCheckoutBreakdown(selectedPlan.id) : null;
  // A route can only be paid for when an approved price is configured for it.
  const hasApprovedPrice = Boolean(selectedPlan && checkout && checkout.totalAmountMinor > 0);
  // PayPal can only charge USD; INR (Indian) categories are paid via Razorpay.
  const payPalAvailable = selectedPlan?.currency === "USD";

  function selectPlan(planId: ManuscriptPaymentPlanId) {
    setSelectedPlanId(planId);
    // A submitted form is tied to its route; changing route needs a new submission.
    setBillingFormId(null);
    setPaid(false);
    setError("");
    setMessage("");
    if (getPaymentPlan(planId)?.currency !== "USD") {
      setPaymentMethod("razorpay");
    }
  }

  function continueToForm() {
    setError("");
    setMessage("");
    if (!selectedPlanId) {
      setError("Please select your author category to continue.");
      return;
    }
    if (!hasApprovedPrice) {
      setError(
        `No approved APC is configured for the selected author category, so payment cannot proceed. Please contact the Editorial Office at ${siteConfig.email}.`,
      );
      return;
    }
    if (!billingForm && user) {
      setBillingForm(
        emptyApcBillingForm({ name: user.displayName ?? "", email: user.email ?? "" }),
      );
    }
    setStep("form");
  }

  async function handlePay() {
    setError("");
    setMessage("");

    if (!user) {
      setError("Please sign in before paying.");
      return;
    }
    if (!selectedPlanId || !selectedPlan || !hasApprovedPrice) {
      setError("Please select your author category.");
      setStep("route");
      return;
    }
    if (!billingFormId) {
      setError(`Please complete the ${APC_FORM_TITLE} before proceeding with payment.`);
      setStep("form");
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
          billingFormId,
          returnPath: "/for-authors/publication-fees",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const order = await requestCreatePaymentOrder({
        planId: selectedPlanId,
        billingFormId,
      });

      await openRazorpayCheckout({
        order,
        prefill: {
          email: order.prefill.email || user.email || "",
          name: billingForm?.correspondingAuthorName || user.displayName || "",
          contact: contactPhone.trim(),
        },
        notes: {
          planId: selectedPlanId,
          manuscriptId: billingForm?.manuscriptId.trim() ?? "",
          billingFormId,
          purpose: "manuscript_publication",
        },
        onSuccess: async (result) => {
          setMessage(
            result.alreadyPaid
              ? `Payment already recorded. Razorpay payment ID: ${result.razorpay_payment_id}`
              : `Payment successful. Razorpay payment ID: ${result.razorpay_payment_id}. Your billing details have been sent to the Editorial Office for invoicing.`,
          );
          setPaid(true);
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

  if (!user) {
    return null;
  }

  const stepIndex = STEPS.findIndex((item) => item.key === step);

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <ol className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {STEPS.map((item, index) => (
            <li
              key={item.key}
              aria-current={index === stepIndex ? "step" : undefined}
              className={
                index === stepIndex
                  ? "font-semibold text-[var(--journal-accent)]"
                  : index < stepIndex
                    ? "text-[var(--journal-heading)]"
                    : "text-[var(--journal-muted)]"
              }
            >
              {index + 1}. {item.label}
              {index < stepIndex ? " ✓" : ""}
            </li>
          ))}
        </ol>

        {message ? (
          <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}

        {step === "route" ? (
          <div className="mt-5">
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              Manuscript Publication Payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--journal-body)]">
              Select your author category. You will then complete the {APC_FORM_TITLE} before
              paying by Razorpay or PayPal.
            </p>

            <fieldset className="mt-5 space-y-2">
              <legend className="text-sm font-semibold text-[var(--journal-heading)]">
                Select your author category <span className="text-red-500">*</span>
              </legend>
              {MANUSCRIPT_PLAN_IDS.map((planId) => {
                const plan = getPaymentPlan(planId);
                const breakdown = plan ? getPaymentCheckoutBreakdown(planId) : null;
                const priced = Boolean(plan && breakdown && breakdown.totalAmountMinor > 0);

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
                        {MANUSCRIPT_PLAN_DETAILS[planId].optionLabel}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                        {priced && breakdown
                          ? breakdown.displaySummary
                          : "No approved APC is configured for this category. Please contact the Editorial Office."}
                      </span>
                    </span>
                  </label>
                );
              })}
            </fieldset>

            <button
              type="button"
              onClick={continueToForm}
              className="mt-5 rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
            >
              Continue to APC form
            </button>
          </div>
        ) : null}

        {step === "form" && selectedPlanId && checkout && billingForm ? (
          <div className="mt-5">
            <ApcBillingForm
              planId={selectedPlanId}
              checkout={checkout}
              value={billingForm}
              onChange={setBillingForm}
              onBack={() => {
                setError("");
                setStep("route");
              }}
              onSubmitted={(id) => {
                setBillingFormId(id);
                setPaid(false);
                setError("");
                setMessage("");
                setStep("payment");
              }}
            />
          </div>
        ) : null}

        {step === "payment" && selectedPlanId && selectedPlan && checkout ? (
          <div className="mt-5">
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              Make Payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--journal-body)]">
              Your {APC_FORM_TITLE} has been submitted. Please review the amount and pay by
              Razorpay or PayPal.
            </p>

            <div className="mt-4">
              <ApcPaymentSummary planId={selectedPlanId} checkout={checkout} />
            </div>

            {billingForm ? (
              <p className="mt-3 text-sm text-[var(--journal-body)]">
                Invoice to:{" "}
                <span className="font-medium text-[var(--journal-heading)]">
                  {billingForm.invoiceRecipientName}
                </span>{" "}
                · {billingForm.billingEmail}{" "}
                <button
                  type="button"
                  disabled={busy || paid}
                  onClick={() => {
                    setError("");
                    setStep("form");
                  }}
                  className="font-medium text-[var(--journal-accent)] underline disabled:opacity-50"
                >
                  Edit billing details
                </button>
              </p>
            ) : null}

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

            <button
              type="button"
              disabled={busy || paid}
              onClick={() => void handlePay()}
              className="mt-5 w-full rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {paid
                ? "Payment completed"
                : busy
                  ? "Processing..."
                  : paymentMethod === "paypal"
                    ? `Continue to PayPal for ${checkout.displayTotalAmount}`
                    : `Pay ${checkout.displayTotalAmount} securely`}
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
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
                  {isManuscriptPlan(payment.planId)
                    ? MANUSCRIPT_PLAN_DETAILS[payment.planId].optionLabel
                    : payment.planId}
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
