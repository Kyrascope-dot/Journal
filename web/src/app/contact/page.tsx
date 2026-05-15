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
    <div className="rounded-lg border border-[var(--journal-border)] bg-zinc-50 p-6">
      <h2 className="font-serif text-lg font-semibold text-[var(--journal-heading)]">
        {title}
      </h2>
      <dl className="mt-4 space-y-3 text-sm text-[var(--journal-body)]">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[120px_1fr] gap-2">
            <dt className="font-medium text-[var(--journal-heading)]">{r.label}</dt>
            <dd className="text-[var(--journal-body)]">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function MailLink({ email }: { email: string }) {
  return (
    <a className="text-[var(--journal-accent)] hover:underline break-all" href={`mailto:${email}`}>
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
          The editorial team of <strong>{siteConfig.name}</strong> ({siteConfig.shortName})
          handles manuscript inquiries, submissions, and general questions about the
          journal. We aim to respond to routine messages within{" "}
          <strong>5 business days</strong>, though complex issues may take longer.
        </p>

        <div className="mt-10 space-y-6">
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
                value: <MailLink email="blissglobal2@gmail.com" />,
              },
              {
                label: "Mobile",
                value: (
                  <a className="text-[var(--journal-accent)] hover:underline" href="tel:+919711350603">
                    +91 97113 50603
                  </a>
                ),
              },
            ]}
          />

          {/* Editor in Chief */}
          <ContactCard
            title="Editor in Chief"
            rows={[
              { label: "Name", value: "Dr. Japji Kaur" },
              { label: "Designation", value: "Guest Faculty (Economics)" },
              {
                label: "Address",
                value: "EC-142 Tagore Garden, New Delhi – 110027",
              },
              {
                label: "Email",
                value: (
                  <span className="flex flex-col gap-1">
                    <MailLink email="editorglobalconfluencereview@gmail.com" />
                    <MailLink email="japjikaur_2k20phdhueco01@dtu.ac.in" />
                  </span>
                ),
              },
              {
                label: "Mobile",
                value: (
                  <a className="text-[var(--journal-accent)] hover:underline" href="tel:+917678560820">
                    +91 76785 60820
                  </a>
                ),
              },
            ]}
          />

          {/* Editorial office */}
          <ContactCard
            title="Editorial Office"
            rows={[
              {
                label: "Email",
                value: (
                  <span>
                    <MailLink email={siteConfig.email} />
                    <span className="mt-1 block text-xs text-[var(--journal-muted)]">
                      Preferred for submissions, status updates, and ethics reports.
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

        <h2 className="mt-12 font-serif text-xl font-semibold text-[var(--journal-heading)]">
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
      </div>
    </AppShell>
  );
}
