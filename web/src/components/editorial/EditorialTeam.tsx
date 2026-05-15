"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  editorialTeam,
  PLACEHOLDER,
  type EditorialMember,
} from "@/data/editorial";

function MetaBlock({ member }: { member: EditorialMember }) {
  return (
    <div className="space-y-3 text-sm">
      <p className="leading-relaxed text-[var(--journal-muted)]">{member.qualification}</p>
      {member.designation ? (
        <p className="whitespace-pre-line leading-relaxed text-[var(--journal-body)]">
          {member.designation}
        </p>
      ) : null}
      {member.emails?.length ? (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-heading)]">
            Email
          </p>
          <ul className="space-y-1">
            {member.emails.map((email) => (
              <li key={email}>
                <a
                  className="break-all text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/30 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {(member.facultyUrl || member.scholarUrl) ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--journal-heading)]">
            Profiles
          </p>
          <ul className="space-y-2">
            {member.facultyUrl ? (
              <li>
                <a
                  href={member.facultyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-wrap items-center gap-1.5 text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/30 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                >
                  {member.facultyUrlLabel ?? "Institutional page"}
                  <span className="text-xs font-normal text-[var(--journal-muted)]">(new tab)</span>
                  <svg className="h-3.5 w-3.5 shrink-0 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M11 3a1 1 0 100 2h2.586L8.293 10.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </li>
            ) : null}
            {member.scholarUrl ? (
              <li>
                <a
                  href={member.scholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-wrap items-center gap-1.5 text-[var(--journal-accent)] underline decoration-[var(--journal-accent)]/30 underline-offset-2 hover:decoration-[var(--journal-accent)]"
                >
                  Google Scholar
                  <span className="text-xs font-normal text-[var(--journal-muted)]">(new tab)</span>
                  <svg className="h-3.5 w-3.5 shrink-0 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path d="M11 3a1 1 0 100 2h2.586L8.293 10.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function MemberPhoto({
  member,
}: {
  member: Pick<EditorialMember, "name" | "imageSrc">;
}) {
  const initial = member.imageSrc ?? PLACEHOLDER;
  const [src, setSrc] = useState(initial);

  useEffect(() => {
    setSrc(member.imageSrc ?? PLACEHOLDER);
  }, [member.imageSrc]);

  return (
    <div className="flex justify-center">
      <Image
        src={src}
        alt={member.name}
        width={160}
        height={160}
        className="h-40 w-40 rounded-full border-2 border-[var(--journal-border)] bg-zinc-100 object-cover"
        onError={() => setSrc(PLACEHOLDER)}
        priority={false}
      />
    </div>
  );
}

function BioModal({
  member,
  onClose,
}: {
  member: EditorialMember;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editorial-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-xl border border-[var(--journal-border)] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--journal-border)] px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1 pr-2">
            <h2
              id="editorial-modal-title"
              className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
            >
              {member.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--journal-accent)]">
              {member.headline}
            </p>
            <div className="mt-4 border-t border-[var(--journal-border)] pt-4">
              <MetaBlock member={member} />
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            {member.bioParagraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorialTeam() {
  const [active, setActive] = useState<EditorialMember | null>(null);
  const close = useCallback(() => setActive(null), []);

  return (
    <>
      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {editorialTeam.map((member) => (
          <article
            key={member.id}
            className="flex h-full flex-col rounded-xl border border-[var(--journal-border)] bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex justify-center border-b border-[var(--journal-border)] pb-5">
              <MemberPhoto member={member} />
            </div>
            <div className="mt-5 text-center">
              <h2 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
                {member.name}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--journal-accent)]">
                {member.headline}
              </p>
            </div>
            <div className="mt-4 min-h-0 flex-1 border-t border-[var(--journal-border)] pt-4 text-left">
              <MetaBlock member={member} />
            </div>
            <button
              type="button"
              onClick={() => setActive(member)}
              className="mt-5 w-full rounded-md border border-[var(--journal-accent)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--journal-accent)] transition hover:bg-[var(--journal-accent)] hover:text-white sm:w-auto sm:self-center"
            >
              Know more
            </button>
          </article>
        ))}
      </div>

      {active ? <BioModal member={active} onClose={close} /> : null}
    </>
  );
}
