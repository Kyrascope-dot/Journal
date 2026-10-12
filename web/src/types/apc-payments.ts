import type { ApcBillingDetails } from "@/lib/payments/apc-billing";

/** Payment state shown to admins for an APC form. */
export type AdminApcPaymentStatus = "paid" | "created" | "failed" | "refunded";

export type AdminApcPayment = {
  id: string;
  status: AdminApcPaymentStatus;
  gateway: "razorpay" | "paypal";
  /** Razorpay payment id / PayPal capture id (order id until paid). */
  reference: string;
  displayAmount: string;
  currency: string;
  createdAt: string | null;
  paidAt: string | null;
  /** Editorial-office email with the billing details. */
  officeEmailStatus: "sent" | "failed" | "sending" | "not_sent";
  officeEmailError: string | null;
};

/** One APC Payment and Billing Details Form with its payment, for the admin dashboard. */
export type AdminApcRecord = {
  /** Stable key for lists. */
  id: string;
  formId: string | null;
  submittedAt: string | null;
  planId: string;
  authorCategory: string;
  route: string;
  /** Signed-in account that submitted the form. */
  accountEmail: string;
  /** Null for payments started before the APC form existed. */
  details: ApcBillingDetails | null;
  /** Total payable for the route (from the pricing configuration). */
  displayTotalAmount: string;
  payment: AdminApcPayment | null;
};
