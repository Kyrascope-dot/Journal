import type { ConferenceFeeWaiver } from "@/types/dashboard";

/** Full fee waiver authors may receive Zoom links without payment on record. */
export function canSendConferenceZoomLinks(input: {
  paymentCompleted: boolean;
  conferenceFeeWaiver?: ConferenceFeeWaiver | null;
}): boolean {
  return input.paymentCompleted || input.conferenceFeeWaiver === "full";
}

export function shouldShowPaymentReminder(input: {
  paymentCompleted: boolean;
  conferenceFeeWaiver?: ConferenceFeeWaiver | null;
  beforeDeadline: boolean;
}): boolean {
  if (canSendConferenceZoomLinks(input)) return false;
  return input.beforeDeadline;
}

export function shouldShowPaymentDeadlinePassed(input: {
  paymentCompleted: boolean;
  conferenceFeeWaiver?: ConferenceFeeWaiver | null;
  beforeDeadline: boolean;
}): boolean {
  if (canSendConferenceZoomLinks(input)) return false;
  return !input.beforeDeadline;
}
