"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SiteSearchTrigger } from "@/components/search/SiteSearch";
import { mainNavGroups, topLevelNavLinks } from "@/config/site-navigation";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { NavDropdown, NavPlainLink, isActive } from "@/components/navigation/NavDropdown";

export function SiteHeaderBrand() {
  return (
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
  );
}

export function SiteHeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--journal-border)] bg-white/95 shadow-sm backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[var(--journal-accent)] focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className={`${contentShell} relative flex items-center justify-between gap-4 py-3`}>
        {children}
      </div>
    </header>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeMobile = () => setOpen(false);

  return (
    <>
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
      <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
        <SiteSearchTrigger />
        <ul className="flex flex-wrap items-center gap-0.5 text-sm">
          {topLevelNavLinks.map((link) =>
            link.href === "/" ? (
              <li key={link.href}>
                <NavPlainLink link={link} pathname={pathname} />
              </li>
            ) : null
          )}
          {mainNavGroups.map((group) => (
            <NavDropdown key={group.id} group={group} pathname={pathname} />
          ))}
          {topLevelNavLinks.map((link) =>
            link.href !== "/" ? (
              <li key={link.href}>
                <NavPlainLink link={link} pathname={pathname} />
              </li>
            ) : null
          )}
        </ul>
      </nav>
      {open && (
        <div
          id="mobile-nav"
          className="absolute left-0 right-0 top-full z-40 max-h-[80vh] overflow-y-auto border-t border-[var(--journal-border)] bg-white lg:hidden"
        >
          <div className="border-b border-[var(--journal-border)] px-4 py-3">
            <SiteSearchTrigger className="w-full justify-center" />
          </div>
          <ul className="space-y-1 px-4 py-3 text-sm">
            {topLevelNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block rounded py-2 ${isActive(pathname, link.href) ? "font-medium text-[var(--journal-heading)]" : ""}`}
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {mainNavGroups.map((group) => (
              <li key={group.id} className="pt-2">
                <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {group.label}
                </p>
                <ul className="pl-2">
                  {group.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className={`block rounded py-1.5 pl-2 ${isActive(pathname, l.href) ? "font-medium text-[var(--journal-accent)]" : ""}`}
                        onClick={closeMobile}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
