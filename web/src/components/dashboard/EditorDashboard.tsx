"use client";

import { useEffect, useState } from "react";
import { getSubmissionsByCategories, updateSubmissionStatus } from "@/lib/firestore-submissions";
import type { Submission, SubmissionStatus, UserProfile } from "@/types/dashboard";
import { STATUS_LABELS } from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";

function formatDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STATUSES: SubmissionStatus[] = [
  "pending",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
];

export function EditorDashboard({ profile }: { profile: UserProfile }) {
  const categories = profile.assignedCategories ?? [];
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      setLoading(false);
      return;
    }
    getSubmissionsByCategories(categories).then((s) => {
      setSubmissions(s);
      setLoading(false);
    });
  }, [categories.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(
    submissionId: string,
    status: SubmissionStatus,
    note?: string
  ) {
    setUpdatingId(submissionId);
    try {
      await updateSubmissionStatus(submissionId, status, note);
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, status, statusNote: note ?? null } : s
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const displayed =
    filterStatus === "all"
      ? submissions
      : submissions.filter((s) => s.status === filterStatus);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[var(--journal-muted)]">
          You have no assigned categories yet. Please ask an admin to assign research
          categories to your editor profile.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Categories overview */}
      <div className="mb-6 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-4">
        <p className="text-sm font-medium text-[var(--journal-heading)]">
          Your assigned categories
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full bg-[var(--journal-accent)]/10 px-3 py-1 text-xs text-[var(--journal-accent)]"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--journal-heading)]">
          Filter by status:
        </span>
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilterStatus(s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              filterStatus === s
                ? "border-[var(--journal-accent)] bg-[var(--journal-accent)] text-white"
                : "border-[var(--journal-border)] bg-white text-[var(--journal-muted)] hover:border-[var(--journal-accent)]"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <p className="mt-8 text-center text-[var(--journal-muted)]">
          No submissions match the selected filter.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
          {displayed.map((sub) => (
            <li key={sub.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-[var(--journal-heading)]">{sub.title}</p>
                  <p className="mt-1 text-sm text-[var(--journal-muted)]">
                    {sub.category} · {sub.authorName} · {sub.affiliation}
                  </p>
                  <p className="text-xs text-[var(--journal-muted)]">
                    Submitted {formatDate(sub.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={sub.status} />
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === sub.id ? null : sub.id)
                    }
                    className="text-sm text-[var(--journal-accent)] hover:underline"
                  >
                    {expandedId === sub.id ? "Close" : "Review"}
                  </button>
                </div>
              </div>

              {expandedId === sub.id && (
                <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5">
                  <p className="text-sm text-[var(--journal-body)]">
                    <span className="font-medium">Abstract:</span> {sub.abstract}
                  </p>
                  <p className="mt-2 text-sm text-[var(--journal-muted)]">
                    Author email: {sub.authorEmail}
                  </p>

                  {/* Status update */}
                  <div className="mt-5">
                    <p className="text-sm font-medium text-[var(--journal-heading)]">
                      Update status
                    </p>
                    <StatusUpdateForm
                      currentStatus={sub.status}
                      currentNote={sub.statusNote}
                      loading={updatingId === sub.id}
                      onSave={(s, n) => handleStatusChange(sub.id, s, n)}
                    />
                  </div>

                  <CommentThread
                    submissionId={sub.id}
                    currentUserId={profile.uid}
                    currentUserName={profile.displayName || profile.email}
                    currentUserRole="editor"
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

function StatusUpdateForm({
  currentStatus,
  currentNote,
  loading,
  onSave,
}: {
  currentStatus: SubmissionStatus;
  currentNote: string | null;
  loading: boolean;
  onSave: (status: SubmissionStatus, note?: string) => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(currentStatus);
  const [note, setNote] = useState(currentNote ?? "");

  return (
    <div className="mt-2 space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
        className="w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note to author (e.g. revision guidance)"
        className="w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
      />
      <button
        type="button"
        disabled={loading || status === currentStatus && note === (currentNote ?? "")}
        onClick={() => onSave(status, note || undefined)}
        className="rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save status"}
      </button>
    </div>
  );
}
