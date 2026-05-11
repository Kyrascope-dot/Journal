import { AppShell } from "@/components/layout/AppShell";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Contact
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          The editorial team of <strong>{siteConfig.name}</strong> ({siteConfig.shortName})
          handles manuscript inquiries, submissions, and general questions about the
          journal. We aim to respond to routine messages within{" "}
          <strong>5 business days</strong>, though complex issues may take longer.
        </p>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Editorial office
        </h2>
        <dl className="mt-4 space-y-4 text-[15px] text-[var(--journal-body)]">
          <div>
            <dt className="font-medium text-[var(--journal-heading)]">Email</dt>
            <dd className="mt-1">
              <a
                className="text-[var(--journal-accent)] hover:underline"
                href={`mailto:${siteConfig.email}`}
              >
                {siteConfig.email}
              </a>
              <span className="mt-1 block text-sm text-[var(--journal-muted)]">
                Preferred for submissions, status updates, and ethics reports.
              </span>
            </dd>
          </div>
          {siteConfig.instagramUrl && (
            <div>
              <dt className="font-medium text-[var(--journal-heading)]">Instagram</dt>
              <dd className="mt-1">
                <a
                  className="text-[var(--journal-accent)] hover:underline"
                  href={siteConfig.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @globalconfluencereview
                </a>
              </dd>
            </div>
          )}
        </dl>

        <h2 className="mt-10 font-serif text-xl font-semibold text-[var(--journal-heading)]">
          What to write in your message
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>
            <strong>Submissions:</strong> use a clear subject line and attach your
            manuscript as instructed on the{" "}
            <a className="text-[var(--journal-accent)] hover:underline" href="/submissions">
              Submissions
            </a>{" "}
            page.
          </li>
          <li>
            <strong>Peer review:</strong> include manuscript ID or title if you are an
            author or reviewer.
          </li>
          <li>
            <strong>Media or partnerships:</strong> briefly describe your organisation
            and purpose.
          </li>
        </ul>
      </div>
    </AppShell>
  );
}
