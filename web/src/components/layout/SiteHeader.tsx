"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

const aboutLinks = [
  { href: "/about/journal", label: "About the Journal" },
  { href: "/about/peer-review", label: "Peer Review Process" },
  { href: "/about/ethics", label: "Publication Ethics" },
  { href: "/about/open-access", label: "Open Access Policy" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--journal-border)] bg-white/95 shadow-sm backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[var(--journal-accent)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className={`${contentShell} flex items-center justify-between gap-4 py-3`}>
        <Link href="/" className="flex shrink-0 items-center" aria-label={siteConfig.name}>
          <Image
            src="/GCR_logo.jpg"
            alt={siteConfig.name}
            width={220}
            height={77}
            className="h-14 w-auto object-contain sm:h-16"
            priority
          />
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-zinc-300 p-2 text-zinc-700 lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <nav className="hidden lg:block" aria-label="Primary">
          <ul className="flex flex-wrap items-center gap-1 text-sm">
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/">
                Home
              </Link>
            </li>
            <li className="group relative">
              <button
                type="button"
                className="flex items-center gap-0.5 rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100"
                aria-expanded={false}
                aria-haspopup="true"
              >
                About
                <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>
              <ul className="invisible absolute left-0 top-full z-50 mt-0 min-w-[220px] rounded-md border border-[var(--journal-border)] bg-white py-1 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                {aboutLinks.map((l) => (
                  <li key={l.href}>
                    <Link className="block px-3 py-2 text-sm hover:bg-zinc-50" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/editorial">
                Editorial Team
              </Link>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/articles">
                All Articles
              </Link>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/">
                Current
              </Link>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/issues">
                Archives
              </Link>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/submissions">
                Submissions
              </Link>
            </li>
            <li>
              <Link className="rounded px-2 py-1 text-[var(--journal-body)] hover:bg-zinc-100" href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-[var(--journal-border)] bg-white lg:hidden">
          <ul className="space-y-1 px-4 py-3 text-sm">
            <li>
              <Link href="/" className="block rounded py-2" onClick={() => setOpen(false)}>
                Home
              </Link>
            </li>
            <li className="font-medium text-zinc-500">About</li>
            {aboutLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block rounded py-1.5 pl-3" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}
            {[
              ["/editorial", "Editorial Team"],
              ["/articles", "All Articles"],
              ["/", "Current Issue"],
              ["/issues", "Archives"],
              ["/submissions", "Submissions"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <li key={href + label}>
                <Link href={href} className="block rounded py-2" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
