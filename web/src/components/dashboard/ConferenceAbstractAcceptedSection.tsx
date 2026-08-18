"use client";

import { useMemo, useState } from "react";
import { requestSendTestEmail } from "@/lib/client/admin-communications";
import { renderSubmissionEmail } from "@/lib/email/templates/submission-status";
import type { Submission } from "@/types/dashboard";

function formatSubmissionDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
}

export function ConferenceAbstractAcceptedSection({
  submission,
  adminEmail,
}: {
  submission: Submission;
  adminEmail: string;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [testEmail, setTestEmail] = useState(adminEmail);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const rendered = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://www.globalconfluencereview.in";
    return renderSubmissionEmail("conference_abstract_accepted", {
      authorName: submission.authorName || "Author",
      authorEmail: submission.authorEmail,
      registrationId: submission.registrationId,
      paperTitle: submission.title || "Untitled",
      submissionDate: formatSubmissionDate(submission.submittedAt),
      currentStatus: "Accepted",
      submissionPurpose: "conference",
      conferenceAwardIntent: submission.conferenceAwardIntent,
      dashboardUrl: `${origin}/dashboard?view=author`,
      logoUrl: `${origin}/GCR_logo.jpg`,
    });
  }, [submission]);

  async function handleSendTest() {
    if (!testEmail.trim()) {
      setError("Enter a test email address.");
      return;
    }
    setSending(true);
    setError("");
    setMessage("");
    try {
      await requestSendTestEmail({
        to: testEmail.trim(),
        subject: rendered.subject,
        bodyHtml: rendered.html,
        bodyText: rendered.text,
        sampleSubmissionId: submission.id,
      });
      setMessage(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send test email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-6 rounded-lg border border-[var(--journal-border)] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-[var(--journal-heading)]">
            Abstract Accepted
          </p>
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Sent automatically when status is set to accepted. Preview uses this author&apos;s
            name and title — no unresolved {"{{variables}}"}.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPreviewOpen((open) => !open)}
          className="text-xs font-medium text-[var(--journal-accent)] hover:underline"
        >
          {previewOpen ? "Hide preview" : "Preview email"}
        </button>
      </div>
      <p className="mt-3 text-xs text-[var(--journal-muted)]">
        <span className="font-medium text-[var(--journal-heading)]">Subject:</span>{" "}
        {rendered.subject}
      </p>
      {previewOpen ? (
        <div className="mt-3 overflow-hidden rounded border border-[var(--journal-border)]">
          <iframe
            title="Abstract Accepted email preview"
            srcDoc={rendered.html}
            className="h-[420px] w-full bg-white"
            sandbox=""
          />
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[220px] flex-1">
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Send test email
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleSendTest()}
          className="rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send test"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
