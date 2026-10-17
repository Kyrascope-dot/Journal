import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { getIndexingServicesForPublic, ISSN_RECORD_URL } from "@/lib/indexing-services";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Abstracting and indexing",
};

export default function AbstractingAndIndexingPage() {
  const services = getIndexingServicesForPublic();
  const indexedIn = services
    .filter((service) => service.status === "Indexed")
    .map((service) => service.name);
  const listedIn = services
    .filter((service) => service.status === "Listed")
    .map((service) => service.name);

  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Abstracting and indexing
          </h1>
          <p className="mt-2 text-lg text-[var(--journal-body)]">Research visibility and discoverability</p>
          <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Global Confluence Review is committed to increasing the visibility, accessibility, and
            scholarly discoverability of the research it publishes through quality metadata,
            technical infrastructure, and publication standards.
          </p>
          {indexedIn.length > 0 || listedIn.length > 0 ? (
            <div className="mt-6 space-y-1 rounded-lg border border-[var(--journal-border)] bg-[var(--journal-hero-bg)]/50 px-5 py-4 text-[15px] font-medium text-[var(--journal-heading)]">
              {indexedIn.length > 0 ? <p>Indexed in: {indexedIn.join(", ")}</p> : null}
              {listedIn.length > 0 ? <p>Listed in: {listedIn.join("; ")}</p> : null}
            </div>
          ) : null}
          <div className="mt-4 rounded-lg border border-[var(--journal-border)] bg-white px-5 py-4 text-[15px] text-[var(--journal-body)]">
            <p className="font-medium text-[var(--journal-heading)]">ISSN record</p>
            <p className="mt-1">
              ISSN {siteConfig.issn}:{" "}
              <a
                href={ISSN_RECORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-[var(--journal-accent)] underline"
              >
                {ISSN_RECORD_URL}
              </a>
            </p>
            <p className="mt-1 text-sm text-[var(--journal-muted)]">
              Official record in the ISSN Portal, including the journal&apos;s ROAD (Directory of
              Open Access Scholarly Resources) listing.
            </p>
          </div>
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--journal-border)] bg-zinc-50 text-left">
                  <th className="p-3 font-semibold text-[var(--journal-heading)]">Service or platform</th>
                  <th className="p-3 font-semibold text-[var(--journal-heading)]">Current status</th>
                  <th className="p-3 font-semibold text-[var(--journal-heading)]">Verification date</th>
                  <th className="p-3 font-semibold text-[var(--journal-heading)]">Verification link</th>
                  <th className="p-3 font-semibold text-[var(--journal-heading)]">Notes</th>
                </tr>
              </thead>
              <tbody>
                {services.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--journal-border)]">
                    <td className="p-3 text-[var(--journal-body)]">{row.name}</td>
                    <td className="p-3 text-[var(--journal-body)]">{row.status}</td>
                    <td className="p-3 text-[var(--journal-body)]">{row.dateVerified ?? "—"}</td>
                    <td className="p-3">
                      {row.verificationUrl ? (
                        <a
                          href={row.verificationUrl}
                          className="text-[var(--journal-accent)] hover:underline"
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          Link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-[var(--journal-body)]">{row.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-8">
            <Link href="/" className="text-[var(--journal-accent)] hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </AppShell>
  );
}
