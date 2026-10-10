import Link from "next/link";
import { notFound } from "next/navigation";
import { BlindedManuscriptNotice } from "@/components/for-authors/BlindedManuscriptNotice";
import { PublicationFeesContent } from "@/components/for-authors/PublicationFeesContent";
import { FeeWaiverNotice } from "@/components/fees/FeeWaiverNotice";
import { StaticContentPage } from "@/components/layout/StaticContentPage";
import { forAuthorsPages, forAuthorsSlugs } from "@/content/for-authors-pages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return forAuthorsSlugs.map((slug) => ({ slug }));
}

export default async function ForAuthorsSlugPage({ params }: Props) {
  const { slug } = await params;
  const page = forAuthorsPages[slug];
  if (!page) notFound();

  const isPublicationFeesPage = slug === "publication-fees";
  const showsManuscriptRequirements = [
    "author-guidelines",
    "submission-checklist",
    "submit-manuscript",
  ].includes(slug);
  const showsFeeWaiver = ["publication-fees", "fee-waiver-policy"].includes(slug);

  return (
    <StaticContentPage
      title={page.title}
      intro={isPublicationFeesPage ? "Please find below the applicable Article Processing Charge (APC) / Publication Fee and review timelines." : page.intro}
      sections={isPublicationFeesPage ? [] : page.sections}
    >
      {isPublicationFeesPage ? <PublicationFeesContent /> : null}
      {showsManuscriptRequirements ? <BlindedManuscriptNotice className="mt-10" /> : null}
      {showsFeeWaiver ? <FeeWaiverNotice className="mt-10" /> : null}
      {slug === "submit-manuscript" ? (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center rounded border border-[var(--journal-accent)] bg-[var(--journal-accent)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
          >
            Complete registration
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded border border-[var(--journal-border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--journal-heading)] hover:bg-zinc-50"
          >
            Sign in to submit
          </Link>
        </div>
      ) : null}
    </StaticContentPage>
  );
}
