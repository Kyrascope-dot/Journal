import { FieldValue } from "firebase-admin/firestore";
import { emailService } from "@/lib/email/email-service";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { apcBillingRows } from "@/lib/payments/apc-billing";
import { getApcBillingForm } from "@/lib/payments/apc-billing-store";
import {
  MANUSCRIPT_PLAN_DETAILS,
  getPaymentCheckoutBreakdown,
  isManuscriptPlan,
} from "@/lib/payments/plans";
import { siteConfig } from "@/lib/site-config";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails the Editorial Office the billing details of a paid manuscript APC so
 * the invoice can be issued. Safe to call from checkout verification and the
 * webhook: it sends once per payment and never throws.
 */
export async function notifyApcPaymentCompleted(paymentDocId: string): Promise<void> {
  try {
    const db = getAdminFirestore();
    const paymentRef = db.collection("payments").doc(paymentDocId);

    // Claim the notification so concurrent callers (checkout + webhook) send it once.
    const payment = await db.runTransaction(async (transaction) => {
      const snap = await transaction.get(paymentRef);
      const data = snap.data();
      if (!data || data.status !== "paid" || !isManuscriptPlan(data.planId)) return null;
      if (data.apcOfficeEmailStatus === "sending" || data.apcOfficeEmailStatus === "sent") {
        return null;
      }
      transaction.update(paymentRef, { apcOfficeEmailStatus: "sending" });
      return data;
    });
    if (!payment || !isManuscriptPlan(payment.planId)) return;

    try {
      if (!emailService.isConfigured()) throw new Error("RESEND_API_KEY is not configured.");

      const form = payment.billingFormId
        ? await getApcBillingForm(String(payment.billingFormId))
        : null;
      const plan = MANUSCRIPT_PLAN_DETAILS[payment.planId];
      const checkout = getPaymentCheckoutBreakdown(payment.planId);
      const gateway = payment.gateway === "paypal" ? "PayPal" : "Razorpay";
      const reference =
        payment.gateway === "paypal"
          ? String(payment.paypalCaptureId ?? payment.paypalOrderId ?? "")
          : String(payment.razorpayPaymentId ?? payment.razorpayOrderId ?? "");

      const rows: { section: string; label: string; value: string }[] = [
        { section: "APC payment", label: "Author category", value: plan.authorCategory },
        { section: "APC payment", label: "Publication route", value: plan.route },
        {
          section: "APC payment",
          label: "APC before tax",
          value: checkout?.displayBaseAmount ?? "—",
        },
        {
          section: "APC payment",
          label: "GST / tax",
          value: checkout?.displayGstAmount ?? "Not applicable",
        },
        {
          section: "APC payment",
          label: "Amount paid",
          value: `${String(payment.displayAmount ?? "")} (${String(payment.currency ?? "")})`,
        },
        { section: "APC payment", label: "Paid via", value: gateway },
        { section: "APC payment", label: "Payment reference", value: reference || "—" },
        { section: "APC payment", label: "Account email", value: String(payment.userEmail ?? "") },
        ...(form
          ? apcBillingRows(form.details)
          : [
              {
                section: "Billing details",
                label: "APC form",
                value: "No billing form was found for this payment.",
              },
            ]),
      ];

      const sections = Array.from(new Set(rows.map((row) => row.section)));
      const html = [
        `<p>A manuscript APC payment has been received. The billing details below are for issuing the invoice.</p>`,
        ...sections.map(
          (section) =>
            `<h3 style="margin:20px 0 6px;font-size:15px">${escapeHtml(section)}</h3>` +
            `<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px">` +
            rows
              .filter((row) => row.section === section)
              .map(
                (row) =>
                  `<tr><td style="border:1px solid #ddd;font-weight:600;vertical-align:top">${escapeHtml(row.label)}</td>` +
                  `<td style="border:1px solid #ddd;white-space:pre-line">${escapeHtml(row.value)}</td></tr>`,
              )
              .join("") +
            `</table>`,
        ),
      ].join("");
      const text = sections
        .map(
          (section) =>
            `${section.toUpperCase()}\n` +
            rows
              .filter((row) => row.section === section)
              .map((row) => `${row.label}: ${row.value}`)
              .join("\n"),
        )
        .join("\n\n");

      const authorName = form?.details.correspondingAuthorName ?? String(payment.userEmail ?? "");
      await emailService.send({
        to: process.env.EDITORIAL_EMAIL ?? siteConfig.email,
        subject: `APC payment received — ${authorName} (${plan.authorCategory}, ${plan.route})`,
        html,
        text: `A manuscript APC payment has been received.\n\n${text}`,
      });

      await paymentRef.update({
        apcOfficeEmailStatus: "sent",
        apcOfficeEmailSentAt: FieldValue.serverTimestamp(),
      });
    } catch (emailError) {
      console.error("[payments/apc-notification] email failed:", emailError);
      // "failed" (unlike "sending"/"sent") lets a later webhook retry.
      await paymentRef.update({
        apcOfficeEmailStatus: "failed",
        apcOfficeEmailError:
          emailError instanceof Error ? emailError.message.slice(0, 500) : "Unknown error",
      });
    }
  } catch (error) {
    console.error("[payments/apc-notification]", error);
  }
}
