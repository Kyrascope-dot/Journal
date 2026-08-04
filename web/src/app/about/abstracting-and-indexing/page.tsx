import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { getIndexingServicesForPublic } from "@/lib/indexing-services";

export const metadata = {
  title: "Abstracting and indexing",
};

export default function AbstractingAndIndexingPage() {
  const services = getIndexingServicesForPublic();

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
