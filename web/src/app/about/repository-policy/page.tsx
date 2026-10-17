import type { Metadata } from "next";
import Link from "next/link";
import { StaticContentPage } from "@/components/layout/StaticContentPage";
import { siteConfig } from "@/lib/site-config";

const description =
  "Global Confluence Review (GCR) author repository and self-archiving policy: depositing published articles in institutional, subject and university repositories, subject to each article's licence and author agreement.";

export const metadata: Metadata = {
  title: "Repository Policy",
  description,
  alternates: { canonical: "/about/repository-policy" },
  openGraph: {
    title: `Repository Policy | ${siteConfig.name}`,
    description,
    url: "/about/repository-policy",
    siteName: siteConfig.name,
    type: "website",
  },
};

const linkClass = "text-[var(--journal-accent)] hover:underline";

export default function RepositoryPolicyPage() {
  return (
    <StaticContentPage
      title="Repository Policy"
      intro="Author Repository and Self-Archiving Policy. Global Confluence Review (GCR) supports the dissemination and accessibility of scholarly research."
      sections={[
        {
          heading: "Depositing published articles",
          paragraphs: [
            "Authors may deposit the published version of their articles in institutional repositories, subject repositories, university repositories, or other appropriate scholarly repositories, provided that:",
          ],
          list: [
            "The deposited article includes a full citation to the original publication in Global Confluence Review.",
            "A link to the original article webpage on the GCR website is included.",
            "The applicable article licence is clearly identified, with a link to that licence.",
            "The deposited version is not altered in a way that misrepresents the published work.",
            "Authors comply with the copyright, licensing, and publication terms applicable to their particular article.",
          ],
        },
        {
          heading: "Personal websites and academic networks",
          paragraphs: [
            "Authors may also share their articles on personal websites and academic networking platforms, subject to the same applicable copyright and licensing terms.",
          ],
        },
        {
          heading: "Article licences and author agreements",
          paragraphs: [
            "This policy does not override any specific agreement applicable to an article. Where an article's licence or author agreement imposes different conditions, those terms take precedence.",
          ],
        },
        {
          heading: "Responsible self-archiving",
          paragraphs: [
            "GCR encourages responsible self-archiving to support research visibility, discoverability, and long-term access to scholarly work.",
          ],
        },
      ]}
    >
      <div className="mt-8">
        <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
          Related policies
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-[var(--journal-body)]">
          <li>
            <Link href="/about/copyright-and-licensing" className={linkClass}>
              Copyright and licensing
            </Link>{" "}
            — the licence under which GCR articles are published, unless otherwise stated for an
            article.
          </li>
          <li>
            <Link href="/about/open-access" className={linkClass}>
              Open access policy
            </Link>
          </li>
          <li>
            <Link href="/copyright-notice" className={linkClass}>
              Copyright notice
            </Link>
          </li>
          <li>
            <Link href="/issues" className={linkClass}>
              All issues
            </Link>{" "}
            — find the original article webpage to cite and link to.
          </li>
        </ul>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--journal-body)]">
          If you are unsure which licence or terms apply to your article, contact the editorial
          office at{" "}
          <a href={`mailto:${siteConfig.email}`} className={linkClass}>
            {siteConfig.email}
          </a>{" "}
          before depositing it.
        </p>
      </div>
    </StaticContentPage>
  );
}
