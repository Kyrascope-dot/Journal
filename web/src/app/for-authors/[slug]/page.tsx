import { notFound } from "next/navigation";
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

  return (
    <StaticContentPage title={page.title} intro={page.intro} sections={page.sections} />
  );
}
