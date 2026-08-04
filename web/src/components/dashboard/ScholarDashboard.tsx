"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createSubmission,
  getSubmissionsByAuthor,
} from "@/lib/firestore-submissions";
import { submissionForViewer } from "@/lib/dashboard-access";
import { updateScholarProfile } from "@/lib/firestore-users";
import type {
  ConferenceAwardIntent,
  ConferenceQuarter,
  Submission,
  UserProfile,
  SubmissionPurpose,
} from "@/types/dashboard";
import {
  CONFERENCE_AWARD_OPTIONS,
  CONFERENCE_QUARTER_OPTIONS,
  formatConferenceSubmissionMeta,
  RESEARCH_CATEGORIES,
  SUBMISSION_PURPOSE_LABELS,
  SUBMISSION_PURPOSE_OPTIONS,
} from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { siteConfig } from "@/lib/site-config";

const ABSTRACT_SUCCESS_HEADING = "Abstract received";

const BEST_PAPER_GCR_PUBLICATION_NOTE =
  "Winners of the Best Paper Award in their track will be offered a publication opportunity in an upcoming issue of Global Confluence Review (GCR), subject to rigorous journal peer review. After winning, you must submit the full paper using the GCR journal manuscript template; it will then receive full consideration for publication in the upcoming GCR issue.";

function conferenceShowsPaperSubmission(
  award: ConferenceAwardIntent | ""
): award is "best_paper" | "both" {
  return award === "best_paper" || award === "both";
}

function formatDate(value: Submission["submittedAt"]): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

type Tab = "profile" | "submit" | "submissions";

