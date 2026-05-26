import { CaseDetailClient } from "./components/case-detail-client";

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return <CaseDetailClient caseId={params.id} />;
}
