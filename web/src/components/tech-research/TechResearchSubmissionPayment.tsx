"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  requestCapturePayPalOrder,
  requestCreatePaymentOrder,
  requestCreatePayPalOrder,
} from "@/lib/client/payments";
import { formatCheckoutPaymentError } from "@/lib/payments/checkout-errors";
import { TECH_RESEARCH_PAYMENT_PLAN } from "@/lib/payments/plans";
import {
  openRazorpayCheckout,
  validateInternationalCheckoutContact,
} from "@/lib/payments/razorpay-checkout-client";
import { TECH_RESEARCH_SUBMISSION_FEE_DISPLAY } from "@/lib/tech-research-config";

type PaymentMethod = "razorpay" | "paypal";

type Props = {
  registrationId: string;
};

export function TechResearchSubmissionPayment({ registrationId }: Props) {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("razorpay");
  const [contactPhone, setContactPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const finalizePayPalReturn = useCallback(async (orderId: string) => {
    setBusy(true);
    setError("");
    setMessage("Finalizing PayPal payment...");
    try {
      const captured = await requestCapturePayPalOrder({ orderId });
      setMessage(
        captured.alreadyPaid
          ? `PayPal payment already recorded. Payment ID: ${captured.paypalCaptureId}`
          : `PayPal payment successful. Payment ID: ${captured.paypalCaptureId}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? formatCheckoutPaymentError(err.message)
          : "Could not finalize PayPal payment."
      );
      setMessage("");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`
      );
      return;
    }

    if (!returnedFromPayPal || !orderId) return;

    void finalizePayPalReturn(orderId).finally(() => {
      params.delete("paypal_return");
      params.delete("token");
      params.delete("PayerID");
      const nextSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`
      );
    });
  }, [finalizePayPalReturn]);

  async function handlePay() {
    if (!user) {
      setError("Please sign in before paying.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    try {
      if (paymentMethod === "paypal") {
        const order = await requestCreatePayPalOrder({
          planId: TECH_RESEARCH_PAYMENT_PLAN.id,
          registrationId,
          returnPath: "/tech-research/apply",
        });
        window.location.href = order.approveUrl;
        return;
      }

      const contactError = validateInternationalCheckoutContact(contactPhone);
      if (contactError) {
        setError(contactError);
        return;
      }

      const order = await requestCreatePaymentOrder({
        planId: TECH_RESEARCH_PAYMENT_PLAN.id,
        registrationId,
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
          registrationId,
        },
        onSuccess: async (verified) => {
          setMessage(
            verified.alreadyPaid
              ? `Payment already recorded. Payment ID: ${verified.razorpay_payment_id}`
              : `Payment successful. Payment ID: ${verified.razorpay_payment_id}.`
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
          : "Payment could not be completed."
      );
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/40 p-5 sm:p-6">
      <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        Submission fee — {TECH_RESEARCH_SUBMISSION_FEE_DISPLAY}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--journal-body)]">
        Complete payment to finalise your Tech Research application. Registration ID:{" "}
        <span className="font-medium text-[var(--journal-heading)]">{registrationId}</span>
      </p>

      <fieldset className="mt-4">
        <legend className="text-sm font-medium text-[var(--journal-heading)]">Payment method</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-[var(--journal-body)]">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="tech-research-payment-method"
              checked={paymentMethod === "razorpay"}
              onChange={() => setPaymentMethod("razorpay")}
              className="text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
            />
            Card (Razorpay)
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="tech-research-payment-method"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
              className="text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
            />
            PayPal
          </label>
        </div>
      </fieldset>

      {paymentMethod === "razorpay" ? (
        <div className="mt-4">
          <label htmlFor="tech-research-contact-phone" className={labelClass}>
            Mobile number <span className="text-red-500">*</span>
          </label>
          <input
            id="tech-research-contact-phone"
            type="tel"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="+91 98765 43210"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Required for Razorpay USD card payments.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {message}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handlePay()}
          disabled={busy}
          className="inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
        >
          {busy ? "Processing…" : `Pay ${TECH_RESEARCH_SUBMISSION_FEE_DISPLAY}`}
        </button>
        <Link
          href="/dashboard?view=author"
          className="inline-flex rounded border border-[var(--journal-border)] bg-white px-5 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
        >
          View dashboard
        </Link>
      </div>
    </div>
  );
}

const labelClass = "block text-sm font-medium text-[var(--journal-heading)]";
const inputClass =
  "mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]";
