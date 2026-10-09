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
  MANUSCRIPT_PAYMENT_PLANS,
  getManuscriptPaymentCheckoutBreakdown,
  type ManuscriptPaymentPlanId,
} from "@/lib/payments/manuscript-plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type PaymentMethod = "razorpay" | "paypal";

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
  const [planId, setPlanId] = useState<ManuscriptPaymentPlanId>("manuscript_national_normal_inr");
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
      setHistory(payments.filter((p) => p.planId.startsWith("manuscript")));
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

    const normalizedManuscriptId = manuscriptId.trim();
    if (!normalizedManuscriptId) {
      setError("Please enter your Manuscript ID.");
      return;
    }

    if (paymentMethod === "razorpay") {
      const selectedPlan = MANUSCRIPT_PAYMENT_PLANS[planId];
      if (selectedPlan.currency === "USD") {
        const contactError = validateInternationalCheckoutContact(contactPhone);
        if (contactError) {
          setError(contactError);
          return;
        }
      }
    }

    setBusy(true);
    try {
      if (paymentMethod === "paypal") {
        const order = await requestCreatePayPalOrder({
          planId: planId as any,
          registrationId: normalizedManuscriptId,
          returnPath: "/for-authors/publication-fees",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const order = await requestCreatePaymentOrder({
        planId: planId as any,
        registrationId: normalizedManuscriptId,
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
          manuscriptId: normalizedManuscriptId,
          paymentPurpose: "manuscript_publication",
        },
        onSuccess: async (verified) => {
          setMessage(
            verified.alreadyPaid
              ? `Payment already recorded. Payment ID: ${verified.razorpay_payment_id}`
              : `Payment successful! Payment ID: ${verified.razorpay_payment_id}. Keep this reference for your records. Please share this payment confirmation with the editorial office along with your Manuscript ID.`,
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

  const selectedPlan = MANUSCRIPT_PAYMENT_PLANS[planId];
  const checkout = getManuscriptPaymentCheckoutBreakdown(planId)!;
  const isInternational = selectedPlan.currency === "USD";

  const nationalPlans = (Object.entries(MANUSCRIPT_PAYMENT_PLANS) as Array<
    [ManuscriptPaymentPlanId, (typeof MANUSCRIPT_PAYMENT_PLANS)[ManuscriptPaymentPlanId]]
  >).filter((entry) => entry[1].category === "For Indian Authors – National Publication");

  const internationalPlans = (Object.entries(MANUSCRIPT_PAYMENT_PLANS) as Array<
    [ManuscriptPaymentPlanId, (typeof MANUSCRIPT_PAYMENT_PLANS)[ManuscriptPaymentPlanId]]
  >).filter((entry) => entry[1].category === "For International Authors");

  if (!user) {
    return null;
  }

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Manuscript Publication Payment
        </h2>
        <p className="mt-2 text-sm text-[var(--journal-body)]">
          Select your publication fee category and proceed with payment via Razorpay or PayPal.
          Payment is required only after your manuscript has received full acceptance.
        </p>

        <fieldset className="mt-6 space-y-4">
          <div>
            <legend className="text-sm font-semibold text-[var(--journal-heading)]">
              For Indian Authors – National Publication
            </legend>
            <div className="mt-3 space-y-2">
              {nationalPlans.map(([id, plan]) => {
                const planCheckout = getManuscriptPaymentCheckoutBreakdown(id)!;
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
                        {plan.label}: {planCheckout.displaySummary}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                        {plan.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[var(--journal-border)] pt-4">
            <legend className="text-sm font-semibold text-[var(--journal-heading)]">
              For International Authors
            </legend>
            <div className="mt-3 space-y-2">
              {internationalPlans.map(([id, plan]) => {
                const planCheckout = getManuscriptPaymentCheckoutBreakdown(id)!;
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
                        {plan.label}: {planCheckout.displaySummary}
                      </span>
                      <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                        {plan.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </fieldset>

        <fieldset className="mt-6">
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
              <span>
                <span className="font-medium text-[var(--journal-heading)]">Razorpay</span>
              </span>
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
              <span>
                <span className="font-medium text-[var(--journal-heading)]">PayPal</span>
              </span>
            </label>
          </div>
          {paymentMethod === "paypal" ? (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              PayPal charges in <strong>USD</strong>. If you see &quot;This seller doesn&apos;t accept
              payments in your currency&quot;, use <strong>Razorpay</strong> instead, or contact
              the editorial office.
            </p>
          ) : null}
          <p className="mt-3 rounded border border-[var(--journal-border)] bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-[var(--journal-body)]">
            Razorpay may apply an additional payment processing/convenience fee where applicable.
            Any such charge is separate from the APC. The final amount will be displayed by
            Razorpay during checkout before payment is completed.
          </p>
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

        {isInternational && paymentMethod === "razorpay" ? (
          <label className="mt-6 block text-sm">
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
              Required for international USD card payments through Razorpay. Use a real number
              with country code.
            </span>
          </label>
        ) : null}

        <div className="mt-6 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">Payable now</p>
          {checkout.gstRate ? (
            <dl className="mt-2 space-y-1 text-[var(--journal-body)]">
              <div className="flex justify-between gap-4">
                <dt>Publication Fee</dt>
                <dd className="font-medium">{checkout.displayBaseAmount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>GST (18%)</dt>
                <dd className="font-medium">{checkout.displayGstAmount}</dd>
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
          <p className="mt-2 text-xs text-[var(--journal-muted)]">
            Charged in {selectedPlan.currency} via {paymentMethod === "paypal" ? "PayPal" : "Razorpay"}
            · Signed in as {user.email}
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-6 rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
        >
          {busy
            ? "Processing..."
            : paymentMethod === "paypal"
              ? `Continue to PayPal for ${checkout.displayTotalAmount}`
              : `Pay ${checkout.displayTotalAmount} securely`}
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
            Your recent manuscript publication payments
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
                  {payment.gateway === "paypal" ? "PayPal" : "Razorpay"} order:{" "}
                  {payment.gateway === "paypal"
                    ? payment.paypalOrderId
                    : payment.razorpayOrderId}
                  {payment.gateway === "paypal" && payment.paypalCaptureId
                    ? ` · Payment: ${payment.paypalCaptureId}`
                    : ""}
                  {payment.gateway !== "paypal" && payment.razorpayPaymentId
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
