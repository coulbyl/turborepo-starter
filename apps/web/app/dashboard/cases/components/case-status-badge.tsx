import {
  STATUS_COLOR,
  STATUS_LABEL,
  type CaseStatus,
} from "@/domains/case/types/case";

export function CaseStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold ${STATUS_COLOR[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
