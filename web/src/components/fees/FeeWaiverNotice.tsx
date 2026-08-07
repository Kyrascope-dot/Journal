import { siteConfig } from "@/lib/site-config";

const waiverHref = `mailto:${siteConfig.email}?subject=Fee%20Waiver%20Request`;

export function FeeWaiverNotice({ className = "" }: { className?: string }) {
  return (
    <aside
      className={`rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/50 p-5 ${className}`}
      aria-labelledby="fee-waiver-notice-heading"
    >
      <h2
        id="fee-waiver-notice-heading"
        className="font-serif text-xl font-semibold text-[var(--journal-heading)]"
      >
        Need-based Fee Waiver
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Global Confluence Review is committed to promoting inclusive academic participation.
        Need-based partial and full fee waivers are available for both journal publication (APC)
        and conference registration. Students seeking financial assistance should email the Editor
        with a brief explanation of their circumstances and supporting information. Each request
        will be reviewed individually.
      </p>
      <a
        href={waiverHref}
        className="mt-4 inline-flex rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
      >
        Request Fee Waiver
      </a>
    </aside>
  );
}

export function HomeFinancialAssistance() {
  return (
    <section className="py-12" aria-labelledby="financial-assistance-heading">
      <h2
        id="financial-assistance-heading"
        className="font-serif text-2xl font-semibold text-[var(--journal-heading)] sm:text-3xl"
      >
        Financial Assistance
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
        Global Confluence Review believes that financial constraints should not prevent deserving
        scholars from participating in research dissemination.
      </p>
      <div className="mt-6">
        <FeeWaiverNotice />
      </div>
      <p className="mt-4 text-sm text-[var(--journal-body)]">
        Students requesting assistance should email:{" "}
        <a
          href={waiverHref}
          className="break-all font-medium text-[var(--journal-accent)] underline"
        >
          {siteConfig.email}
        </a>
      </p>
      <p className="mt-4 text-sm text-[var(--journal-muted)]">
        Each application is reviewed confidentially.
      </p>
    </section>
  );
}
