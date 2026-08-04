"use client";

import { useEffect, useState } from "react";
import { addComment, getComments } from "@/lib/firestore-submissions";
import type { Comment, UserRole } from "@/types/dashboard";

function formatDate(value: Comment["createdAt"]): string {
  if (!value) return "";
  const d = value instanceof Date ? value : (value as { toDate(): Date }).toDate();
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const rolePill: Record<UserRole, string> = {
  scholar: "bg-zinc-100 text-zinc-600",
  editor: "bg-blue-50 text-blue-700",
  reviewer: "bg-teal-50 text-teal-700",
  admin: "bg-purple-50 text-purple-700",
};

type Props = {
  submissionId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  canComment: boolean;
};

export function CommentThread({
  submissionId,
  currentUserId,
  currentUserName,
  currentUserRole,
  canComment,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getComments(submissionId).then((c) => {
      if (!cancelled) setComments(c);
    });
    return () => { cancelled = true; };
  }, [submissionId]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await addComment(submissionId, {
        text: text.trim(),
        authorId: currentUserId,
        authorName: currentUserName,
        authorRole: currentUserRole,
      });
      const updated = await getComments(submissionId);
      setComments(updated);
      setText("");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-[var(--journal-heading)]">
        Comments
      </h4>
      {comments.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--journal-muted)]">No comments yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-[var(--journal-border)] bg-zinc-50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--journal-muted)]">
                <span className="font-medium text-[var(--journal-heading)]">{c.authorName}</span>
                <span className={`rounded-full px-2 py-0.5 capitalize ${rolePill[c.authorRole]}`}>
                  {c.authorRole}
                </span>
                <span>{formatDate(c.createdAt)}</span>
              </div>
              <p className="mt-1.5 text-sm text-[var(--journal-body)]">{c.text}</p>
            </li>
          ))}
        </ul>
      )}
      {canComment && (
        <div className="mt-4 flex gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={2}
            placeholder="Add a comment visible to the author, editors, and admin…"
            className="flex-1 rounded border border-[var(--journal-border)] px-3 py-2 text-sm focus:border-[var(--journal-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--journal-accent)]"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="self-end rounded bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}
