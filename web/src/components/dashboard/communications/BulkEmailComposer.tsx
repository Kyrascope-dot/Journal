"use client";

import { useEffect, useRef, useState } from "react";
import {
  requestCreateCampaign,
  requestPreviewRecipients,
  requestProcessCampaignBatch,
  requestSaveCommunicationTemplate,
  requestSendIndividualEmail,
  requestSendTestEmail,
} from "@/lib/client/admin-communications";
import {
  COMMUNICATION_VARIABLE_INSERTS,
  type EmailCampaignSummary,
  type EmailTemplateRecord,
  type PersonalizedEmailPreview,
  type RecipientFilters,
} from "@/types/communications";
import {
  CONFERENCE_QUARTER_OPTIONS,
  RESEARCH_CATEGORIES,
  type SubmissionPurpose,
  type SubmissionStatus,
  type UserProfile,
  getSubmissionStatusLabel,
} from "@/types/dashboard";

type ComposerMode = "bulk" | "individual";

type Props = {
  open: boolean;
  onClose: () => void;
  purpose: SubmissionPurpose;
  mode?: ComposerMode;
  templates: EmailTemplateRecord[];
  editors?: UserProfile[];
  reviewers?: UserProfile[];
  /** Prefill for individual send */
  submissionId?: string;
  defaultSubject?: string;
  defaultBodyHtml?: string;
  onCampaignChange?: (campaign: EmailCampaignSummary) => void;
  onTemplatesChange?: () => void;
};

const CONFERENCE_STATUSES: SubmissionStatus[] = ["pending", "accepted", "rejected"];
const JOURNAL_STATUSES: SubmissionStatus[] = [
  "pending",
  "editorial_screening",
  "desk_rejected",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
];

function defaultFilters(purpose: SubmissionPurpose): RecipientFilters {
  return {
    purpose,
    statuses: [],
    conferenceQuarter: purpose === "conference" ? "q3" : undefined,
  };
}

function wrapSelection(textarea: HTMLTextAreaElement, before: string, after: string) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const value = textarea.value;
  const selected = value.slice(start, end) || "text";
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  const cursor = start + before.length + selected.length + after.length;
  return { next, cursor };
}

