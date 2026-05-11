import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { TermsModal } from "@/components/layout/TermsModal";
import { PrivacyModal } from "@/components/layout/PrivacyModal";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--journal-border)] bg-[var(--journal-footer-bg)]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-serif text-sm font-semibold text-[var(--journal-heading)]">
              {siteConfig.name}
            </p>
            {siteConfig.issn ? (
              <p className="mt-2 text-xs leading-relaxed text-[var(--journal-muted)]">
                ISSN {siteConfig.issn}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Contact
            </p>
            <p className="mt-2 text-sm">
              <a
                className="text-[var(--journal-accent)] hover:underline"
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              For readers
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="hover:underline" href="/issues">
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              For authors
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link className="hover:underline" href="/submissions">
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
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-[var(--journal-border)] pt-6 text-center text-xs text-[var(--journal-muted)]">
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
    </footer>
  );
}
