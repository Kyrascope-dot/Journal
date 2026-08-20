/** User-facing messages for Razorpay checkout failures (client modal). */
export function formatCheckoutPaymentError(raw: string | undefined): string {
  const message = (raw ?? "").trim();
  if (!message) {
    return "Payment failed. Please try again or contact the editorial office.";
  }

  const lower = message.toLowerCase();

  if (/currency is not supported/i.test(message)) {
    return [
      "International USD checkout is not enabled on this Razorpay account yet.",
      "The site owner must activate International Payments in Razorpay Dashboard → Account & Settings → International payments → International Cards.",
      "If you are in India, select National Participants (USD 150 + 18% GST, USD 177 total) instead.",
    ].join(" ");
  }

  if (
    /international card/i.test(message) ||
    /card is not supported/i.test(message) ||
    /not enabled for international/i.test(message)
  ) {
    return [
      "This card could not be processed for international USD payment.",
      "If you have an Indian bank card, choose National Participants (USD 150 + 18% GST, USD 177 total).",
      "If you are outside India, the conference must enable Razorpay International Payments for USD 200 checkout.",
    ].join(" ");
  }

  if (/tokenization/i.test(message) || /issuer/i.test(message)) {
    return [
      message,
      "If testing, use Razorpay test mode keys (rzp_test_…) and the official test card 4111 1111 1111 1111.",
      "Live keys reject most test card numbers.",
    ].join(" ");
  }

  if (/contact/i.test(message) && /invalid/i.test(message)) {
    return [
      message,
      "Enter a valid mobile number before paying — Razorpay requires it for international card payments.",
    ].join(" ");
  }

  if (/authentication failed|payment declined|do not honor/i.test(lower)) {
    return [
      message,
      "Your bank declined the transaction. Try another card or contact your bank to allow international/online payments.",
    ].join(" ");
  }

  return message;
}

/** Server-side Razorpay API / SDK errors when creating orders. */
export function formatRazorpayOrderError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return error instanceof Error ? error.message : "Payment provider error.";
  }

  const err = error as {
    statusCode?: number;
    error?: { description?: string; code?: string; reason?: string };
    message?: string;
  };

  const description =
    err.error?.description || err.error?.reason || err.message || "";

  return formatCheckoutPaymentError(description) || "Payment provider error.";
}
