import type { Issue } from "@/types/journal";

function toDate(
  value: Issue["publishedAt"]
): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export function formatPublished(publishedAt: Issue["publishedAt"]): string {
  const d = toDate(publishedAt);
  if (!d) return "—";
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatIssueLabel(issue: Pick<Issue, "volume" | "issueNumber" | "year" | "monthLabel">): string {
  return `Volume ${issue.volume} No ${issue.issueNumber} ${issue.year} ${issue.monthLabel}`.trim();
}
