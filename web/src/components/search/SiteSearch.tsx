"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchSite, type SiteSearchResult } from "@/lib/site-search";

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function SearchResultsList({
  results,
  onSelect,
  query,
}: {
  results: SiteSearchResult[];
  onSelect: () => void;
  query: string;
}) {
  if (!query.trim()) {
    return (
      <p className="px-1 py-2 text-sm text-[var(--journal-muted)]">
        Search pages, conference information, author guidelines, and editorial board.
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="px-1 py-2 text-sm text-[var(--journal-muted)]">
        No results for &ldquo;{query}&rdquo;.
      </p>
    );
  }

  return (
    <ul className="max-h-72 space-y-1 overflow-y-auto">
      {results.map((result) => (
        <li key={`${result.href}-${result.title}`}>
          <Link
            href={result.href}
            onClick={onSelect}
            className="block rounded-md px-3 py-2 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)]"
          >
            <span className="block text-sm font-medium text-[var(--journal-heading)]">
              {result.title}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--journal-muted)]">
              {result.category} · {result.snippet}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function SiteSearchTrigger({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const results = searchSite(query, 8);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    close();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-md border border-zinc-300 px-2.5 py-2 text-sm text-zinc-700 hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)] ${className}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
      >
        <SearchIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <span className="sr-only sm:not-sr-only sm:hidden">Search site</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-slate-950/50 p-4 pt-[12vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-label="Search the website"
            className="w-full max-w-xl rounded-lg border border-[var(--journal-border)] bg-white p-4 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search GCR…"
                className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[var(--journal-heading)] outline-none placeholder:text-zinc-400"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={close}
                className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100"
              >
                Esc
              </button>
            </form>
            <div className="mt-3 border-t border-[var(--journal-border)] pt-3">
              <SearchResultsList results={results} onSelect={close} query={query} />
            </div>
            {query.trim() ? (
              <p className="mt-3 text-xs text-[var(--journal-muted)]">
                Press Enter for all results, or select a suggestion above.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SiteSearchPageResults({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const results = searchSite(query, 24);

  return (
    <div>
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="sr-only" htmlFor="site-search-input">
          Search
        </label>
        <input
          id="site-search-input"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pages, conferences, authors, editorial board…"
          className="w-full rounded-md border border-[var(--journal-border)] px-3 py-2 text-sm"
        />
      </form>
      <div className="mt-6">
        <SearchResultsList results={results} onSelect={() => undefined} query={query} />
      </div>
    </div>
  );
}
