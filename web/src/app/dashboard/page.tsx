import { Suspense } from "react";
import { DashboardPageClient } from "@/app/dashboard/DashboardPageClient";
import { AppShell } from "@/components/layout/AppShell";
import { contentShell } from "@/lib/content-layout";

function DashboardFallback() {
  return (
    <AppShell>
      <div className={`${contentShell} py-10`}>
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-100" />
      </div>
    </AppShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardPageClient />
    </Suspense>
  );
}
