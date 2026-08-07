"use client";

import { useEffect, useState } from "react";
import {
  getAllSubmissions,
  assignEditor,
  assignReviewer,
  updateSubmissionStatus,
} from "@/lib/firestore-submissions";
import {
  getAllUsers,
  getAllEditors,
  getAllReviewers,
  setUserRole,
  findUserByEmail,
} from "@/lib/firestore-users";
import type {
  Submission,
  SubmissionPurpose,
  SubmissionStatus,
  UserProfile,
} from "@/types/dashboard";
import { RESEARCH_CATEGORIES, STATUS_LABELS, SUBMISSION_PURPOSE_LABELS, formatConferenceSubmissionMeta } from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { SubmissionTimeline } from "@/components/dashboard/SubmissionTimeline";
import { requestSendReviewerInvitation } from "@/lib/client/send-reviewer-invitation";

function formatDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateInput(value: Submission["reviewDeadline"]): string {
  if (!value) return "";
  const date = value instanceof Date ? value : value.toDate();
  return date.toISOString().slice(0, 10);
}

const STATUSES: SubmissionStatus[] = [
  "pending",
  "under_review",
  "revision_requested",
  "accepted",
  "rejected",
];

type AdminTab = "overview" | "submissions" | "users" | "editors";

export function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editors, setEditors] = useState<UserProfile[]>([]);
  const [reviewers, setReviewers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<SubmissionStatus | "all">("all");
  const [filterPurpose, setFilterPurpose] = useState<SubmissionPurpose | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "registration_date" | "registration_id" | "submission_type" | "status"
  >("registration_date");

  useEffect(() => {
    Promise.all([
      getAllSubmissions(),
      getAllUsers(),
      getAllEditors(),
      getAllReviewers(),
    ]).then(([subs, us, eds, revs]) => {
        setSubmissions(subs);
        setUsers(us);
        setEditors(eds);
        setReviewers(revs);
        setLoading(false);
      }
    );
  }, []);

  const refreshAll = async () => {
    const [subs, us, eds, revs] = await Promise.all([
      getAllSubmissions(),
      getAllUsers(),
      getAllEditors(),
      getAllReviewers(),
    ]);
    setSubmissions(subs);
    setUsers(us);
    setEditors(eds);
    setReviewers(revs);
  };

  const filteredSubs = submissions
    .filter((s) => {
      if (filterCategory !== "all" && s.category !== filterCategory) return false;
      if (filterStatus !== "all" && s.status !== filterStatus) return false;
      if (filterPurpose !== "all" && s.submissionPurpose !== filterPurpose) return false;
      const needle = searchQuery.trim().toLowerCase();
      if (
        needle &&
        ![s.registrationId, s.title, s.authorName, s.authorEmail].some((value) =>
          value.toLowerCase().includes(needle)
        )
      ) {
        return false;
      }
      return true;
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

  const stats = {
    total: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    underReview: submissions.filter((s) => s.status === "under_review").length,
    accepted: submissions.filter((s) => s.status === "accepted").length,
  };

  const tabs: { key: AdminTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "submissions", label: `Submissions (${submissions.length})` },
    { key: "users", label: `Users (${users.length})` },
    { key: "editors", label: `Editors (${editors.length})` },
  ];

  return (
    <div>
      <div className="border-b border-[var(--journal-border)]">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${
                tab === t.key
                  ? "border-[var(--journal-accent)] text-[var(--journal-accent)]"
                  : "border-transparent text-[var(--journal-muted)] hover:text-[var(--journal-heading)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-8">
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
        )}

        {!loading && tab === "overview" && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              At a Glance
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Total Submissions", value: stats.total, color: "text-zinc-800" },
                { label: "Pending Review", value: stats.pending, color: "text-amber-700" },
                { label: "Under Review", value: stats.underReview, color: "text-blue-700" },
                { label: "Accepted", value: stats.accepted, color: "text-emerald-700" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-[var(--journal-border)] bg-white p-5 text-center shadow-sm"
                >
                  <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--journal-muted)]">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-zinc-800">{users.length}</p>
                <p className="mt-1 text-xs font-medium text-[var(--journal-muted)]">
                  Registered Users
                </p>
              </div>
              <div className="rounded-lg border border-[var(--journal-border)] bg-white p-5 shadow-sm">
                <p className="text-2xl font-bold text-zinc-800">{editors.length}</p>
                <p className="mt-1 text-xs font-medium text-[var(--journal-muted)]">
                  Active Editors
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && tab === "submissions" && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              All Submissions
            </h2>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="min-w-64 flex-1">
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Search
                </label>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Registration ID, title, author, or email"
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="mt-1 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
                >
                  <option value="all">All categories</option>
                  {RESEARCH_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as SubmissionStatus | "all")}
                  className="mt-1 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--journal-muted)]">
                  Submission type
                </label>
                <select
                  value={filterPurpose}
                  onChange={(e) =>
                    setFilterPurpose(e.target.value as SubmissionPurpose | "all")
                  }
                  className="mt-1 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
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
                  className="mt-1 rounded border border-[var(--journal-border)] px-3 py-1.5 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
                >
                  <option value="registration_date">Registration date</option>
                  <option value="registration_id">Registration ID</option>
                  <option value="submission_type">Submission type</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            <p className="mt-3 text-sm text-[var(--journal-muted)]">
              Showing {filteredSubs.length} of {submissions.length} submissions
            </p>
            <ul className="mt-3 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
              {filteredSubs.map((sub) => (
                <li key={sub.id} className="py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--journal-accent)]">
                        Registration ID: {sub.registrationId}
                      </p>
                      <p className="mt-1 font-medium text-[var(--journal-heading)]">
                        Paper Title: {sub.title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--journal-muted)]">
                        {sub.authorName} · {sub.affiliation}
                      </p>
                      <p className="text-xs text-[var(--journal-muted)]">
                        {SUBMISSION_PURPOSE_LABELS[sub.submissionPurpose]}
                        {formatConferenceSubmissionMeta(sub)
                          ? ` · ${formatConferenceSubmissionMeta(sub)}`
                          : ""}{" "}
                        · {sub.category} · Submitted {formatDate(sub.submittedAt)}
                        {sub.assignedEditorName && ` · Editor: ${sub.assignedEditorName}`}
                        {sub.assignedReviewerName && ` · Reviewer: ${sub.assignedReviewerName}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={sub.status} />
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSubId(
                            expandedSubId === sub.id ? null : sub.id
                          )
                        }
                        className="text-sm text-[var(--journal-accent)] hover:underline"
                      >
                        {expandedSubId === sub.id ? "Close" : "Manage"}
                      </button>
                    </div>
                  </div>
                  {expandedSubId === sub.id && (
                    <SubmissionPanel
                      submission={sub}
                      editors={editors}
                      reviewers={reviewers}
                      allUsers={users}
                      adminProfile={profile}
                      onUpdate={refreshAll}
                    />
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && tab === "users" && (
          <UsersPanel users={users} onUpdate={refreshAll} />
        )}

        {!loading && tab === "editors" && (
          <EditorsPanel
            editors={editors}
            onUpdate={refreshAll}
          />
        )}
      </div>
    </div>
  );
}

/* ── Submission management panel ── */
function SubmissionPanel({
  submission,
  editors,
  reviewers,
  allUsers,
  adminProfile,
  onUpdate,
}: {
  submission: Submission;
  editors: UserProfile[];
  reviewers: UserProfile[];
  allUsers: UserProfile[];
  adminProfile: UserProfile;
  onUpdate: () => Promise<void>;
}) {
  const [selectedEditorId, setSelectedEditorId] = useState(
    submission.assignedEditorId ?? ""
  );
  const [selectedReviewerId, setSelectedReviewerId] = useState(
    submission.assignedReviewerId ?? ""
  );
  const [status, setStatus] = useState<SubmissionStatus>(submission.status);
  const [statusNote, setStatusNote] = useState(submission.statusNote ?? "");
  const [reviewDeadline, setReviewDeadline] = useState(
    formatDateInput(submission.reviewDeadline)
  );
  const [saving, setSaving] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  useEffect(() => {
    setSelectedEditorId(submission.assignedEditorId ?? "");
    setSelectedReviewerId(submission.assignedReviewerId ?? "");
    setStatus(submission.status);
    setStatusNote(submission.statusNote ?? "");
    setReviewDeadline(formatDateInput(submission.reviewDeadline));
  }, [
    submission.id,
    submission.assignedEditorId,
    submission.assignedReviewerId,
    submission.status,
    submission.statusNote,
    submission.reviewDeadline,
  ]);

  const reviewerOptions =
    reviewers.length > 0
      ? reviewers
      : allUsers.filter((u) => u.role !== "admin");

  function findUserById(uid: string): UserProfile | undefined {
    return (
      reviewers.find((r) => r.uid === uid) ??
      allUsers.find((u) => u.uid === uid)
    );
  }

  async function persistReviewerAssignment(reviewerId: string): Promise<void> {
    const reviewer = findUserById(reviewerId);
    if (!reviewer) {
      throw new Error("Selected reviewer not found. Assign the Reviewer role in Users first.");
    }
    await assignReviewer(
      submission.id,
      reviewer.uid,
      reviewer.displayName || reviewer.email,
      reviewDeadline ? new Date(`${reviewDeadline}T23:59:59`) : null
    );
  }

  async function handleSave() {
    setSaving(true);
    setEmailMsg("");
    try {
      if (selectedEditorId && selectedEditorId !== submission.assignedEditorId) {
        const editor = editors.find((e) => e.uid === selectedEditorId);
        if (editor) {
          await assignEditor(
            submission.id,
            editor.uid,
            editor.displayName || editor.email,
            {
              id: adminProfile.uid,
              name: adminProfile.displayName || adminProfile.email,
              registrationId: submission.registrationId,
            }
          );
        }
      }
      if (selectedReviewerId !== (submission.assignedReviewerId ?? "")) {
        if (selectedReviewerId) {
          await persistReviewerAssignment(selectedReviewerId);
        } else {
          await assignReviewer(submission.id, null, null);
        }
      }
      if (
        selectedReviewerId &&
        selectedReviewerId === (submission.assignedReviewerId ?? "") &&
        reviewDeadline !== formatDateInput(submission.reviewDeadline)
      ) {
        await persistReviewerAssignment(selectedReviewerId);
      }
      if (
        status !== submission.status ||
        statusNote !== (submission.statusNote ?? "")
      ) {
        await updateSubmissionStatus(submission.id, status, statusNote || undefined, {
          id: adminProfile.uid,
          name: adminProfile.displayName || adminProfile.email,
          role: "admin",
          registrationId: submission.registrationId,
        });
      }
      await onUpdate();
    } finally {
      setSaving(false);
    }
  }

  const savedReviewerId = submission.assignedReviewerId;
  const reviewerPendingSave =
    Boolean(selectedReviewerId) && selectedReviewerId !== (savedReviewerId ?? "");

  async function handleSendReviewerEmail() {
    setEmailMsg("");
    setEmailSending(true);
    try {
      let reviewerId = savedReviewerId;
      if (!reviewerId || reviewerId !== selectedReviewerId) {
        if (!selectedReviewerId) {
          setEmailMsg("Select a peer reviewer first.");
          return;
        }
        await persistReviewerAssignment(selectedReviewerId);
        await onUpdate();
        reviewerId = selectedReviewerId;
      }
      const reviewer = findUserById(reviewerId);
      await requestSendReviewerInvitation(submission.id, reviewerId);
      setEmailMsg(`Invitation email sent to ${reviewer?.email ?? "reviewer"}.`);
    } catch (err) {
      setEmailMsg(err instanceof Error ? err.message : "Failed to send email.");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-5">
      <dl className="mb-5 grid gap-3 border-b border-[var(--journal-border)] pb-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-medium text-[var(--journal-muted)]">Registration ID</dt>
          <dd className="font-semibold text-[var(--journal-accent)]">
            {submission.registrationId}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--journal-muted)]">Paper Title</dt>
          <dd>{submission.title}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--journal-muted)]">Submission Date</dt>
          <dd>{formatDate(submission.submittedAt)}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--journal-muted)]">Current Status</dt>
          <dd>{STATUS_LABELS[submission.status]}</dd>
        </div>
        <div>
          <dt className="font-medium text-[var(--journal-muted)]">Submission Type</dt>
          <dd>{SUBMISSION_PURPOSE_LABELS[submission.submissionPurpose]}</dd>
        </div>
      </dl>
      <p className="text-sm text-[var(--journal-body)]">
        <span className="font-medium">Abstract:</span> {submission.abstract}
      </p>
      <p className="mt-2 text-sm text-[var(--journal-muted)]">
        Submit for: {SUBMISSION_PURPOSE_LABELS[submission.submissionPurpose]} · Category:{" "}
        {submission.category}
        {formatConferenceSubmissionMeta(submission)
          ? ` · ${formatConferenceSubmissionMeta(submission)}`
          : ""}
      </p>
      <p className="mt-1 text-sm text-[var(--journal-muted)]">
        Author email: {submission.authorEmail}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Assign editor
          </label>
          <select
            value={selectedEditorId}
            onChange={(e) => setSelectedEditorId(e.target.value)}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          >
            <option value="">— Unassigned —</option>
            {editors.map((ed) => (
              <option key={ed.uid} value={ed.uid}>
                {ed.displayName || ed.email}
                {ed.assignedCategories?.length
                  ? ` (${ed.assignedCategories.join(", ")})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Assign peer reviewer
          </label>
          <select
            value={selectedReviewerId}
            onChange={(e) => {
              setSelectedReviewerId(e.target.value);
              setEmailMsg("");
            }}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          >
            <option value="">— Unassigned —</option>
            {reviewerOptions.map((rev) => (
              <option key={rev.uid} value={rev.uid}>
                {rev.displayName || rev.email}
                {rev.role !== "reviewer" ? ` (${rev.role})` : ""}
              </option>
            ))}
          </select>
          <label className="mt-3 block text-xs font-medium text-[var(--journal-muted)]">
            Review deadline
          </label>
          <input
            type="date"
            value={reviewDeadline}
            onChange={(e) => setReviewDeadline(e.target.value)}
            disabled={!selectedReviewerId}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none disabled:bg-zinc-100"
          />
          {reviewerOptions.length === 0 ? (
            <p className="mt-2 text-xs text-amber-800">
              No reviewers yet. Open the <strong>Users</strong> tab and set a user&apos;s role to{" "}
              <strong>Reviewer</strong>, then return here.
            </p>
          ) : (
            <p className="mt-1 text-xs text-[var(--journal-muted)]">
              Reviewer identity is visible only to admin and the assigned reviewer.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--journal-muted)]">
            Update status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SubmissionStatus)}
            className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <label className="block text-xs font-medium text-[var(--journal-muted)]">
          Status note (visible to author)
        </label>
        <input
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          placeholder="Optional note…"
          className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
        />
      </div>
      <button
        type="button"
        disabled={saving}
        onClick={handleSave}
        className="mt-4 rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>

      {selectedReviewerId ? (
        <div className="mt-6 rounded-lg border border-[var(--journal-border)] bg-white p-4">
          <p className="text-sm font-medium text-[var(--journal-heading)]">
            Peer review invitation email
          </p>
          <p className="mt-1 text-xs text-[var(--journal-muted)]">
            Sends the Registration ID, paper title, submission date, submission type, current
            status, abstract, category, and reviewer-dashboard link. Author identity is not
            included.
          </p>
          {reviewerPendingSave ? (
            <p className="mt-2 text-xs text-amber-800">
              You can save first or send now — sending will save the reviewer assignment automatically.
            </p>
          ) : null}
          <button
            type="button"
            disabled={emailSending || saving}
            onClick={handleSendReviewerEmail}
            className="mt-3 rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
          >
            {emailSending ? "Sending…" : "Send invitation email to reviewer"}
          </button>
          {emailMsg ? (
            <p
              className={`mt-3 text-sm ${emailMsg.includes("sent") ? "text-emerald-700" : "text-red-600"}`}
              role="status"
            >
              {emailMsg}
            </p>
          ) : null}
        </div>
      ) : null}

      <SubmissionTimeline submission={submission} />
      <CommentThread
        submissionId={submission.id}
        currentUserId={adminProfile.uid}
        currentUserName={adminProfile.displayName || adminProfile.email}
        currentUserRole="admin"
        canComment={true}
      />
    </div>
  );
}

