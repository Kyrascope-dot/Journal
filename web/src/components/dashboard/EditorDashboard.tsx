"use client";

import { useEffect, useState } from "react";
import { getSubmissionsForEditor, updateSubmissionStatus } from "@/lib/firestore-submissions";
import { submissionForViewer } from "@/lib/dashboard-access";
import type { Submission, SubmissionStatus, UserProfile } from "@/types/dashboard";
import { STATUS_LABELS, SUBMISSION_PURPOSE_LABELS, formatConferenceSubmissionMeta, getSubmissionStatusLabel } from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { SubmissionTimeline } from "@/components/dashboard/SubmissionTimeline";

function formatDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const STATUSES: SubmissionStatus[] = [
  "pending",
  "editorial_screening",
  "desk_rejected",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
];

function statusesForSubmission(purpose: Submission["submissionPurpose"]): SubmissionStatus[] {
  return purpose === "conference"
    ? ["pending", "accepted", "rejected"]
    : [
        "editorial_screening",
        "desk_rejected",
        "under_review",
        "revision_requested",
        "accepted",
        "rejected",
      ];
}

export function EditorDashboard({ profile }: { profile: UserProfile }) {
  const categories = profile.assignedCategories ?? [];
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("all");
  const [filterPurpose, setFilterPurpose] = useState<"all" | "journal" | "conference">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "registration_date" | "registration_id" | "submission_type" | "status"
  >("registration_date");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError("");
    getSubmissionsForEditor(profile.uid, categories)
      .then((s) => {
        if (!cancelled) setSubmissions(s);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Could not load submissions. Check your connection or Firestore rules.");
          setSubmissions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile.uid, categories.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStatusChange(
    submissionId: string,
    status: SubmissionStatus,
    note?: string
  ) {
    setUpdatingId(submissionId);
    try {
      const current = submissions.find((submission) => submission.id === submissionId);
      await updateSubmissionStatus(submissionId, status, note, {
        id: profile.uid,
        name: profile.displayName || profile.email,
        role: "editor",
        registrationId: current?.registrationId ?? submissionId,
      });
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === submissionId ? { ...s, status, statusNote: note ?? null } : s
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const visibleSubmissions = submissions.map((s) =>
    submissionForViewer(s, "editor", profile.uid)
  );

  const displayed = visibleSubmissions
    .filter((submission) => {
      if (filterStatus !== "all" && submission.status !== filterStatus) return false;
      if (
        filterPurpose !== "all" &&
        submission.submissionPurpose !== filterPurpose
      ) {
        return false;
      }
      const needle = searchQuery.trim().toLowerCase();
      return (
        !needle ||
        [
          submission.registrationId,
          submission.title,
          submission.authorName,
          submission.authorEmail,
        ].some((value) => value.toLowerCase().includes(needle))
      );
    })
    .sort((a, b) => {
      if (sortBy === "registration_id") {
        return a.registrationId.localeCompare(b.registrationId);
      }
      if (sortBy === "submission_type") {
        return a.submissionPurpose.localeCompare(b.submissionPurpose);
      }
      if (sortBy === "status") return a.status.localeCompare(b.status);
      const toMs = (value: Submission["submittedAt"]) => {
        if (!value) return 0;
        return value instanceof Date ? value.getTime() : value.toMillis();
      };
      return toMs(b.submittedAt) - toMs(a.submittedAt);
    });

  const assignedCount = visibleSubmissions.filter(
    (s) => s.assignedEditorId === profile.uid
  ).length;

  return (
    <div>
      <div className="mb-6 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-4">
        <p className="text-sm font-medium text-[var(--journal-heading)]">
          Your editor queue
        </p>
        <p className="mt-1 text-sm text-[var(--journal-muted)]">
          {assignedCount} paper{assignedCount === 1 ? "" : "s"} assigned to you
          {categories.length > 0
            ? ` · ${categories.length} categor${categories.length === 1 ? "y" : "ies"} for new submissions`
            : " · ask an admin to assign categories if you need the category queue"}
        </p>
        {categories.length > 0 && (
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
        )}
      </div>

      {loadError && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {loadError}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Search
          </label>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Registration ID, title, author, or email"
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Submission type
          </label>
          <select
            value={filterPurpose}
            onChange={(e) =>
              setFilterPurpose(e.target.value as typeof filterPurpose)
            }
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          >
            <option value="all">All types</option>
            <option value="journal">Journal</option>
            <option value="conference">Conference</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          >
            <option value="registration_date">Registration date</option>
            <option value="registration_id">Registration ID</option>
            <option value="submission_type">Submission type</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
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
          No submissions in your queue yet. When an admin assigns a paper to you, it will appear
          here.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
          {displayed.map((sub) => (
            <li key={sub.id} className="py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--journal-accent)]">
                    Registration ID: {sub.registrationId}
                  </p>
                  <p className="mt-1 font-medium text-[var(--journal-heading)]">
                    Paper Title: {sub.title}
                  </p>
                  {sub.assignedEditorId === profile.uid && (
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                      Assigned to you
                    </span>
                  )}
                  <p className="mt-1 text-sm text-[var(--journal-muted)]">
                    {SUBMISSION_PURPOSE_LABELS[sub.submissionPurpose]}
                    {formatConferenceSubmissionMeta(sub)
                      ? ` · ${formatConferenceSubmissionMeta(sub)}`
                      : ""}{" "}
                    · {sub.category} · {sub.authorName} · {sub.affiliation}
                  </p>
                  <p className="text-xs text-[var(--journal-muted)]">
                    Submitted {formatDate(sub.submittedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge
                    status={sub.status}
                    purpose={sub.submissionPurpose}
                  />
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
                        Submission Date
                      </dt>
                      <dd>{formatDate(sub.submittedAt)}</dd>
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
                        Submission Type
                      </dt>
                      <dd>{SUBMISSION_PURPOSE_LABELS[sub.submissionPurpose]}</dd>
                    </div>
                  </dl>
                  <p className="text-sm text-[var(--journal-body)]">
                    <span className="font-medium">Abstract:</span> {sub.abstract}
                  </p>
                  <p className="mt-2 text-sm text-[var(--journal-muted)]">
                    Author email: {sub.authorEmail}
                  </p>

                  <div className="mt-5">
                    <p className="text-sm font-medium text-[var(--journal-heading)]">
                      Update status
                    </p>
                    <StatusUpdateForm
                      purpose={sub.submissionPurpose}
                      currentStatus={sub.status}
                      currentNote={sub.statusNote}
                      loading={updatingId === sub.id}
                      onSave={(s, n) => handleStatusChange(sub.id, s, n)}
                    />
                  </div>

                  <SubmissionTimeline submission={sub} />
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
  purpose,
  currentStatus,
  currentNote,
  loading,
  onSave,
}: {
  purpose: Submission["submissionPurpose"];
  currentStatus: SubmissionStatus;
  currentNote: string | null;
  loading: boolean;
  onSave: (status: SubmissionStatus, note?: string) => void;
}) {
  const [status, setStatus] = useState<SubmissionStatus>(currentStatus);
  const [note, setNote] = useState(currentNote ?? "");
  const options = statusesForSubmission(purpose);

  return (
    <div className="mt-2 space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
        className="w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
      >
        {options.map((s) => (
          <option key={s} value={s}>
            {getSubmissionStatusLabel(s, purpose)}
          </option>
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
        disabled={loading || (status === currentStatus && note === (currentNote ?? ""))}
        onClick={() => onSave(status, note || undefined)}
        className="rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save status"}
      </button>
    </div>
  );
}