export function ScholarDashboard({
  profile,
  onProfileUpdated,
}: {
  profile: UserProfile;
  onProfileUpdated: () => void;
}) {
  const [tab, setTab] = useState<Tab>("submissions");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Profile form
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [affiliation, setAffiliation] = useState(profile.affiliation ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Submission form
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [category, setCategory] = useState<string>(RESEARCH_CATEGORIES[0]);
  const [submissionPurpose, setSubmissionPurpose] = useState<SubmissionPurpose>("journal");
  const [conferenceQuarter, setConferenceQuarter] = useState<ConferenceQuarter | "">("");
  const [conferenceAwardIntent, setConferenceAwardIntent] =
    useState<ConferenceAwardIntent | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");
  const [showManuscriptNotice, setShowManuscriptNotice] = useState(false);
  const [lastSubmittedPurpose, setLastSubmittedPurpose] =
    useState<SubmissionPurpose>("journal");

  useEffect(() => {
    getSubmissionsByAuthor(profile.uid).then((s) => {
      setSubmissions(
        s.map((sub) => submissionForViewer(sub, "scholar", profile.uid))
      );
      setLoadingSubs(false);
    });
  }, [profile.uid]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateScholarProfile(profile.uid, { displayName, affiliation });
      setProfileMsg("Profile saved successfully.");
      onProfileUpdated();
    } catch {
      setProfileMsg("Failed to save. Please try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !abstract.trim()) return;
    if (submissionPurpose === "conference") {
      if (!conferenceQuarter || !conferenceAwardIntent) {
        setSubmitMsg(
          "For conference submissions, select the issue quarter and your award option."
        );
        return;
      }
    }
    setSubmitting(true);
    setSubmitMsg("");
    try {
      await createSubmission({
        title: title.trim(),
        abstract: abstract.trim(),
        affiliation: affiliation || profile.affiliation || "",
        category,
        submissionPurpose,
        conferenceQuarter:
          submissionPurpose === "conference" ? (conferenceQuarter as ConferenceQuarter) : null,
        conferenceAwardIntent:
          submissionPurpose === "conference"
            ? (conferenceAwardIntent as ConferenceAwardIntent)
            : null,
        authorId: profile.uid,
        authorName: profile.displayName || profile.email,
        authorEmail: profile.email,
      });
      setTitle("");
      setAbstract("");
      setCategory(RESEARCH_CATEGORIES[0]);
      setSubmissionPurpose("journal");
      setConferenceQuarter("");
      setConferenceAwardIntent("");
      setSubmitMsg("");
      setLastSubmittedPurpose(submissionPurpose);
      setShowManuscriptNotice(true);
      const updated = await getSubmissionsByAuthor(profile.uid);
      setSubmissions(
        updated.map((sub) => submissionForViewer(sub, "scholar", profile.uid))
      );
      setTab("submissions");
    } catch {
      setSubmitMsg("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "submissions", label: `My Submissions (${submissions.length})` },
    { key: "submit", label: "New Submission" },
    { key: "profile", label: "My Profile" },
  ];

  return (
    <div>
      <div className="border-b border-[var(--journal-border)]">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1" aria-label="Tabs">
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
        {showManuscriptNotice && (
          <div
            className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-950"
            role="status"
          >
            <p className="font-serif text-base font-semibold text-emerald-900">
              {ABSTRACT_SUCCESS_HEADING}
            </p>
            {lastSubmittedPurpose === "journal" ? (
              <>
                <p className="mt-2 leading-relaxed">
                  Please submit the full manuscript in Word format to{" "}
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                  >
                    {siteConfig.email}
                  </a>
                  .
                </p>
                <p className="mt-2 text-emerald-800">
                  You can track your abstract below. Include your name, submission title, and
                  affiliation in the email.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 leading-relaxed">
                  Your abstract is recorded for a <strong>conference</strong> submission. For
                  full paper guidelines, registration, and deadlines, see{" "}
                  <Link
                    href="/conferences/submit-paper"
                    className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                  >
                    conference paper submission
                  </Link>
                  .
                </p>
                <p className="mt-2 text-emerald-800">
                  You can track this abstract below. The editorial team may contact you about the
                  relevant GCR conference.
                </p>
              </>
            )}
            <button
              type="button"
              onClick={() => setShowManuscriptNotice(false)}
              className="mt-3 text-xs font-medium uppercase tracking-wide text-emerald-800 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* MY SUBMISSIONS */}
        {tab === "submissions" && (
          <div>
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              My Submissions
            </h2>
            {loadingSubs ? (
              <div className="mt-6 space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-100" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <div className="mt-8 text-center">
                <p className="text-[var(--journal-muted)]">No submissions yet.</p>
                <button
                  type="button"
                  onClick={() => setTab("submit")}
                  className="mt-4 rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  Submit
                </button>
              </div>
            ) : (
              <ul className="mt-6 divide-y divide-[var(--journal-border)] border-y border-[var(--journal-border)]">
                {submissions.map((sub) => {
                  const conferenceMeta = formatConferenceSubmissionMeta(sub);
                  return (
                  <li key={sub.id} className="py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--journal-heading)]">{sub.title}</p>
                        <p className="mt-1 text-sm text-[var(--journal-muted)]">
                          {SUBMISSION_PURPOSE_LABELS[sub.submissionPurpose]}
                          {conferenceMeta ? ` · ${conferenceMeta}` : ""} · {sub.category} ·
                          Submitted {formatDate(sub.submittedAt)}
                        </p>
                        {sub.statusNote && (
                          <p className="mt-1 text-sm italic text-[var(--journal-muted)]">
                            Note: {sub.statusNote}
                          </p>
                        )}
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
                          {expandedId === sub.id ? "Hide" : "View details"}
                        </button>
                      </div>
                    </div>
                    {expandedId === sub.id && (
                      <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-4">
                        <p className="text-sm text-[var(--journal-body)]">
                          <span className="font-medium">Abstract:</span> {sub.abstract}
                        </p>
                        <CommentThread
                          submissionId={sub.id}
                          currentUserId={profile.uid}
                          currentUserName={profile.displayName || profile.email}
                          currentUserRole="scholar"
                          canComment={false}
                        />
                      </div>
                    )}
                  </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* NEW SUBMISSION */}
        {tab === "submit" && (
          <div className="max-w-2xl">
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              New Submission
            </h2>
            <p className="mt-2 text-sm text-[var(--journal-muted)]">
              Submit your abstract here after signing in. Choose whether you are submitting to the
              journal or a GCR conference. Editors will review it; follow the instructions shown
              after submission.
            </p>
            {submitMsg && (
              <div className={`mt-4 rounded-md border px-4 py-3 text-sm ${
                submitMsg.includes("received")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {submitMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Paper title <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Abstract <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="200–300 words recommended"
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-[var(--journal-heading)]">
                    Submit for <span className="text-red-500">*</span>
                  </legend>
                  <div className="mt-2 space-y-2">
                    {SUBMISSION_PURPOSE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className="flex cursor-pointer items-start gap-2 text-sm text-[var(--journal-body)]"
                      >
                        <input
                          type="radio"
                          name="submissionPurpose"
                          value={opt.value}
                          checked={submissionPurpose === opt.value}
                          onChange={() => {
                            setSubmissionPurpose(opt.value);
                            if (opt.value === "journal") {
                              setConferenceQuarter("");
                              setConferenceAwardIntent("");
                            }
                          }}
                          className="mt-0.5 border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
              {submissionPurpose === "conference" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--journal-heading)]">
                      Conference issue quarter <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={conferenceQuarter}
                      onChange={(e) => {
                        const value = e.target.value as ConferenceQuarter | "";
                        setConferenceQuarter(value);
                        if (!value) setConferenceAwardIntent("");
                      }}
                      className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                    >
                      <option value="">Select quarter</option>
                      {CONFERENCE_QUARTER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {conferenceQuarter && (
                    <div>
                      <fieldset>
                        <legend className="block text-sm font-medium text-[var(--journal-heading)]">
                          Award nomination <span className="text-red-500">*</span>
                        </legend>
                        <p className="mt-1 text-xs text-[var(--journal-muted)]">
                          For {CONFERENCE_QUARTER_OPTIONS.find((q) => q.value === conferenceQuarter)?.label}
                        </p>
                        <div className="mt-2 space-y-2">
                          {CONFERENCE_AWARD_OPTIONS.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex cursor-pointer items-start gap-2 text-sm text-[var(--journal-body)]"
                            >
                              <input
                                type="radio"
                                name="conferenceAwardIntent"
                                value={opt.value}
                                checked={conferenceAwardIntent === opt.value}
                                onChange={() => setConferenceAwardIntent(opt.value)}
                                className="mt-0.5 border-[var(--journal-border)] text-[var(--journal-accent)] focus:ring-[var(--journal-accent)]"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                        {conferenceShowsPaperSubmission(conferenceAwardIntent) && (
                          <div className="mt-4 rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3">
                            <p className="text-sm leading-relaxed text-[var(--journal-body)]">
                              {BEST_PAPER_GCR_PUBLICATION_NOTE}{" "}
                              <Link
                                href="/for-authors/manuscript-templates"
                                className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                              >
                                Journal manuscript templates
                              </Link>
                              .
                            </p>
                            <Link
                              href="/conferences/submit-paper"
                              className="mt-3 inline-flex rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                            >
                              Submission for paper
                            </Link>
                          </div>
                        )}
                      </fieldset>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Research category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                >
                  {RESEARCH_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Affiliation <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="University / Institution"
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-[var(--journal-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit abstract"}
              </button>
            </form>
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div className="max-w-md">
            <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
              My Profile
            </h2>
            {profileMsg && (
              <div className={`mt-4 rounded-md border px-4 py-3 text-sm ${
                profileMsg.includes("success")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}>
                {profileMsg}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Email (read-only)
                </label>
                <input
                  readOnly
                  value={profile.email}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] bg-zinc-50 px-3 py-2 text-sm text-[var(--journal-muted)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Full name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Affiliation
                </label>
                <input
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  placeholder="University / Institution"
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded bg-[var(--journal-accent)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-95 disabled:opacity-60"
              >
                {savingProfile ? "Saving…" : "Save profile"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
