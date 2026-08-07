import Link from "next/link";
import { contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";
import { footerNavColumns } from "@/config/site-navigation";
import { getIssnLabel } from "@/lib/journal-settings";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--journal-border)] bg-[var(--journal-footer-bg)]">
      <div className={`${contentShell} py-12`}>
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))] lg:items-start">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Journal</p>
            <p className="mt-2 font-serif text-sm font-semibold text-[var(--journal-heading)]">
              {siteConfig.name}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[var(--journal-muted)]">
              {getIssnLabel()}
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--journal-heading)]">
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
            <p className="mt-2 text-sm">
              <a
                className="block max-w-full break-all leading-snug text-[var(--journal-accent)] hover:underline [overflow-wrap:anywhere]"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
          {footerNavColumns.map((col) => (
            <div key={col.title} className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {col.title}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link className="break-words hover:underline" href={link.href}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
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
            <Link className="hover:underline" href="/terms-and-conditions">
              Terms and Conditions
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/privacy-policy">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/copyright-notice">
              Copyright Notice
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/refund-and-cancellation-policy">
              Refund and Cancellation Policy
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/shipping-and-delivery-policy">
              Shipping &amp; Delivery Policy
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/for-authors/publication-fees">
              Publication Charges
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/conferences/faqs">
              Conference FAQ
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/conferences/register">
              Conference Registration
            </Link>
            <span aria-hidden>·</span>
            <Link className="hover:underline" href="/for-authors/fee-waiver-policy">
              Need-based Fee Waiver
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
