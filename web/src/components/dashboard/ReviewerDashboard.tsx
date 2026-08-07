"use client";

import { useEffect, useState } from "react";
import { getSubmissionsByAssignedReviewer } from "@/lib/firestore-submissions";
import { submissionForViewer } from "@/lib/dashboard-access";
import type { Submission, UserProfile } from "@/types/dashboard";
import {
  getSubmissionStatusLabel,
  SUBMISSION_PURPOSE_LABELS,
  formatConferenceSubmissionMeta,
} from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { SubmissionTimeline } from "@/components/dashboard/SubmissionTimeline";

function formatDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function ReviewerDashboard({ profile }: { profile: UserProfile }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    getSubmissionsByAssignedReviewer(profile.uid)
      .then(setSubmissions)
      .finally(() => setLoading(false));
  }, [profile.uid]);

  const visible = submissions.map((s) =>
    submissionForViewer(s, "reviewer", profile.uid)
  );

  return (
    <div>
      <p className="text-sm text-[var(--journal-muted)]">
        Manuscripts assigned to you for peer review. Do not share review content outside the
        editorial process.
      </p>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-center text-[var(--journal-muted)]">
          No manuscripts assigned to you yet. An admin will assign papers when peer review begins.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
          {visible.map((sub) => (
            <li key={sub.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--journal-accent)]">
                    Registration ID: {sub.registrationId}
                  </p>
                  <p className="mt-1 font-medium text-[var(--journal-heading)]">
                    Paper Title: {sub.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--journal-muted)]">
                    {SUBMISSION_PURPOSE_LABELS[sub.submissionPurpose]}
                    {formatConferenceSubmissionMeta(sub)
                      ? ` · ${formatConferenceSubmissionMeta(sub)}`
                      : ""}{" "}
                    · {sub.category} · Submitted {formatDate(sub.submittedAt)}
                  </p>
                  <p className="text-xs text-[var(--journal-muted)]">
                    Status:{" "}
                    {getSubmissionStatusLabel(sub.status, sub.submissionPurpose)} · Review
                    Deadline: {formatDate(sub.reviewDeadline)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={sub.status}
                    purpose={sub.submissionPurpose}
                  />
                  <button
                    type="button"
                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                    className="text-sm text-[var(--journal-accent)] hover:underline"
                  >
                    {expandedId === sub.id ? "Close" : "Review"}
                  </button>
                </div>
              </div>
              {expandedId === sub.id && (
                <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5">
                  <dl className="mb-5 grid gap-3 border-b border-[var(--journal-border)] pb-5 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-[var(--journal-muted)]">
                        Registration ID
                      </dt>
                      <dd>{sub.registrationId}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--journal-muted)]">Paper Title</dt>
                      <dd>{sub.title}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--journal-muted)]">
                        Current Status
                      </dt>
                      <dd>
                        {getSubmissionStatusLabel(
                          sub.status,
                          sub.submissionPurpose
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--journal-muted)]">
                        Review Deadline
                      </dt>
                      <dd>{formatDate(sub.reviewDeadline)}</dd>
                    </div>
                  </dl>
                  <p className="text-sm text-[var(--journal-body)]">
                    <span className="font-medium">Abstract:</span> {sub.abstract}
                  </p>
                  <SubmissionTimeline submission={sub} />
                  <CommentThread
                    submissionId={sub.id}
                    currentUserId={profile.uid}
                    currentUserName={profile.displayName || profile.email}
                    currentUserRole="reviewer"
                    canComment={true}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
