"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getSubmissionById } from "@/lib/firestore-submissions";
import { siteConfig } from "@/lib/site-config";
import {
  SUBMISSION_PURPOSE_LABELS,
  getSubmissionStatusLabel,
  type Submission,
} from "@/types/dashboard";

function formatDateTime(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleString("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

export function SubmissionAcknowledgement({
  submissionId,
}: {
  submissionId: string;
}) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(
        `/login?next=${encodeURIComponent(`/dashboard/acknowledgement/${submissionId}`)}`
      );
      return;
    }
    getSubmissionById(submissionId)
      .then(setSubmission)
      .finally(() => setLoading(false));
  }, [authLoading, router, submissionId, user]);

  if (authLoading || loading) {
    return <p className="text-[var(--journal-muted)]">Loading acknowledgement…</p>;
  }
  if (!submission) {
    return <p className="text-red-700">Acknowledgement not found or access denied.</p>;
  }

  async function copyRegistrationId() {
    await navigator.clipboard.writeText(submission!.registrationId);
    setCopied(true);
  }

  const publicationName =
    submission.submissionPurpose === "conference"
      ? `${siteConfig.name} International Conference`
      : siteConfig.name;

  return (
    <>
      <article className="acknowledgement-print rounded-lg border border-[var(--journal-border)] bg-white p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--journal-accent)]">
          Submission acknowledgement receipt
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          {siteConfig.name}
        </h1>
        <dl className="mt-8 grid gap-5 text-sm sm:grid-cols-2">
          {[
            ["Registration ID", submission.registrationId],
            ["Paper Title", submission.title],
            ["Submission Type", SUBMISSION_PURPOSE_LABELS[submission.submissionPurpose]],
            ["Date & Time", formatDateTime(submission.submittedAt)],
            ["Author Name", submission.authorName],
            ["Author Email", submission.authorEmail],
            [
              "Current Status",
              getSubmissionStatusLabel(
                submission.status,
                submission.submissionPurpose
              ),
            ],
            ["Journal/Conference Name", publicationName],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-medium text-[var(--journal-muted)]">{label}</dt>
              <dd className="mt-1 text-[var(--journal-heading)]">{value}</dd>
            </div>
          ))}
        </dl>
      </article>
      <div className="mt-6 flex flex-wrap gap-3 print:hidden">
        <button
          type="button"
          onClick={copyRegistrationId}
          className="rounded border border-[var(--journal-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
        >
          {copied ? "Registration ID copied" : "Copy Registration ID"}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Download / Save as PDF
        </button>
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .acknowledgement-print,
          .acknowledgement-print * {
            visibility: visible;
          }
          .acknowledgement-print {
            position: absolute;
            inset: 0;
            border: 0;
          }
        }
      `}</style>
    </>
  );
}
