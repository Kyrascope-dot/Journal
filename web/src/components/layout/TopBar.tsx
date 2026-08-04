"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { contentShell } from "@/lib/content-layout";
import { useAuth, useAuthSessionPending } from "@/context/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getDashboardNavLinks } from "@/lib/dashboard-access";

export function TopBar() {
  const { user, loading, signOutUser } = useAuth();
  const sessionPending = useAuthSessionPending();
  const { profile, loading: profileLoading } = useUserProfile();
  const showSignedIn = Boolean(user) || sessionPending;
  const authBusy = loading && !showSignedIn;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const dashboardLinks =
    user && profile && !profileLoading ? getDashboardNavLinks(profile.role) : [];

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="relative z-[60] border-b border-[var(--journal-border)] bg-[var(--journal-strip)] text-sm text-white">
      <div className={`${contentShell} flex flex-wrap items-center justify-end gap-3 py-2`}>
        <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide">
          {authBusy ? (
            <span className="h-7 w-20 animate-pulse rounded bg-white/20" />
          ) : showSignedIn && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded px-2 py-1 hover:bg-white/15"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                id="account-menu-button"
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt=""
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[10px] font-bold uppercase text-white">
                    {(user.displayName ?? user.email ?? "U").charAt(0)}
                  </span>
                )}
                <span className="max-w-[120px] truncate normal-case">
                  {user.displayName ?? user.email}
                </span>
                <svg className="h-3.5 w-3.5 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
                </svg>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-labelledby="account-menu-button"
                  className="absolute right-0 top-full z-[200] mt-1 min-w-[220px] rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
                >
                  <p className="truncate px-3 py-2 text-xs text-zinc-400">{user.email}</p>
                  <hr className="border-zinc-100" />
                  {profileLoading ? (
                    <p className="px-3 py-2 text-xs text-zinc-400">Loading menus…</p>
                  ) : (
                    dashboardLinks.map((link) => (
                      <Link
                        key={link.href}
                        role="menuitem"
                        href={link.href}
                        className="block px-3 py-2 text-sm font-medium normal-case text-zinc-700 hover:bg-zinc-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))
                  )}
                  <hr className="border-zinc-100" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={async () => {
                      await signOutUser();
                      setMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : sessionPending ? (
            <span className="h-7 w-28 animate-pulse rounded bg-white/20" aria-label="Loading account" />
          ) : (
            <>
              <Link href="/register" className="hover:underline">
                Register
              </Link>
              <Link href="/login" className="hover:underline">
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
