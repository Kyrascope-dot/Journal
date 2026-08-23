import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

function ContactCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: React.ReactNode }[];
}) {
  return (
    <section className="h-full rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-6">
      <h2 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        {title}
      </h2>
      <dl className="mt-4 space-y-3 text-sm text-[var(--journal-body)]">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-1 gap-1 sm:grid-cols-[120px_1fr] sm:gap-2"
          >
            <dt className="font-medium text-[var(--journal-heading)]">{r.label}</dt>
            <dd className="text-[var(--journal-body)]">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function MailLink({ email, label }: { email: string; label?: string }) {
  return (
    <a
      className="break-all rounded-sm text-[var(--journal-accent)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--journal-accent)]"
      href={`mailto:${email}`}
      aria-label={label ? `Email ${label} at ${email}` : undefined}
    >
      {email}
    </a>
  );
}

export default function ContactPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Contact
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            The editorial board of <strong>{siteConfig.name}</strong>{" "}
            ({siteConfig.shortName}) handles manuscript inquiries, submissions, and
            general questions about the journal. We aim to respond to routine messages
            within <strong>5 business days</strong>, though complex issues may take
            longer.
          </p>

          <div className="mt-10 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Editor-in-Chief */}
              <ContactCard
                title="Editor-in-Chief"
                rows={[
                  {
                    label: "Name",
                    value: "Dr. Japji Kaur",
                  },
                  {
                    label: "Email",
                    value: (
                      <MailLink
                        email="editorglobalconfluencereview@gmail.com"
                        label="Editor-in-Chief"
                      />
                    ),
                  },
                ]}
              />

              {/* Editorial Office */}
              <ContactCard
                title="Editorial Office"
                rows={[
                  {
                    label: "Email",
                    value: (
                      <span>
                        <MailLink email={siteConfig.email} label="Editorial Office" />
                        <span className="mt-2 block text-xs leading-relaxed text-[var(--journal-muted)]">
                          Preferred for submissions, status updates, and ethics reports,
                          payments, and general queries related to research submissions,
                          conferences, and competitions.
                        </span>
                      </span>
                    ),
                  },
                  ...(siteConfig.instagramUrl
                    ? [
                        {
                          label: "Instagram",
                          value: (
                            <a
                              className="text-[var(--journal-accent)] hover:underline"
                              href={siteConfig.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              @globalconfluencereview
                            </a>
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </div>

            {/* Publisher */}
            <ContactCard
              title="Publisher"
              rows={[
                { label: "Organisation", value: "Bliss Global" },
                {
                  label: "Address",
                  value: "10/130 Malviya Nagar, New Delhi – 110097",
                },
                {
                  label: "Email",
                  value: <MailLink email="blissglobal2@gmail.com" label="Publisher" />,
                },
                {
                  label: "Mobile",
                  value: (
                    <a
                      className="text-[var(--journal-accent)] hover:underline"
                      href="tel:+919711350603"
                    >
                      +91 97113 50603
                    </a>
                  ),
                },
              ]}
            />
          </div>

          <h2 className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
            What to write in your message
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
            <li>
              <strong>Submissions:</strong> use a clear subject line and attach your
              manuscript as instructed on the{" "}
              <a
                className="text-[var(--journal-accent)] hover:underline"
                href="/submissions"
              >
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
      </div>
    </AppShell>
  );
}
