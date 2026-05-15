import Link from "next/link";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { TermsModal } from "@/components/layout/TermsModal";
import { PrivacyModal } from "@/components/layout/PrivacyModal";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--journal-border)] bg-[var(--journal-footer-bg)]">
      <div className={`${contentShell} py-12`}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(5,minmax(0,1fr))] lg:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Journal
            </p>
            <p className="mt-2 font-serif text-sm font-semibold text-[var(--journal-heading)]">
              {siteConfig.name}
            </p>
            {siteConfig.issn ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--journal-muted)]">
                ISSN {siteConfig.issn}
              </p>
            ) : null}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Publisher
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--journal-heading)]">
              {siteConfig.publisherOrganisation}
            </p>
            <p className="mt-2 break-words text-sm leading-relaxed text-[var(--journal-muted)]">
              {siteConfig.publisherAddress}
            </p>
            <p className="mt-2 text-sm">
              <a
                className="text-[var(--journal-accent)] hover:underline"
                href={`tel:${siteConfig.publisherMobileTel}`}
              >
                {siteConfig.publisherMobileDisplay}
              </a>
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Contact
            </p>
            <p className="mt-2 text-sm">
              <a
                className="block max-w-full break-all leading-snug text-[var(--journal-accent)] hover:underline [overflow-wrap:anywhere]"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            </p>
            {siteConfig.instagramUrl && (
              <p className="mt-2 text-sm">
                <a
                  className="text-[var(--journal-accent)] hover:underline"
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </p>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              For readers
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="break-words hover:underline" href="/issues">
                  Current &amp; past issues
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/about/open-access">
                  Open access
                </Link>
              </li>
            </ul>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              For authors
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="break-words hover:underline" href="/submissions">
                  Make a submission
                </Link>
              </li>
              <li>
                <Link className="hover:underline" href="/about/peer-review">
                  Peer review
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-[var(--journal-border)] pt-8 text-xs text-[var(--journal-muted)]">
          <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2">
            <span>
              Copyright © {siteConfig.yearRange} {siteConfig.publisher}. Licensed under{" "}
              <a
                className="underline hover:text-[var(--journal-heading)]"
                href={siteConfig.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Creative Commons {siteConfig.license}
              </a>
              .
            </span>
            <span aria-hidden>·</span>
            <TermsModal />
            <span aria-hidden>·</span>
            <PrivacyModal />
          </div>
        </div>
      </div>
    </footer>
  );
}
