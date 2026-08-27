/** Marquee copy for homepage payment deadline extension notice. */
export const PAYMENT_DEADLINE_EXTENDED_MARQUEE =
  "Conference registration payment deadline extended to 28 August 2026, 11:59 PM IST — Complete your payment";

/** Payment deadline: 28 Aug 2026 11:59:59 PM IST = instant before 29 Aug 2026 00:00:00 IST */
export const PAYMENT_DEADLINE_IST_LABEL = "28 August 2026, 11:59 PM IST";

/** ISO instant for 2026-08-29 00:00:00 Asia/Kolkata */
export const PAYMENT_DEADLINE_EXCLUSIVE_MS = Date.parse("2026-08-29T00:00:00+05:30");

export function isBeforePaymentDeadline(now: Date = new Date()): boolean {
  return now.getTime() < PAYMENT_DEADLINE_EXCLUSIVE_MS;
}

export function formatIstDateTime(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const formatted = date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  return `${formatted} IST`;
}
