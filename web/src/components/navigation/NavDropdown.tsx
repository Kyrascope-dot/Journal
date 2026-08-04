"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { NavGroup, NavLink } from "@/config/site-navigation";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const base = href.split("#")[0];
  if (base === "/") return false;
  return pathname === base || pathname.startsWith(`${base}/`);
}

function linkClass(pathname: string, href: string, extra = ""): string {
  const active = isActive(pathname, href);
  return [
    "block rounded px-3 py-2 text-sm transition",
    active
      ? "bg-zinc-100 font-medium text-[var(--journal-heading)]"
      : "text-[var(--journal-body)] hover:bg-zinc-50",
    extra,
  ].join(" ");
}

export function NavDropdown({
  group,
  pathname,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const buttonId = useId();
  const menuId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const groupActive = group.links.some((l) => isActive(pathname, l.href));

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, close]);

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      requestAnimationFrame(() => itemRefs.current[0]?.focus());
    }
    if (e.key === "Escape") close();
  }

  function onMenuKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % group.links.length;
      itemRefs.current[next]?.focus();
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + group.links.length) % group.links.length;
      itemRefs.current[prev]?.focus();
    }
    if (e.key === "Tab") close();
  }

  return (
    <li ref={rootRef} className="relative">
      <button
        id={buttonId}
        type="button"
        className={`flex items-center gap-0.5 rounded px-2 py-1 text-sm ${
          groupActive
            ? "font-medium text-[var(--journal-heading)]"
            : "text-[var(--journal-body)]"
        } hover:bg-zinc-100`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
      >
        {group.label}
        <svg className="h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>
      <ul
        id={menuId}
        role="menu"
        aria-labelledby={buttonId}
        className={`absolute left-0 top-full z-50 mt-1 max-h-[min(70vh,420px)] min-w-[240px] overflow-y-auto rounded-md border border-[var(--journal-border)] bg-white py-1 shadow-lg ${
          open ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
        } transition-opacity`}
      >
        {group.links.map((l, i) => (
          <li key={l.href} role="none">
            <Link
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              role="menuitem"
              href={l.href}
              className={linkClass(pathname, l.href)}
              onClick={() => {
                close();
                onNavigate?.();
              }}
              onKeyDown={(e) => onMenuKeyDown(e, i)}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function NavPlainLink({
  link,
  pathname,
  onNavigate,
  className = "rounded px-2 py-1 text-sm hover:bg-zinc-100",
}: {
  link: NavLink;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  const active = isActive(pathname, link.href);
  return (
    <Link
      href={link.href}
      className={`${className} ${
        active ? "font-medium text-[var(--journal-heading)]" : "text-[var(--journal-body)]"
      }`}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
    >
      {link.label}
    </Link>
  );
}

export { isActive };
