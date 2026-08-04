import { SiteHeaderBrand, SiteHeaderShell, MainNav } from "@/components/navigation/MainNav";

export function SiteHeader() {
  return (
    <SiteHeaderShell>
      <SiteHeaderBrand />
      <div className="ml-auto flex shrink-0 items-center">
        <MainNav />
      </div>
    </SiteHeaderShell>
  );
}
