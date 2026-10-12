"use client";

import { useCallback, useEffect, useState } from "react";
import {
  requestAdminApcRecords,
  requestResendApcOfficeEmail,
} from "@/lib/client/admin-apc-payments";
import { apcBillingRows } from "@/lib/payments/apc-billing";
import type { AdminApcRecord } from "@/types/apc-payments";

type PaymentFilter = "all" | "paid" | "unpaid";

const FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "unpaid", label: "Not paid" },
];

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentState(record: AdminApcRecord): { label: string; className: string } {
  const status = record.payment?.status;
  if (status === "paid") return { label: "Paid", className: "bg-emerald-50 text-emerald-700" };
  if (status === "refunded") return { label: "Refunded", className: "bg-amber-50 text-amber-700" };
  if (status === "failed") return { label: "Payment failed", className: "bg-red-50 text-red-700" };
  if (status === "created") {
    return { label: "Payment not completed", className: "bg-zinc-100 text-zinc-700" };
  }
  return { label: "Form submitted, not paid", className: "bg-zinc-100 text-zinc-700" };
}

const OFFICE_EMAIL_LABELS: Record<string, string> = {
  sent: "Sent",
  failed: "Failed",
  sending: "Sending…",
  not_sent: "Not sent",
};

/** Admin view of every APC Payment and Billing Details Form and its payment. */
export function ApcPaymentsPanel() {
  const [records, setRecords] = useState<AdminApcRecord[]>([]);
  const [officeEmail, setOfficeEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PaymentFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError("");
    try {
      const data = await requestAdminApcRecords();
      setRecords(data.records);
      setOfficeEmail(data.officeEmail);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load APC payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function resendEmail(record: AdminApcRecord) {
    if (!record.payment) return;
    setResendingId(record.id);
    setError("");
    setNotice("");
    try {
      const recipient = await requestResendApcOfficeEmail(record.payment.id);
      setNotice(`Billing details emailed to ${recipient}.`);
      await load();
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "Could not send the email.");
    } finally {
      setResendingId(null);
    }
  }

  const needle = query.trim().toLowerCase();
  const visible = records.filter((record) => {
    const isPaid = record.payment?.status === "paid";
    if (filter === "paid" && !isPaid) return false;
    if (filter === "unpaid" && isPaid) return false;
    if (!needle) return true;
    return [
      record.details?.correspondingAuthorName,
      record.details?.correspondingAuthorEmail,
      record.details?.invoiceRecipientName,
      record.details?.billingEmail,
      record.details?.manuscriptId,
      record.details?.manuscriptTitle,
      record.accountEmail,
      record.payment?.reference,
    ].some((value) => (value ?? "").toLowerCase().includes(needle));
  });

  const paidCount = records.filter((record) => record.payment?.status === "paid").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
            APC Payments
          </h2>
          <p className="mt-1 text-sm text-[var(--journal-muted)]">
            APC Payment and Billing Details Forms filled in by authors before paying the
            publication fee. {records.length} form{records.length === 1 ? "" : "s"} · {paidCount}{" "}
            paid.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="rounded border border-[var(--journal-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search author, invoice recipient, email, manuscript ID or payment reference"
          aria-label="Search APC payments"
          className="w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)] sm:max-w-md"
        />
        <div className="flex gap-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
              className={`rounded border px-3 py-1.5 text-sm ${
                filter === item.value
                  ? "border-[var(--journal-accent)] bg-[var(--journal-accent)] text-white"
                  : "border-[var(--journal-border)] bg-white text-[var(--journal-heading)] hover:bg-zinc-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {notice ? (
        <p className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[var(--journal-muted)]">
          {records.length === 0
            ? "No APC forms have been submitted yet."
            : "No APC forms match your search."}
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
          {visible.map((record) => {
            const state = paymentState(record);
            const expanded = expandedId === record.id;
            const sections = record.details
              ? Array.from(new Set(apcBillingRows(record.details).map((row) => row.section)))
              : [];
            return (
              <li key={record.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--journal-heading)]">
                      {record.details?.correspondingAuthorName ?? record.accountEmail}
                    </p>
                    <p className="mt-1 text-sm text-[var(--journal-muted)]">
                      {record.authorCategory} · {record.route} ·{" "}
                      {record.payment?.displayAmount || record.displayTotalAmount}
                      {record.details?.manuscriptId
                        ? ` · Manuscript ID: ${record.details.manuscriptId}`
                        : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--journal-muted)]">
                      Form submitted {formatDateTime(record.submittedAt)}
                      {record.payment?.paidAt
                        ? ` · Paid ${formatDateTime(record.payment.paidAt)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${state.className}`}
                    >
                      {state.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : record.id)}
                      aria-expanded={expanded}
                      className="text-sm text-[var(--journal-accent)] hover:underline"
                    >
                      {expanded ? "Hide" : "View form"}
                    </button>
                  </div>
                </div>

                {expanded ? (
                  <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5">
                    <p className="text-sm font-semibold text-[var(--journal-heading)]">Payment</p>
                    <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">Status</dt>
                        <dd>{state.label}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">Amount</dt>
                        <dd>
                          {record.payment
                            ? `${record.payment.displayAmount} (${record.payment.currency})`
                            : `${record.displayTotalAmount} (not paid)`}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">Paid via</dt>
                        <dd>
                          {record.payment
                            ? record.payment.gateway === "paypal"
                              ? "PayPal"
                              : "Razorpay"
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">
                          Payment reference
                        </dt>
                        <dd className="break-all">{record.payment?.reference || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">Account email</dt>
                        <dd className="break-all">{record.accountEmail || "—"}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-[var(--journal-muted)]">
                          Billing email to office{officeEmail ? ` (${officeEmail})` : ""}
                        </dt>
                        <dd>
                          {record.payment
                            ? OFFICE_EMAIL_LABELS[record.payment.officeEmailStatus]
                            : "—"}
                          {record.payment?.officeEmailError
                            ? ` — ${record.payment.officeEmailError}`
                            : ""}
                        </dd>
                      </div>
                    </dl>

                    {record.payment?.status === "paid" ? (
                      <button
                        type="button"
                        disabled={resendingId === record.id}
                        onClick={() => void resendEmail(record)}
                        className="mt-4 rounded border border-[var(--journal-accent)] px-3 py-1.5 text-sm font-medium text-[var(--journal-accent)] hover:bg-[var(--journal-accent)]/5 disabled:opacity-50"
                      >
                        {resendingId === record.id
                          ? "Sending…"
                          : "Email billing details to the office"}
                      </button>
                    ) : null}

                    {record.details ? (
                      sections.map((section) => (
                        <div
                          key={section}
                          className="mt-5 border-t border-[var(--journal-border)] pt-4"
                        >
                          <p className="text-sm font-semibold text-[var(--journal-heading)]">
                            {section}
                          </p>
                          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                            {apcBillingRows(record.details!)
                              .filter((row) => row.section === section)
                              .map((row) => (
                                <div key={row.label}>
                                  <dt className="font-medium text-[var(--journal-muted)]">
                                    {row.label}
                                  </dt>
                                  <dd className="whitespace-pre-line break-words">{row.value}</dd>
                                </div>
                              ))}
                          </dl>
                        </div>
                      ))
                    ) : (
                      <p className="mt-5 border-t border-[var(--journal-border)] pt-4 text-sm text-[var(--journal-muted)]">
                        This payment was started before the APC form was introduced, so there are
                        no billing details for it.
                      </p>
                    )}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