/* ── Users panel ── */
function UsersPanel({
  users,
  onUpdate,
}: {
  users: UserProfile[];
  onUpdate: () => void;
}) {
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserProfile["role"]>("scholar");
  const [saving, setSaving] = useState(false);

  async function handleRoleChange(uid: string) {
    setSaving(true);
    try {
      await setUserRole(uid, newRole);
      onUpdate();
      setEditingUid(null);
    } finally {
      setSaving(false);
    }
  }

  const rolePill: Record<string, string> = {
    scholar: "bg-zinc-100 text-zinc-700",
    editor: "bg-blue-50 text-blue-700",
    reviewer: "bg-teal-50 text-teal-700",
    admin: "bg-purple-50 text-purple-700",
  };

  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        All Users
      </h2>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--journal-border)] text-left text-xs font-medium uppercase tracking-wider text-[var(--journal-muted)]">
              <th className="pb-3 pr-4">Name</th>
              <th className="pb-3 pr-4">Email</th>
              <th className="pb-3 pr-4">Role</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--journal-border)]">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="py-3 pr-4 font-medium text-[var(--journal-heading)]">
                  {u.displayName || "—"}
                </td>
                <td className="py-3 pr-4 text-[var(--journal-muted)]">{u.email}</td>
                <td className="py-3 pr-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${rolePill[u.role] ?? ""}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3">
                  {editingUid === u.uid ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newRole}
                        onChange={(e) =>
                          setNewRole(e.target.value as UserProfile["role"])
                        }
                        className="rounded border border-[var(--journal-border)] px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="scholar">Scholar</option>
                        <option value="editor">Editor</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => handleRoleChange(u.uid)}
                        className="text-xs font-medium text-[var(--journal-accent)] hover:underline disabled:opacity-50"
                      >
                        {saving ? "Saving…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUid(null)}
                        className="text-xs text-[var(--journal-muted)] hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUid(u.uid);
                        setNewRole(u.role);
                      }}
                      className="text-xs text-[var(--journal-accent)] hover:underline"
                    >
                      Change role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Editors panel ── */
