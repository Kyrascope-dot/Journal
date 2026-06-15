import { EditorialTeam } from "@/components/editorial/EditorialTeam";
import { AppShell } from "@/components/layout/AppShell";
import { contentProse, contentProseMeasure, contentShell } from "@/lib/content-layout";
import { siteConfig } from "@/lib/site-config";

export default function EditorialPage() {
  return (
    <AppShell>
      <div className={`${contentShell} py-12`}>
        <div className={contentProse}>
        <h1 className="font-serif text-3xl font-semibold text-[var(--journal-heading)]">
          Editorial board
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--journal-body)]">
          The editorial board brings together scholars and professionals committed to
          rigorous peer review and the dissemination of high-quality research.
        </p>
        </div>

        <EditorialTeam />

        <p className={`mt-14 border-t border-[var(--journal-border)] pt-8 text-sm text-[var(--journal-muted)] ${contentProseMeasure}`}>
          Contact:{" "}
          <a className="text-[var(--journal-accent)] hover:underline" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </a>
        </p>
      </div>
    </AppShell>
  );
}
