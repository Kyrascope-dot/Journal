"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import { useAuth } from "@/context/AuthContext";
import { getSubmissionsByAuthor } from "@/lib/firestore-submissions";
import {
  requestCapturePayPalOrder,
  requestCreatePaymentOrder,
  requestCreatePayPalOrder,
  requestMyPayments,
  type PaymentHistoryItem,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import { razorpayPaymentNote } from "@/lib/conference-content";
import {
  CONFERENCE_PAYMENT_PLANS,
  getPaymentCheckoutBreakdown,
  isManuscriptPlan,
  type ConferencePaymentPlanId,
} from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";

type PaymentMethod = "razorpay" | "paypal";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [registrationId, setRegistrationId] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [feeWaiverRegistrationIds, setFeeWaiverRegistrationIds] = useState<
    string[]
  >([]);
  const [feeWaiverAccessLoaded, setFeeWaiverAccessLoaded] = useState(false);
  /** Registration IDs of the signed-in author's own conference submissions. */
  const [conferenceRegistrationIds, setConferenceRegistrationIds] = useState<string[]>([]);
  const [requestedPlanId, setRequestedPlanId] =
    useState<ConferencePaymentPlanId | null>(null);

  const reloadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    try {
      const payments = await requestMyPayments();
      // Manuscript APC payments are listed on the publication fees page.
      setHistory(payments.filter((payment) => !isManuscriptPlan(payment.planId)));
    } catch {
      // Optional UX.
    }
  }, [user]);

  useEffect(() => {
    void reloadHistory();
  }, [reloadHistory]);

  useEffect(() => {
    if (!user) {
      setFeeWaiverRegistrationIds([]);
      setConferenceRegistrationIds([]);
      setFeeWaiverAccessLoaded(false);
      return;
    }
    let cancelled = false;
    setFeeWaiverAccessLoaded(false);
    getSubmissionsByAuthor(user.uid)
      .then((submissions) => {
        if (cancelled) return;
        setConferenceRegistrationIds(
          submissions
            .filter((submission) => submission.submissionPurpose === "conference")
            .map((submission) => submission.registrationId),
        );
        setFeeWaiverRegistrationIds(
          submissions
            .filter(
              (submission) =>
                submission.submissionPurpose === "conference" &&
                (submission.conferenceFeeWaiver === "partial" ||
                  submission.conferenceFeeWaiver === "full"),
            )
            .map((submission) => submission.registrationId),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setFeeWaiverRegistrationIds([]);
          setConferenceRegistrationIds([]);
        }
      })
      .finally(() => {
        if (!cancelled) setFeeWaiverAccessLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const linkedRegistrationId = params.get("registrationId");
    if (linkedRegistrationId) {
      setRegistrationId(
        (current) => current || linkedRegistrationId.slice(0, 64),
      );
    }
    const linkedPlanId = params.get("planId");
    if (
      linkedPlanId === "national_usd" ||
      linkedPlanId === "international_usd" ||
      linkedPlanId === "fee_waiver_usd"
    ) {
      setRequestedPlanId(linkedPlanId);
      if (linkedPlanId !== "fee_waiver_usd") {
        setPlanId(linkedPlanId);
      }
    }
    const returnedFromPayPal = params.get("paypal_return") === "1";
    const orderId = params.get("token");
    const cancelled = params.get("paypal_cancelled") === "1";

    if (cancelled) {
      setMessage("PayPal payment was cancelled. No charge was completed.");
      params.delete("paypal_cancelled");
      const nextSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
      );
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
            : `PayPal payment successful. Payment ID: ${captured.paypalCaptureId}. Keep this reference for your records.`,
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
        params.delete("paypal_return");
        params.delete("token");
        params.delete("PayerID");
        const nextSearch = params.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
        );
        setBusy(false);
      });
  }, [reloadHistory, user]);

  useEffect(() => {
    if (!feeWaiverAccessLoaded) return;
    const hasFeeWaiverAccess = feeWaiverRegistrationIds.length > 0;
    if (requestedPlanId === "fee_waiver_usd") {
      if (hasFeeWaiverAccess) {
        setPlanId("fee_waiver_usd");
      } else {
        setPlanId("national_usd");
        setError(
          "The USD 100 fee-waiver payment is available only after the Editorial Office assigns a fee waiver to your conference submission.",
        );
      }
      return;
    }
    if (planId === "fee_waiver_usd" && !hasFeeWaiverAccess) {
      setPlanId("national_usd");
    }
  }, [
    feeWaiverAccessLoaded,
    feeWaiverRegistrationIds.length,
    planId,
    requestedPlanId,
  ]);

  useEffect(() => {
    if (registrationId.trim()) return;
    if (planId === "fee_waiver_usd") {
      if (feeWaiverRegistrationIds.length === 1) {
        setRegistrationId(feeWaiverRegistrationIds[0]!);
      }
    } else if (conferenceRegistrationIds.length === 1) {
      setRegistrationId(conferenceRegistrationIds[0]!);
    }
  }, [conferenceRegistrationIds, feeWaiverRegistrationIds, planId, registrationId]);

  async function handlePay() {
    setError("");
    setMessage("");
    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    if (planId === "fee_waiver_usd") {
      const normalizedRegistrationId = registrationId.trim();
      if (!feeWaiverRegistrationIds.includes(normalizedRegistrationId)) {
        setError(
          "Select or enter the Registration ID that has an approved fee waiver.",
        );
        return;
      }
    }

    if (
      planId !== "fee_waiver_usd" &&
      !conferenceRegistrationIds.includes(registrationId.trim())
    ) {
      setError(
        conferenceRegistrationIds.length > 0
          ? "Please select the Registration ID of your conference submission (it starts with GCRC-)."
          : "Conference payment is only for authors who have submitted a conference abstract. If you are paying the publication fee (APC) for an accepted journal manuscript, please use the Publication fees page.",
      );
      return;
    }

    if (paymentMethod === "razorpay") {
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
          planId,
          registrationId: registrationId.trim() || undefined,
        });
        window.location.href = order.approveUrl;
        return;
      }

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
              : `Payment successful. Payment ID: ${verified.razorpay_payment_id}. Keep this reference for your records.`,
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

  const selectedPlan = CONFERENCE_PAYMENT_PLANS[planId];
  const checkout = getPaymentCheckoutBreakdown(planId)!;
  const hasFeeWaiverAccess = feeWaiverRegistrationIds.length > 0;
  const visiblePlanIds = (
    Object.keys(CONFERENCE_PAYMENT_PLANS) as ConferencePaymentPlanId[]
  ).filter((id) => id !== "fee_waiver_usd" || hasFeeWaiverAccess);

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
          Pay domestic registrations through Razorpay or use PayPal for
          international payments. All conference fees are charged in USD.
        </p>

        <fieldset className="mt-5 space-y-3">
          <legend className="text-sm font-semibold text-[var(--journal-heading)]">
            Select fee category
          </legend>
          {visiblePlanIds.map((id) => {
            const plan = CONFERENCE_PAYMENT_PLANS[id];
            const planCheckout = getPaymentCheckoutBreakdown(id)!;
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
                  {plan.description ? (
                    <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
                      {plan.description}
                    </span>
                  ) : null}
                  {plan.checkoutHint ? (
                    <span className="mt-1 block text-xs text-[var(--journal-accent)]">
                      {plan.checkoutHint}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </fieldset>
        {hasFeeWaiverAccess ? (
          <p className="mt-2 text-xs text-emerald-700">
            Fee-waiver payment is available for:{" "}
            {feeWaiverRegistrationIds.join(", ")}
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
              <span>
                <span className="font-medium text-[var(--journal-heading)]">
                  Razorpay
                </span>
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
                <span className="font-medium text-[var(--journal-heading)]">
                  PayPal
                </span>
              </span>
            </label>
          </div>
          {paymentMethod === "paypal" ? (
            <p className="mt-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
              PayPal charges in <strong>USD</strong>. If you see &quot;This
              seller doesn&apos;t accept payments in your currency&quot;, use{" "}
              <strong>Razorpay</strong> instead, or ask the editorial office to
              enable USD receipt on the PayPal Business account.
            </p>
          ) : null}
          <p className="mt-3 rounded border border-[var(--journal-border)] bg-zinc-50 px-3 py-2 text-xs leading-relaxed text-[var(--journal-body)]">
            {razorpayPaymentNote}
          </p>
        </fieldset>

        <label className="mt-5 block text-sm">
          <span className="font-medium text-[var(--journal-heading)]">
            Conference Registration ID <span className="text-red-500">*</span>
          </span>
          <input
            value={registrationId}
            onChange={(e) => setRegistrationId(e.target.value)}
            placeholder="e.g. GCRC-2026-000123"
            list="conference-registration-ids"
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
          />
          <datalist id="conference-registration-ids">
            {conferenceRegistrationIds.map((id) => (
              <option key={id} value={id} />
            ))}
          </datalist>
          <span className="mt-1 block text-xs text-[var(--journal-muted)]">
            The Registration ID of your conference abstract submission (starts with GCRC-).
            You can find it under My Submissions in your author dashboard.
          </span>
        </label>

        {feeWaiverAccessLoaded && conferenceRegistrationIds.length === 0 ? (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-950">
            <p>
              Your account has no conference submission. Conference payment is only for authors
              who have submitted a conference abstract.
            </p>
            <p className="mt-2">
              Paying the publication fee (APC) for an accepted journal manuscript? Please use the{" "}
              <Link href="/for-authors/publication-fees" className="font-medium underline">
                Publication fees
              </Link>{" "}
              page, where you complete the APC Payment and Billing Details Form before paying.
            </p>
          </div>
        ) : null}

        {paymentMethod === "razorpay" ? (
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
              Required for international USD card payments through Razorpay. Use
              a real number with country code.
            </span>
          </label>
        ) : null}

        <div className="mt-5 rounded border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--journal-heading)]">
            Payable now
          </p>
          {checkout.gstRate ? (
            <dl className="mt-2 space-y-1 text-[var(--journal-body)]">
              <div className="flex justify-between gap-4">
                <dt>Registration fee</dt>
                <dd className="font-medium">{checkout.displayBaseAmount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>GST (18%)</dt>
                <dd className="font-medium">{checkout.displayGstAmount}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-[var(--journal-border)] pt-2">
                <dt className="font-medium text-[var(--journal-heading)]">
                  Total
                </dt>
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
            Charged in {selectedPlan.currency} via{" "}
            {paymentMethod === "paypal" ? "PayPal" : "Razorpay"} · Signed in as{" "}
            {user.email}
          </p>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void handlePay()}
          className="mt-5 rounded bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
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
