import { AppShell } from "@/components/layout/AppShell";
import { ManuscriptTemplatesList } from "@/components/for-authors/ManuscriptTemplatesList";
import { contentProse, contentShell } from "@/lib/content-layout";

export const metadata = {
  title: "Manuscript templates",
  description: "GCR manuscript templates for journal submission.",
};

export default function ManuscriptTemplatesPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
          <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
            GCR manuscript template
          </h1>
          <p className="mt-2 text-[15px] text-[var(--journal-body)]">
            Prepare your manuscript for submission
          </p>
          <ManuscriptTemplatesList />
        </div>
      </div>
    </AppShell>
  );
}
