# Global Confluence Review — repository audit

**Date:** 2026-08-04  
**Production site:** https://www.globalconfluencereview.in/

## Stack

| Area | Current state |
|------|----------------|
| Framework | **Next.js 16.2.1** (App Router) |
| Language | **TypeScript** |
| UI | **React 19**, **Tailwind CSS v4** |
| Routing | `web/src/app/**/page.tsx` |
| Auth | **Firebase Auth** (email/password); `AuthContext`, `/login`, `/register` |
| Database | **Firestore** (issues/articles, user profiles, submissions in codebase) |
| File storage | **Local `/public`** for PDFs/templates; manuscript uploads via Firebase patterns in dashboard code |
| Hosting | **Vercel** (typical for Next.js; confirm in project settings) |
| Email | **Not integrated** (no Resend/SMTP in repo) |
| Payments | **Not integrated** (no Razorpay) |
| Tests | **None** configured in `package.json` |

## Existing journal workflow

- Current issue + archives from Firestore with **demo fallback** (`demo-data.ts`, `local-issue-assets.ts`).
- Scholar / editor / admin **dashboards** at `/dashboard` (role from Firestore profile).
- Submissions page with **template pack** downloads; editorial contact email.
- Editorial board data in **`src/data/editorial.ts`** (static).

## Gaps vs. target platform

Phases **3–20** (competitions backend, conferences + Razorpay, full manuscript workflow, reviewer/editor split dashboards, email automation, admin CMS, migrations, tests) require incremental delivery on branch `feature/gcr-journal-platform`.

## This branch (initial delivery)

- Phase **1**: Navigation, footer, route scaffolding, a11y dropdowns.
- Phase **2** (partial): Homepage sections (hero, trust strip, previews).
- Phases **3–4** (partial): Public competition + conference pages (content; registration flows stubbed).
- Phase **7** (partial): `/for-authors/manuscript-templates`.
- Phase **8** (partial): Abstracting & indexing page (admin-driven placeholders).
- **`.env.example`** and **`docs/architecture.md`** starter.

## ISSN and claims

ISSN is read from **`siteConfig.issn`** (admin CMS planned). Empty ISSN displays **“To be updated”**. No unverified indexing claims are hard-coded as “indexed”.