export function BulkEmailComposer({
  open,
  onClose,
  purpose,
  mode = "bulk",
  templates,
  editors = [],
  reviewers = [],
  submissionId,
  defaultSubject = "",
  defaultBodyHtml = "",
  onCampaignChange,
  onTemplatesChange,
}: Props) {
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [filters, setFilters] = useState<RecipientFilters>(() => defaultFilters(purpose));
  const [subject, setSubject] = useState(defaultSubject);
  const [bodyHtml, setBodyHtml] = useState(defaultBodyHtml);
  const [templateId, setTemplateId] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [previews, setPreviews] = useState<PersonalizedEmailPreview[]>([]);
  const [previewRows, setPreviewRows] = useState<
    { registrationId: string; authorName: string; authorEmail: string; subject: string }[]
  >([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmSend, setConfirmSend] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<EmailCampaignSummary | null>(null);
  const [saveAsTemplateName, setSaveAsTemplateName] = useState("");

  useEffect(() => {
    if (!open) return;
    setFilters(defaultFilters(purpose));
    setSubject(defaultSubject);
    setBodyHtml(defaultBodyHtml);
    setTemplateId("");
    setRecipientCount(null);
    setPreviews([]);
    setPreviewRows([]);
    setScheduledFor("");
    setMessage("");
    setError("");
    setConfirmSend(false);
    setActiveCampaign(null);
    setSaveAsTemplateName("");
  }, [open, purpose, defaultSubject, defaultBodyHtml, submissionId, mode]);

  if (!open) return null;

  const audienceTemplates = templates.filter(
    (t) => t.audience === purpose || t.audience === "both"
  );
  const statusOptions = purpose === "conference" ? CONFERENCE_STATUSES : JOURNAL_STATUSES;

  function applyTemplate(id: string) {
    setTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    setSubject(template.subject);
    setBodyHtml(template.bodyHtml);
  }

  function updateFilter<K extends keyof RecipientFilters>(key: K, value: RecipientFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleStatus(status: SubmissionStatus) {
    setFilters((prev) => {
      const current = prev.statuses ?? [];
      const next = current.includes(status)
        ? current.filter((s) => s !== status)
        : [...current, status];
      return { ...prev, statuses: next };
    });
  }

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`;
    const el = bodyRef.current;
    if (!el) {
      setBodyHtml((prev) => prev + token);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = bodyHtml.slice(0, start) + token + bodyHtml.slice(end);
    setBodyHtml(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function applyFormat(kind: "bold" | "italic" | "link" | "p" | "br") {
    const el = bodyRef.current;
    if (!el) return;
    let result: { next: string; cursor: number };
    if (kind === "bold") result = wrapSelection(el, "<strong>", "</strong>");
    else if (kind === "italic") result = wrapSelection(el, "<em>", "</em>");
    else if (kind === "link") result = wrapSelection(el, '<a href="https://">', "</a>");
    else if (kind === "p") result = wrapSelection(el, "<p>", "</p>");
    else result = wrapSelection(el, "", "<br/>");
    setBodyHtml(result.next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(result.cursor, result.cursor);
    });
  }

  async function refreshPreview() {
    if (mode === "individual") return;
    setPreviewLoading(true);
    setError("");
    try {
      const result = await requestPreviewRecipients({
        filters: { ...filters, purpose },
        purpose,
        subject: subject || "Preview",
        bodyHtml: bodyHtml || "<p>Preview</p>",
        limit: 10,
      });
      setRecipientCount(result.count);
      setPreviews(result.previews);
      setPreviewRows(
        result.recipients.map((r, index) => ({
          registrationId: r.registrationId,
          authorName: r.authorName,
          authorEmail: r.authorEmail,
          subject: result.previews[index]?.subject ?? subject,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleDraft() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestCreateCampaign({
        purpose,
        filters: { ...filters, purpose },
        subject,
        bodyHtml,
        templateId: templateId || null,
        action: "draft",
      });
      setActiveCampaign(result.campaign);
      onCampaignChange?.(result.campaign);
      setMessage("Draft saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save draft.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSchedule() {
    if (!scheduledFor) {
      setError("Choose a schedule date/time.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await requestCreateCampaign({
        purpose,
        filters: { ...filters, purpose },
        subject,
        bodyHtml,
        templateId: templateId || null,
        action: "schedule",
        scheduledFor: new Date(scheduledFor).toISOString(),
      });
      setActiveCampaign(result.campaign);
      onCampaignChange?.(result.campaign);
      setMessage(`Scheduled for ${new Date(scheduledFor).toLocaleString()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not schedule.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSend() {
    if (!confirmSend) {
      setConfirmSend(true);
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (mode === "individual") {
        if (!submissionId) throw new Error("Missing submission.");
        await requestSendIndividualEmail({
          submissionId,
          subject,
          bodyHtml,
          templateId: templateId || null,
        });
        setMessage("Email sent.");
        setConfirmSend(false);
        return;
      }

      const result = await requestCreateCampaign({
        purpose,
        filters: { ...filters, purpose },
        subject,
        bodyHtml,
        templateId: templateId || null,
        action: "send",
      });
      setActiveCampaign(result.campaign);
      onCampaignChange?.(result.campaign);
      setConfirmSend(false);

      if (result.queued && result.campaign.status !== "completed") {
        setMessage(
          `Queued ${result.campaign.totalRecipients} recipients (>50). Processing first batch…`
        );
        let campaign = result.campaign;
        while (campaign.status === "queued" || campaign.status === "sending") {
          const batch = await requestProcessCampaignBatch(campaign.id);
          campaign = batch.campaign;
          setActiveCampaign(campaign);
          onCampaignChange?.(campaign);
          setMessage(
            `Progress: ${campaign.sentCount} sent, ${campaign.failedCount} failed, ${campaign.pendingCount} pending.`
          );
          if (batch.processed === 0) break;
        }
      } else {
        setMessage(
          `Send complete: ${result.campaign.sentCount} sent, ${result.campaign.failedCount} failed.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
      setConfirmSend(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleTestEmail() {
    if (!testEmail.trim()) {
      setError("Enter a test email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestSendTestEmail({
        to: testEmail.trim(),
        subject,
        bodyHtml,
        sampleSubmissionId: submissionId ?? previews[0]?.submissionId ?? null,
      });
      setMessage(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test email failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTemplate() {
    if (!saveAsTemplateName.trim()) {
      setError("Enter a template name to save.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await requestSaveCommunicationTemplate({
        name: saveAsTemplateName.trim(),
        audience: purpose,
        subject,
        bodyHtml,
        description: "Saved from composer",
      });
      setMessage("Template saved.");
      onTemplatesChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save template.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8">
      <div className="w-full max-w-4xl rounded-lg border border-[var(--journal-border)] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--journal-border)] px-5 py-4">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
              {mode === "individual"
                ? "Send email"
                : purpose === "conference"
                  ? "Conference bulk email"
                  : "Journal bulk email"}
            </h3>
            <p className="mt-0.5 text-xs text-[var(--journal-muted)]">
              Personalize with {"{{variables}}"}. Unknown placeholders are left blank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-[var(--journal-muted)] hover:text-[var(--journal-heading)]"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {mode === "bulk" ? (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-sm font-semibold text-[var(--journal-heading)]">Filters</h4>
                {purpose === "conference" ? (
                  <button
                    type="button"
                    onClick={() => updateFilter("conferenceQuarter", "q3")}
                    className="rounded border border-[var(--journal-accent)] px-2.5 py-1 text-xs font-medium text-[var(--journal-accent)]"
                  >
                    Q3 conference default
                  </button>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-[var(--journal-muted)]">Status</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {statusOptions.map((status) => {
                      const active = (filters.statuses ?? []).includes(status);
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => toggleStatus(status)}
                          className={`rounded border px-2.5 py-1 text-xs ${
                            active
                              ? "border-[var(--journal-accent)] bg-sky-50 text-[var(--journal-accent)]"
                              : "border-[var(--journal-border)] text-[var(--journal-muted)]"
                          }`}
                        >
                          {getSubmissionStatusLabel(status, purpose)}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--journal-muted)]">
                    None selected = all statuses
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Category / track
                  </label>
                  <select
                    value={filters.category ?? ""}
                    onChange={(e) =>
                      updateFilter("category", e.target.value || undefined)
                    }
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  >
                    <option value="">All</option>
                    {RESEARCH_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {purpose === "conference" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--journal-muted)]">
                        Quarter
                      </label>
                      <select
                        value={filters.conferenceQuarter ?? ""}
                        onChange={(e) =>
                          updateFilter(
                            "conferenceQuarter",
                            (e.target.value || undefined) as RecipientFilters["conferenceQuarter"]
                          )
                        }
                        className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                      >
                        <option value="">All quarters</option>
                        {CONFERENCE_QUARTER_OPTIONS.map((q) => (
                          <option key={q.value} value={q.value}>
                            {q.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-[var(--journal-body)]">
                      <input
                        type="checkbox"
                        checked={Boolean(filters.bestPaperNominees)}
                        onChange={(e) => updateFilter("bestPaperNominees", e.target.checked)}
                      />
                      Best paper nominees (best_paper / both)
                    </label>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-[var(--journal-muted)]">
                        Editor
                      </label>
                      <select
                        value={filters.assignedEditorId ?? ""}
                        onChange={(e) =>
                          updateFilter("assignedEditorId", e.target.value || undefined)
                        }
                        className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                      >
                        <option value="">Any</option>
                        {editors.map((ed) => (
                          <option key={ed.uid} value={ed.uid}>
                            {ed.displayName || ed.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--journal-muted)]">
                        Reviewer
                      </label>
                      <select
                        value={filters.assignedReviewerId ?? ""}
                        onChange={(e) =>
                          updateFilter("assignedReviewerId", e.target.value || undefined)
                        }
                        className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                      >
                        <option value="">Any</option>
                        {reviewers.map((rev) => (
                          <option key={rev.uid} value={rev.uid}>
                            {rev.displayName || rev.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Registration ID
                  </label>
                  <input
                    value={filters.registrationId ?? ""}
                    onChange={(e) =>
                      updateFilter("registrationId", e.target.value || undefined)
                    }
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Author name
                  </label>
                  <input
                    value={filters.authorName ?? ""}
                    onChange={(e) => updateFilter("authorName", e.target.value || undefined)}
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Author email
                  </label>
                  <input
                    value={filters.authorEmail ?? ""}
                    onChange={(e) => updateFilter("authorEmail", e.target.value || undefined)}
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Date from
                  </label>
                  <input
                    type="date"
                    value={filters.dateFrom ?? ""}
                    onChange={(e) => updateFilter("dateFrom", e.target.value || undefined)}
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--journal-muted)]">
                    Date to
                  </label>
                  <input
                    type="date"
                    value={filters.dateTo ?? ""}
                    onChange={(e) => updateFilter("dateTo", e.target.value || undefined)}
                    className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => void refreshPreview()}
                  disabled={previewLoading}
                  className="rounded bg-[var(--journal-accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {previewLoading ? "Counting…" : "Preview recipients"}
                </button>
                {recipientCount != null ? (
                  <span className="text-sm text-[var(--journal-heading)]">
                    <strong>{recipientCount}</strong> matching recipient
                    {recipientCount === 1 ? "" : "s"}
                    {recipientCount > 50 ? " · will queue in batches of 25" : ""}
                  </span>
                ) : null}
              </div>

              {previewRows.length > 0 ? (
                <div className="mt-4 overflow-x-auto rounded border border-[var(--journal-border)]">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-sky-50 text-[var(--journal-muted)]">
                      <tr>
                        <th className="px-3 py-2 font-medium">Registration</th>
                        <th className="px-3 py-2 font-medium">Author</th>
                        <th className="px-3 py-2 font-medium">Email</th>
                        <th className="px-3 py-2 font-medium">Subject preview</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.map((row) => (
                        <tr
                          key={`${row.registrationId}-${row.authorEmail}`}
                          className="border-t border-[var(--journal-border)]"
                        >
                          <td className="px-3 py-2">{row.registrationId}</td>
                          <td className="px-3 py-2">{row.authorName}</td>
                          <td className="px-3 py-2">{row.authorEmail}</td>
                          <td className="px-3 py-2">{row.subject}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="border-t border-[var(--journal-border)] px-3 py-2 text-[11px] text-[var(--journal-muted)]">
                    Showing up to 10 personalized previews
                  </p>
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--journal-muted)]">
                Template
              </label>
              <select
                value={templateId}
                onChange={(e) => applyTemplate(e.target.value)}
                className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
              >
                <option value="">— Custom / blank —</option>
                {audienceTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--journal-muted)]">
                Subject
              </label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Body (HTML)
                </label>
                <div className="flex flex-wrap gap-1">
                  {(
                    [
                      ["bold", "B"],
                      ["italic", "I"],
                      ["link", "Link"],
                      ["p", "P"],
                      ["br", "BR"],
                    ] as const
                  ).map(([kind, label]) => (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => applyFormat(kind)}
                      className="rounded border border-[var(--journal-border)] px-2 py-0.5 text-[11px] font-medium text-[var(--journal-heading)]"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                ref={bodyRef}
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={10}
                className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 font-mono text-xs leading-relaxed"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {COMMUNICATION_VARIABLE_INSERTS.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="rounded bg-sky-50 px-2 py-0.5 text-[11px] text-sky-800"
                  >
                    {`{{${variable}}}`}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {mode === "bulk" ? (
            <section className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Schedule send
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Test email address
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleTestEmail()}
                    className="shrink-0 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  >
                    Send test
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Save current as template
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    value={saveAsTemplateName}
                    onChange={(e) => setSaveAsTemplateName(e.target.value)}
                    placeholder="Template name"
                    className="w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  />
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSaveTemplate()}
                    className="shrink-0 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                  >
                    Save template
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section>
              <label className="block text-xs font-medium text-[var(--journal-muted)]">
                Test email address
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleTestEmail()}
                  className="shrink-0 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
                >
                  Send test
                </button>
              </div>
            </section>
          )}

          {activeCampaign ? (
            <div className="rounded border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
              Campaign <strong>{activeCampaign.name}</strong> — {activeCampaign.status}. Sent{" "}
              {activeCampaign.sentCount}/{activeCampaign.totalRecipients}
              {activeCampaign.failedCount
                ? ` · ${activeCampaign.failedCount} failed`
                : ""}
            </div>
          ) : null}

          {message ? (
            <p className="text-sm text-emerald-700" role="status">
              {message}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-[var(--journal-border)] pt-4">
            {mode === "bulk" ? (
              <>
                <button
                  type="button"
                  disabled={busy || !subject.trim() || !bodyHtml.trim()}
                  onClick={() => void handleDraft()}
                  className="rounded border border-[var(--journal-border)] px-4 py-2 text-sm font-medium"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  disabled={busy || !subject.trim() || !bodyHtml.trim()}
                  onClick={() => void handleSchedule()}
                  className="rounded border border-[var(--journal-border)] px-4 py-2 text-sm font-medium"
                >
                  Schedule
                </button>
              </>
            ) : null}
            <button
              type="button"
              disabled={busy || !subject.trim() || !bodyHtml.trim()}
              onClick={() => void handleSend()}
              className={`rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
                confirmSend
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-[var(--journal-accent)] hover:opacity-95"
              }`}
            >
              {busy
                ? "Working…"
                : confirmSend
                  ? mode === "individual"
                    ? "Confirm send to author"
                    : `Confirm send to ${recipientCount ?? "all"} recipients`
                  : mode === "individual"
                    ? "Send email"
                    : "Send campaign"}
            </button>
            {confirmSend ? (
              <button
                type="button"
                onClick={() => setConfirmSend(false)}
                className="rounded px-3 py-2 text-sm text-[var(--journal-muted)]"
              >
                Cancel confirm
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
