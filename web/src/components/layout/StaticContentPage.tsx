import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentShell } from "@/lib/content-layout";

export type ContentSection = {
  heading?: string;
  paragraphs: string[];
  list?: string[];
};

export function StaticContentPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro?: string;
  sections?: ContentSection[];
  children?: React.ReactNode;
}) {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            {title}
          </h1>
          {intro ? (
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">{intro}</p>
          ) : null}
          {sections?.map((section, i) => (
            <div key={i} className="mt-8">
              {section.heading ? (
                <h2 className="font-serif text-xl font-semibold text-[var(--journal-heading)]">
                  {section.heading}
                </h2>
              ) : null}
              <div className={`space-y-4 ${section.heading ? "mt-4" : ""}`}>
                {section.paragraphs.map((p, j) => (
                  <p
                    key={j}
                    className="text-[15px] leading-relaxed text-[var(--journal-body)]"
                  >
                    {p}
                  </p>
                ))}
              </div>
              {section.list?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-[var(--journal-body)]">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
          {children}
          <p className="mt-10 text-sm text-[var(--journal-muted)]">
            Questions?{" "}
            <Link className="text-[var(--journal-accent)] hover:underline" href="/contact">
              Contact the editorial office
            </Link>
            .
          </p>
        </div>
      </div>
    </AppShell>
  );
}
