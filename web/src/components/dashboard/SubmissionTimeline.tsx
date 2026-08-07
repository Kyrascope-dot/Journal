"use client";

import { useEffect, useState } from "react";
import { getSubmissionStatusHistory } from "@/lib/firestore-submissions";
import {
  getSubmissionStatusLabel,
  type Submission,
  type SubmissionStatusEvent,
} from "@/types/dashboard";

function formatDateTime(value: SubmissionStatusEvent["createdAt"]): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function SubmissionTimeline({ submission }: { submission: Submission }) {
  const [events, setEvents] = useState<SubmissionStatusEvent[]>([]);

  useEffect(() => {
    let cancelled = false;
    getSubmissionStatusHistory(submission.id)
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [submission.id, submission.status, submission.lastUpdatedAt]);

  const displayed =
    events.length > 0
      ? events
      : [
          {
            id: "current",
            registrationId: submission.registrationId,
            status: submission.status,
            note: submission.statusNote,
            createdAt: submission.lastUpdatedAt ?? submission.submittedAt,
            changedByName: "",
            changedByRole: "editor" as const,
          },
        ];

  return (
    <section className="mt-6" aria-labelledby={`timeline-${submission.id}`}>
      <h3
        id={`timeline-${submission.id}`}
        className="text-sm font-semibold text-[var(--journal-heading)]"
      >
        Status timeline — {submission.registrationId}
      </h3>
      <ol className="mt-3 border-l-2 border-[var(--journal-border)] pl-5">
        {displayed.map((event) => (
          <li key={event.id} className="relative pb-5 last:pb-0">
            <span
              className="absolute -left-[1.65rem] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-[var(--journal-accent)] text-[8px] text-white"
              aria-hidden
            >
              ✓
            </span>
            <p className="text-sm font-medium text-[var(--journal-heading)]">
              ✓ {getSubmissionStatusLabel(event.status, submission.submissionPurpose)}
            </p>
            <p className="text-xs text-[var(--journal-muted)]">
              {formatDateTime(event.createdAt)}
            </p>
            {event.note ? (
              <p className="mt-1 text-sm text-[var(--journal-body)]">{event.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
