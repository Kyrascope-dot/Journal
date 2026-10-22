import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { journalFaqs } from "@/content/journal-faqs";
import { contentProse, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

const title = `Frequently asked questions about ${siteConfig.name}`;
const description = `Answers about ${siteConfig.name} (ISSN ${siteConfig.issn}): who can publish (including high school students), peer review, open access, subjects, fees, indexing and how to submit.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about/faq" },
  openGraph: { title, description, url: "/about/faq", siteName: siteConfig.name, type: "website" },
};

export default function JournalFaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: journalFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer.join(" ") },
    })),
  };

  return (
    <AppShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            Frequently asked questions
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
            Quick answers about {siteConfig.name}. The linked policy pages give the full details.
          </p>

          {journalFaqs.map((faq) => (
            <section key={faq.question} className="mt-10">
              <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
                {faq.question}
              </h2>
              {faq.answer.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-[15px] leading-relaxed text-[var(--journal-body)]"
                >
                  {paragraph}
                </p>
              ))}
              {faq.links?.length ? (
                <p className="mt-3 text-sm text-[var(--journal-muted)]">
                  See:{" "}
                  {faq.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? " · " : null}
                      <Link href={link.href} className="text-[var(--journal-accent)] hover:underline">
                        {link.label}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
