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
  getSubmissionStatusLabel,
} from "@/types/dashboard";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { CommentThread } from "@/components/dashboard/CommentThread";
import { SubmissionTimeline } from "@/components/dashboard/SubmissionTimeline";
import {
  bestPaperAwardPolicyNote,
  bestPaperAwardPolicyParagraphs,
} from "@/lib/conference-content";
import { siteConfig } from "@/lib/site-config";

const ABSTRACT_SUCCESS_HEADING = "Abstract received";

const BEST_PAPER_AWARD_NOTE = bestPaperAwardPolicyParagraphs.join(" ");

const BEST_PRESENTER_NOTE =
  "In this category you may present your paper at the GCR conference via PowerPoint (PPT). This track does not include publication in Global Confluence Review (GCR). Authors whose work is already published in another journal, or is under consideration elsewhere, may present at the GCR conference but will not receive GCR journal publication through this category.";

const BEST_PRESENTER_SUBMISSION_NOTE =
  "Under the Best Presenter category, you do not need to submit a full paper to GCR. You only need to present your research paper through a PowerPoint (PPT) presentation at the conference.";

function ManuscriptEmailInstructions({ className = "" }: { className?: string }) {
  return (
    <div className={`leading-relaxed ${className}`}>
      <p>Authors must submit a blinded manuscript and a separate title page in Word format.</p>
      <p className="mt-2">
        Email:{" "}
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
        >
          {siteConfig.email}
        </a>
      </p>
      <p className="mt-2">
        The blinded manuscript must not contain author names, affiliations, acknowledgements or
        identifying information.
      </p>
      <p className="mt-2">
        The separate title page must include the paper title, author(s), affiliation, ORCID
        (optional), email, and corresponding author.
      </p>
    </div>
  );
}

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
  const [authorName, setAuthorName] = useState(profile.displayName || profile.email);
  const [coAuthors, setCoAuthors] = useState<string[]>([""]);
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
  const [lastSubmittedAwardIntent, setLastSubmittedAwardIntent] =
    useState<ConferenceAwardIntent | null>(null);
  const [lastSubmission, setLastSubmission] = useState<{
    id: string;
    registrationId: string;
    emailSent: boolean;
  } | null>(null);

  useEffect(() => {
    getSubmissionsByAuthor(profile.uid).then((s) => {
      setSubmissions(
        s.map((sub) => submissionForViewer(sub, "scholar", profile.uid))
      );
      setLoadingSubs(false);
    });
  }, [profile.uid]);

  useEffect(() => {
    setAuthorName((current) => current || profile.displayName || profile.email);
  }, [profile.displayName, profile.email]);

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
    const cleanedAuthorName = authorName.trim();
    const coAuthorPairs: [string, string][] = coAuthors
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => [name.toLowerCase(), name]);
    const cleanedCoAuthors = Array.from(new Map(coAuthorPairs).values());
    if (!cleanedAuthorName) {
      setSubmitMsg("Please enter the primary author name before submitting.");
      return;
    }
    if (!title.trim() || !abstract.trim()) return;
    const resolvedAffiliation = (affiliation || profile.affiliation || "").trim();
    if (!resolvedAffiliation) {
      setSubmitMsg("Please enter your affiliation before submitting.");
      return;
    }
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
      const created = await createSubmission({
        title: title.trim(),
        abstract: abstract.trim(),
        affiliation: resolvedAffiliation,
        category,
        submissionPurpose,
        conferenceQuarter:
          submissionPurpose === "conference" ? (conferenceQuarter as ConferenceQuarter) : null,
        conferenceAwardIntent:
          submissionPurpose === "conference"
            ? (conferenceAwardIntent as ConferenceAwardIntent)
            : null,
        authorId: profile.uid,
        authorName: cleanedAuthorName,
        coAuthors: cleanedCoAuthors,
        authorEmail: profile.email,
      });
      setLastSubmission({
        id: created.submissionId,
        registrationId: created.registrationId,
        emailSent: created.emailSent,
      });
      setTitle("");
      setAbstract("");
      setAuthorName(profile.displayName || profile.email);
      setCoAuthors([""]);
      setCategory(RESEARCH_CATEGORIES[0]);
      setLastSubmittedAwardIntent(
        submissionPurpose === "conference"
          ? (conferenceAwardIntent as ConferenceAwardIntent)
          : null
      );
      setSubmissionPurpose("journal");
      setConferenceQuarter("");
      setConferenceAwardIntent("");
      setSubmitMsg("");
      setShowManuscriptNotice(true);
      const updated = await getSubmissionsByAuthor(profile.uid);
      setSubmissions(
        updated.map((sub) => submissionForViewer(sub, "scholar", profile.uid))
      );
      setTab("submissions");
    } catch (error) {
      setSubmitMsg(
        error instanceof Error ? error.message : "Submission failed. Please try again."
      );
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
            {lastSubmission ? (
              <div className="mt-3 rounded border border-emerald-300 bg-white/70 p-3">
                <p className="font-semibold text-emerald-950">
                  Registration ID: {lastSubmission.registrationId}
                </p>
                <p className="mt-1 text-xs text-emerald-800">
                  Your submission is saved. Keep this Registration ID for all future
                  correspondence
                  {lastSubmission.emailSent
                    ? ". A confirmation email has been sent."
                    : ". A confirmation email will follow if email delivery is available."}
                </p>
                <Link
                  href={`/dashboard/acknowledgement/${lastSubmission.id}`}
                  className="mt-2 inline-block font-medium text-[var(--journal-accent)] underline"
                >
                  View acknowledgement receipt
                </Link>
              </div>
            ) : null}
            {lastSubmittedAwardIntent === "best_presenter" ? (
              <p className="mt-2 leading-relaxed text-emerald-950">
                {BEST_PRESENTER_SUBMISSION_NOTE}
              </p>
            ) : (
              <ManuscriptEmailInstructions className="mt-2 text-emerald-950" />
            )}
            <p className="mt-2 text-emerald-800">
              You can track your abstract under My Submissions.
            </p>
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
                        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--journal-accent)]">
                          <span>Registration ID: {sub.registrationId}</span>
                          <button
                            type="button"
                            onClick={() =>
                              void navigator.clipboard.writeText(sub.registrationId)
                            }
                            className="rounded border border-[var(--journal-border)] bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
                          >
                            Copy
                          </button>
                        </p>
                        <p className="mt-1 font-medium text-[var(--journal-heading)]">
                          Paper Title: {sub.title}
                        </p>
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
                          {expandedId === sub.id ? "Hide" : "View details"}
                        </button>
                      </div>
                    </div>
                    {expandedId === sub.id && (
                      <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-4">
                        <p className="text-sm text-[var(--journal-body)]">
                          <span className="font-medium">Abstract:</span> {sub.abstract}
                        </p>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-medium text-[var(--journal-muted)]">
                              Registration ID
                            </dt>
                            <dd>{sub.registrationId}</dd>
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
                          <div>
                            <dt className="font-medium text-[var(--journal-muted)]">
                              Author
                            </dt>
                            <dd>{sub.authorName || "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-medium text-[var(--journal-muted)]">
                              Co-Authors
                            </dt>
                            <dd>
                              {sub.coAuthors.length ? sub.coAuthors.join(", ") : "None"}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          href={`/dashboard/acknowledgement/${sub.id}`}
                          className="mt-4 inline-block text-sm font-medium text-[var(--journal-accent)] underline"
                        >
                          View acknowledgement receipt
                        </Link>
                        <SubmissionTimeline submission={sub} />
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
              Choose journal publication or conference, complete the same abstract form, then email
              the full paper in Word to the editorial address shown below.
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
                <fieldset>
                  <legend className="block text-sm font-medium text-[var(--journal-heading)]">
                    Submission type <span className="text-red-500">*</span>
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
                  <p className="rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm text-[var(--journal-body)]">
                    Please read the{" "}
                    <Link
                      href="/conferences/faqs"
                      className="font-medium text-[var(--journal-accent)] underline"
                    >
                      Conference FAQ
                    </Link>{" "}
                    before submitting your abstract.
                  </p>
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
                          For{" "}
                          {
                            CONFERENCE_QUARTER_OPTIONS.find((q) => q.value === conferenceQuarter)
                              ?.label
                          }
                        </p>
                        <p className="mt-3 text-xs leading-relaxed text-[var(--journal-muted)]">
                          Separate awards may be presented for different academic levels and
                          research methodologies depending upon the number and quality of
                          submissions. Final decisions rest with the Conference Evaluation
                          Committee.
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
                        {conferenceAwardIntent === "best_presenter" && (
                          <div className="mt-4 rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3">
                            <p className="text-sm leading-relaxed text-[var(--journal-body)]">
                              {BEST_PRESENTER_NOTE}
                            </p>
                          </div>
                        )}
                        {conferenceShowsPaperSubmission(conferenceAwardIntent) && (
                          <div className="mt-4 rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3">
                            <p className="text-sm leading-relaxed text-[var(--journal-body)]">
                              {BEST_PAPER_AWARD_NOTE}{" "}
                              <span className="font-medium">{bestPaperAwardPolicyNote}</span>{" "}
                              <Link
                                href="/for-authors/manuscript-templates"
                                className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                              >
                                Manuscript templates
                              </Link>
                              {" · "}
                              <Link
                                href="/conferences/faqs"
                                className="font-medium text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/40 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                              >
                                Conference FAQs
                              </Link>
                              .
                            </p>
                          </div>
                        )}
                        {conferenceAwardIntent === "both" && (
                          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
                            <p className="text-sm leading-relaxed text-amber-950">
                              <span className="font-medium">Best Presenter:</span> {BEST_PRESENTER_NOTE}
                            </p>
                          </div>
                        )}
                      </fieldset>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Author Name <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Co-Authors (Optional)
                </label>
                <p className="mt-1 text-xs text-[var(--journal-muted)]">
                  Add the names of any co-authors who contributed to this work. Leave blank if
                  there are no co-authors.
                </p>
                <div className="mt-2 space-y-2">
                  {coAuthors.map((name, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={name}
                        onChange={(e) =>
                          setCoAuthors((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index ? e.target.value : item
                            )
                          )
                        }
                        placeholder="Co-Author Name"
                        className="w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCoAuthors((current) =>
                            current.length === 1
                              ? [""]
                              : current.filter((_, itemIndex) => itemIndex !== index)
                          )
                        }
                        className="shrink-0 rounded border border-[var(--journal-border)] px-3 py-2 text-sm text-[var(--journal-muted)] hover:text-[var(--journal-heading)]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCoAuthors((current) => [...current, ""])}
                  className="mt-2 rounded border border-[var(--journal-accent)] px-3 py-1.5 text-sm font-medium text-[var(--journal-accent)]"
                >
                  + Add Co-Author
                </button>
              </div>
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
                <label className="block text-sm font-medium text-[var(--journal-heading)]">
                  Research category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
                >
                  {RESEARCH_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
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
              {submissionPurpose === "conference" &&
              conferenceAwardIntent === "best_presenter" ? (
                <div className="rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm text-[var(--journal-body)]">
                  <p className="font-medium text-[var(--journal-heading)]">
                    Best Presenter submission
                  </p>
                  <p className="mt-1">{BEST_PRESENTER_SUBMISSION_NOTE}</p>
                </div>
              ) : (
                <div className="rounded-md border border-[var(--journal-border)] bg-zinc-50 px-4 py-3 text-sm text-[var(--journal-body)]">
                  <p className="font-medium text-[var(--journal-heading)]">
                    Manuscript files (Word)
                  </p>
                  <p className="mt-1">
                    Step 1: Submit your abstract using the button below. Step 2: Email the blinded
                    manuscript and separate title page to the editorial team.
                  </p>
                  <ManuscriptEmailInstructions className="mt-2 text-[var(--journal-muted)]" />
                </div>
              )}
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
