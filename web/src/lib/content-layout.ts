/**
 * Shared width and horizontal padding — matches SiteHeader, TopBar, SiteFooter,
 * and JournalBanner so page content aligns with global chrome.
 */
export const contentShell = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/** Comfortable reading width only (e.g. a single paragraph). */
export const contentProseMeasure = "max-w-3xl";

/** Prose block: reading width plus justified list items inside the wrapper. */
export const contentProse = `${contentProseMeasure} [&_li]:text-justify [&_li]:text-pretty`;
