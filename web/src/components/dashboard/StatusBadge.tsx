import type { SubmissionPurpose, SubmissionStatus } from "@/types/dashboard";
import {
  STATUS_COLORS,
  getSubmissionStatusLabel,
} from "@/types/dashboard";

export function StatusBadge({
  status,
  purpose = "journal",
}: {
  status: SubmissionStatus;
  purpose?: SubmissionPurpose;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {getSubmissionStatusLabel(status, purpose)}
    </span>
  );
}