function EditorsPanel({
  editors,
  onUpdate,
}: {
  editors: UserProfile[];
  onUpdate: () => void;
}) {
  const [searchEmail, setSearchEmail] = useState("");
  const [foundUser, setFoundUser] = useState<UserProfile | null | "not_found">(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [msg, setMsg] = useState("");

  // Edit existing editor categories
  const [editingUid, setEditingUid] = useState<string | null>(null);
  const [editCategories, setEditCategories] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleSearch() {
    if (!searchEmail.trim()) return;
    setSearching(true);
    setFoundUser(null);
    setMsg("");
    try {
      const user = await findUserByEmail(searchEmail.trim().toLowerCase());
      setFoundUser(user ?? "not_found");
      if (user) setSelectedCategories(user.assignedCategories ?? []);
    } finally {
      setSearching(false);
    }
  }

  async function handlePromote() {
    if (!foundUser || foundUser === "not_found") return;
    setPromoting(true);
    setMsg("");
    try {
      await setUserRole(foundUser.uid, "editor", selectedCategories);
      setMsg(`${foundUser.displayName || foundUser.email} is now an editor.`);
      setFoundUser(null);
      setSearchEmail("");
      setSelectedCategories([]);
      onUpdate();
    } finally {
      setPromoting(false);
    }
  }

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function handleSaveCategories(uid: string) {
    setSavingEdit(true);
    try {
      await setUserRole(uid, "editor", editCategories);
      onUpdate();
      setEditingUid(null);
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div>
      <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
        Editor Management
      </h2>

      {/* Existing editors */}
      {editors.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
            Current Editors
          </h3>
          <ul className="mt-3 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
            {editors.map((ed) => (
              <li key={ed.uid} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-[var(--journal-heading)]">
                      {ed.displayName || "—"}
                    </p>
                    <p className="text-sm text-[var(--journal-muted)]">{ed.email}</p>
                    {editingUid !== ed.uid && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {(ed.assignedCategories ?? []).length === 0 ? (
                          <span className="text-xs text-[var(--journal-muted)]">
                            No categories assigned
                          </span>
                        ) : (
                          (ed.assignedCategories ?? []).map((c) => (
                            <span
                              key={c}
                              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-700"
                            >
                              {c}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUid(ed.uid);
                      setEditCategories(ed.assignedCategories ?? []);
                    }}
                    className="text-sm text-[var(--journal-accent)] hover:underline"
                  >
                    Edit categories
                  </button>
                </div>
                {editingUid === ed.uid && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-[var(--journal-muted)]">
                      Select categories:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {RESEARCH_CATEGORIES.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() =>
                            setEditCategories((prev) =>
                              prev.includes(c)
                                ? prev.filter((x) => x !== c)
                                : [...prev, c]
                            )
                          }
                          className={`rounded-full border px-3 py-1 text-xs transition ${
                            editCategories.includes(c)
                              ? "border-[var(--journal-accent)] bg-[var(--journal-accent)] text-white"
                              : "border-[var(--journal-border)] text-[var(--journal-muted)]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        disabled={savingEdit}
                        onClick={() => handleSaveCategories(ed.uid)}
                        className="rounded bg-[var(--journal-accent)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUid(null)}
                        className="text-sm text-[var(--journal-muted)] hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add new editor */}
      <div className="mt-8 rounded-lg border border-[var(--journal-border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--journal-heading)]">
          Assign Editor Role to a User
        </h3>
        <p className="mt-1 text-sm text-[var(--journal-muted)]">
          Enter the email of a registered user to assign them the editor role and select their review categories.
        </p>
        {msg && (
          <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            {msg}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <input
            type="email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="user@example.com"
            className="flex-1 rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            type="button"
            disabled={searching || !searchEmail.trim()}
            onClick={handleSearch}
            className="rounded border border-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-[var(--journal-accent)] hover:bg-[var(--journal-accent)] hover:text-white disabled:opacity-50 transition"
          >
            {searching ? "Searching…" : "Find user"}
          </button>
        </div>

        {foundUser === "not_found" && (
          <p className="mt-3 text-sm text-red-600">
            No user found with that email. They must register first.
          </p>
        )}

        {foundUser && foundUser !== "not_found" && (
          <div className="mt-4">
            <div className="rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-4">
              <p className="text-sm font-medium text-[var(--journal-heading)]">
                {foundUser.displayName || "—"}{" "}
                <span className="font-normal text-[var(--journal-muted)]">
                  ({foundUser.email})
                </span>
              </p>
              <p className="text-xs text-[var(--journal-muted)]">
                Current role: <span className="capitalize">{foundUser.role}</span>
              </p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-[var(--journal-muted)]">
                Assign categories:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {RESEARCH_CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      selectedCategories.includes(c)
                        ? "border-[var(--journal-accent)] bg-[var(--journal-accent)] text-white"
                        : "border-[var(--journal-border)] text-[var(--journal-muted)]"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={promoting || selectedCategories.length === 0}
              onClick={handlePromote}
              className="mt-4 rounded bg-[var(--journal-accent)] px-5 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
            >
              {promoting ? "Assigning…" : "Assign editor role"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
