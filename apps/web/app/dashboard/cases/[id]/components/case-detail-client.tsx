"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Badge } from "@identis/ui/components/badge";
import { Button } from "@identis/ui/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCase } from "@/domains/case/use-cases/get-case";
import { useDeleteCase } from "@/domains/case/use-cases/delete-case";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@identis/ui/components/table";
import { CaseStatusBadge } from "../../components/case-status-badge";
import type {
  CaseDetail,
  CaseFormData,
  CaseVerification,
  VerifStatus,
} from "@/domains/case/types/case";
import {
  formatDateLong,
  formatDateTimeLong,
  formatDateTimeMedium,
} from "@/lib/date";

type SignalTone = "pass" | "fail" | "review" | "unknown";

type SignalItem = {
  label: string;
  tone: SignalTone;
  detail?: string;
};

const providerProductLabel: Record<string, string> = {
  DOC_VERIFY: "Vérification de document",
  DOC_VERIFY_AML: "Vérification de document + sanctions",
  SMILE_SECURE: "Recherche de doublon biométrique",
  BASIC_KYC: "Vérification d'identité simple",
};

const providerModeLabel: Record<string, string> = {
  sandbox: "Simulation",
};

const providerScenarioLabel: Record<string, string> = {
  "clean-pass": "Dossier sans anomalie",
  "review-authority-unavailable": "Contrôle manuel requis",
  "face-mismatch": "Visage non concordant",
  "expired-document": "Document expiré",
  "aml-hit": "Alerte sanctions",
  "duplicate-hit": "Suspicion de doublon",
  "data-mismatch": "Écart entre saisie et document",
};

const riskFlagLabel: Record<string, string> = {
  WARNINGS: "Points à vérifier",
  AML_HIT: "Alerte sanctions",
  REQUIRES_COMPLIANCE_REVIEW: "Revue conformité requise",
  POSSIBLE_DUPLICATE: "Suspicion de doublon",
  DECLARED_DATA_MISMATCH: "Écart entre saisie et document",
  AUTHORITY_CHECK_DELAYED: "Contrôle source officielle en attente",
  FACE_MISMATCH: "Visage non concordant",
  DOCUMENT_EXPIRED: "Document expiré",
};

function getVerificationResult(verif: CaseVerification) {
  return verif.rawResult?.result;
}

function getExtractedField(
  verif: CaseVerification,
  key:
    | "firstName"
    | "lastName"
    | "dateOfBirth"
    | "idNumber"
    | "country"
    | "idType",
) {
  const result = getVerificationResult(verif);
  const extracted = result?.ExtractedData;
  if (extracted?.[key]) return extracted[key];

  switch (key) {
    case "dateOfBirth":
      return result?.DOB;
    case "idNumber":
      return result?.IDNumber;
    case "country":
      return result?.Country;
    case "idType":
      return result?.IDType;
    default:
      return undefined;
  }
}

function normalizeValue(value: string | undefined | null) {
  return (value ?? "").trim().toLowerCase();
}

function valuesMatch(
  declared: string | undefined | null,
  verified: string | undefined | null,
) {
  if (!declared || !verified) return null;
  return normalizeValue(declared) === normalizeValue(verified);
}

function formatMaybeDate(value: string | undefined | null) {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return formatDateLong(value);
  return value;
}

function formatScore(score: number | undefined | null) {
  if (typeof score !== "number") return undefined;
  return `${Math.round(score * 100)}%`;
}

function getSignalTone(value: boolean | null, invert = false): SignalTone {
  if (value === null) return "unknown";
  const normalized = invert ? !value : value;
  return normalized ? "pass" : "fail";
}

function getSignalIcon(tone: SignalTone) {
  switch (tone) {
    case "pass":
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "fail":
      return <XCircle className="size-4 text-red-500" />;
    case "review":
      return <Clock className="size-4 text-amber-500" />;
    case "unknown":
    default:
      return <AlertTriangle className="size-4 text-muted-foreground" />;
  }
}

function getSignalBadgeClass(tone: SignalTone) {
  switch (tone) {
    case "pass":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
    case "fail":
      return "border-red-500/25 bg-red-500/10 text-red-400";
    case "review":
      return "border-amber-500/25 bg-amber-500/10 text-amber-300";
    case "unknown":
    default:
      return "border-border bg-secondary text-muted-foreground";
  }
}

function getJobTypeLabel(jobType: number | undefined) {
  if (jobType === 11) return "JT11 · Document + source officielle";
  if (jobType === 6) return "JT6 · Vérification de document";
  if (jobType === 5) return "JT5 · Vérification textuelle";
  return "—";
}

function getReadableLabel(
  value: string | undefined,
  map: Record<string, string>,
) {
  if (!value) return "—";
  return map[value] ?? value;
}

function buildSignals(verif: CaseVerification): SignalItem[] {
  const result = getVerificationResult(verif);
  const scores = result?.Scores;
  const authorityVerified =
    result?.Provider?.authorityVerified ?? verif.rawResult?.authorityVerified;

  return [
    {
      label: "Présence réelle",
      tone:
        typeof verif.livenessScore === "number"
          ? verif.livenessScore >= 0.75
            ? "pass"
            : "fail"
          : "unknown",
      detail: formatScore(scores?.Liveness ?? verif.livenessScore),
    },
    {
      label: "Correspondance du visage",
      tone: getSignalTone(verif.faceMatch),
      detail: formatScore(scores?.FaceMatch),
    },
    {
      label: "Validité du document",
      tone: getSignalTone(verif.documentValid),
      detail: result?.Document?.reason,
    },
    {
      label: "Contrôle sanctions",
      tone: getSignalTone(verif.amlMatch, true),
      detail:
        result?.AML?.match && result.AML.matchedLists?.length
          ? result.AML.matchedLists.join(", ")
          : result?.AML?.summary,
    },
    {
      label: "Doublon",
      tone: getSignalTone(verif.duplicateFound, true),
      detail:
        result?.Duplicate?.found && result.Duplicate.matchedCaseId
          ? result.Duplicate.matchedCaseId
          : formatScore(result?.Duplicate?.score),
    },
    {
      label: "Autorité",
      tone: authorityVerified ? "pass" : "review",
      detail: authorityVerified
        ? "Contrôle effectué auprès d'une source officielle"
        : "Aucune source officielle interrogée",
    },
  ];
}

function VerificationSummaryCard({ verif }: { verif: CaseVerification }) {
  const result = getVerificationResult(verif);
  const icons: Record<VerifStatus, React.ReactNode> = {
    APPROVED: <ShieldCheck className="size-5 text-emerald-500" />,
    REJECTED: <ShieldAlert className="size-5 text-red-500" />,
    PENDING: <Clock className="size-5 text-amber-500 animate-pulse" />,
    UNKNOWN: <ShieldAlert className="size-5 text-muted-foreground" />,
  };

  const labels: Record<VerifStatus, string> = {
    APPROVED: "Vérification techniquement concluante",
    REJECTED: "Vérification rejetée par le service de contrôle",
    PENDING: "Vérification en cours ou en revue manuelle",
    UNKNOWN: "Résultat inconnu",
  };

  const riskBadges = [
    ...(result?.Flags ?? []),
    ...(result?.Warnings?.length ? ["WARNINGS"] : []),
  ];

  return (
    <div className="rounded-2xl border border-border bg-panel-strong p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Résultat du contrôle
          </p>
          <div className="mt-3 flex items-center gap-3">
            {icons[verif.status]}
            <div>
              <p className="text-sm font-medium text-foreground">
                {labels[verif.status]}
              </p>
              <p className="text-xs text-muted-foreground">
                {result?.ResultText ?? "Aucun détail transmis par le service"}
              </p>
            </div>
          </div>
        </div>
        {riskBadges.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {riskBadges.map((flag) => (
              <Badge
                key={flag}
                variant="outline"
                className="border-amber-500/20 bg-amber-500/10 text-amber-300"
              >
                {getReadableLabel(flag, riskFlagLabel)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {buildSignals(verif).map((signal) => (
          <div
            key={signal.label}
            className="rounded-xl border border-border bg-background/25 p-3"
          >
            <div className="flex items-center gap-2">
              {getSignalIcon(signal.tone)}
              <span className="text-sm font-medium text-foreground">
                {signal.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {signal.detail ?? "Aucun détail supplémentaire"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProviderMetaCard({ verif }: { verif: CaseVerification }) {
  const result = getVerificationResult(verif);
  const provider = result?.Provider;
  const warnings = result?.Warnings ?? [];
  const failureReasons = result?.FailureReasons ?? [];
  const matchedLists = result?.AML?.matchedLists ?? [];

  return (
    <div className="rounded-2xl border border-border bg-panel-strong p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">
        Informations techniques
      </p>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
        {[
          {
            label: "Service utilisé",
            val:
              provider?.name === "fake-smile"
                ? "Simulation interne"
                : provider?.name ?? "Service compatible Smile",
          },
          {
            label: "Mode",
            val: getReadableLabel(provider?.mode, providerModeLabel),
          },
          {
            label: "Cas simulé",
            val: getReadableLabel(provider?.scenario, providerScenarioLabel),
          },
          {
            label: "Référence technique",
            val: verif.smileJobId ?? result?.SmileJobID ?? "—",
          },
          {
            label: "Produit",
            val:
              providerProductLabel[verif.product ?? ""] ?? verif.product ?? "—",
          },
          {
            label: "Type de contrôle",
            val: getJobTypeLabel(provider?.jobType ?? verif.rawResult?.jobType),
          },
          { label: "Code retour", val: result?.ResultCode ?? "—" },
          {
            label: "Source officielle",
            val:
              (provider?.authorityVerified ??
              verif.rawResult?.authorityVerified)
                ? "Oui"
                : "Non",
          },
          {
            label: "Traité le",
            val: verif.updatedAt ? formatDateTimeLong(verif.updatedAt) : "—",
          },
        ].map(({ label, val }) => (
          <div key={label}>
            <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground/60">
              {label}
            </dt>
            <dd className="mt-0.5 break-words text-sm font-medium text-foreground">
              {val}
            </dd>
          </div>
        ))}
      </dl>

      {warnings.length > 0 ||
      failureReasons.length > 0 ||
      matchedLists.length > 0 ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {warnings.length > 0 ? (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                Points à vérifier
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-50">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {failureReasons.length > 0 ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                Motifs
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-50">
                {failureReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {matchedLists.length > 0 ? (
            <div className="rounded-xl border border-border bg-background/25 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Listes AML touchées
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {matchedLists.map((list) => (
                  <Badge
                    key={list}
                    variant="outline"
                    className="border-red-500/20 bg-red-500/10 text-red-300"
                  >
                    {list}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ComparisonStatus({ match }: { match: boolean | null }) {
  if (match === null) {
    return (
      <Badge variant="outline" className={getSignalBadgeClass("unknown")}>
        Incomplet
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={getSignalBadgeClass(match ? "pass" : "fail")}
    >
      {match ? "Concorde" : "Écart"}
    </Badge>
  );
}

function IdentityComparisonCard({
  formData,
  verif,
}: {
  formData: CaseFormData;
  verif: CaseVerification | null;
}) {
  const rows = [
    {
      label: "Prénom",
      declared: formData.firstName,
      verified: verif ? getExtractedField(verif, "firstName") : undefined,
      format: (value: string | undefined | null) => value ?? "—",
    },
    {
      label: "Nom",
      declared: formData.lastName,
      verified: verif ? getExtractedField(verif, "lastName") : undefined,
      format: (value: string | undefined | null) => value ?? "—",
    },
    {
      label: "Date de naissance",
      declared: formData.dateOfBirth,
      verified: verif ? getExtractedField(verif, "dateOfBirth") : undefined,
      format: formatMaybeDate,
    },
    {
      label: "Pays",
      declared: formData.country,
      verified: verif ? getExtractedField(verif, "country") : undefined,
      format: (value: string | undefined | null) => value ?? "—",
    },
    {
      label: "Type document",
      declared: formData.idType,
      verified: verif ? getExtractedField(verif, "idType") : undefined,
      format: (value: string | undefined | null) => value ?? "—",
    },
    {
      label: "N° document",
      declared: formData.idNumber,
      verified: verif ? getExtractedField(verif, "idNumber") : undefined,
      format: (value: string | undefined | null) => value ?? "—",
    },
  ];

  const result = verif ? getVerificationResult(verif) : undefined;

  return (
    <div className="rounded-2xl border border-border bg-panel-strong p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Identité déclarée vs vérifiée
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Permet de distinguer la saisie opérateur des données réellement
            extraites ou retournées par le service de contrôle.
          </p>
        </div>
        {result?.Document?.expiryStatus ? (
          <Badge
            variant="outline"
            className={
              result.Document.expiryStatus === "EXPIRED"
                ? "border-red-500/20 bg-red-500/10 text-red-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
            }
          >
            {result.Document.expiryStatus === "EXPIRED"
              ? "Document expiré"
              : `Expiration ${formatMaybeDate(result.ExpirationDate)}`}
          </Badge>
        ) : null}
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Champ</TableHead>
              <TableHead>Déclaré</TableHead>
              <TableHead>Vérifié</TableHead>
              <TableHead className="text-right">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const match = valuesMatch(row.declared, row.verified);
              return (
                <TableRow key={row.label}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>{row.format(row.declared)}</TableCell>
                  <TableCell>{row.format(row.verified)}</TableCell>
                  <TableCell className="text-right">
                    <ComparisonStatus match={match} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SourceEvidenceCard({ verif }: { verif: CaseVerification }) {
  const result = getVerificationResult(verif);
  const cards = [
    {
      label: "Selfie",
      available: Boolean(verif.selfiePhotoUrl),
      icon: <Eye className="size-4" />,
    },
    {
      label: "Document",
      available: Boolean(verif.cniPhotoUrl),
      icon: <FileSearch className="size-4" />,
    },
    {
      label: "Photo extraite",
      available: Boolean(result?.Photo),
      icon: <Eye className="size-4" />,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-panel-strong p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">
        Éléments disponibles
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-background/25 p-3"
          >
            <div className="flex items-center gap-2 text-foreground">
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.available
                ? "Disponible dans les données du contrôle"
                : "Non disponible pour ce dossier"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CaseDetailClient({ caseId }: { caseId: string }) {
  const workspace = useCurrentWorkspace();
  const router = useRouter();
  const { data: c, isLoading } = useCase(workspace.id, caseId);
  const deleteCase = useDeleteCase(workspace.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    await deleteCase.mutateAsync(caseId);
    router.back();
  };

  const reportUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/workspaces/${workspace.id}/cases/${caseId}/report`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Chargement…
      </div>
    );
  }

  if (!c) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        Dossier introuvable.
      </div>
    );
  }

  const detail = c as CaseDetail;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link
          href="/dashboard/cases"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={13} />
          Retour aux dossiers
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-lg font-bold text-foreground">
              {detail.reference}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Créé le {formatDateTimeLong(detail.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CaseStatusBadge status={detail.status} />
            <Button variant="outline" size="sm" asChild>
              <a href={reportUrl} download>
                <Download size={13} />
                PDF
              </a>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      </div>

      {detail.verification ? (
        <>
          <VerificationSummaryCard verif={detail.verification} />
          <ProviderMetaCard verif={detail.verification} />
          <SourceEvidenceCard verif={detail.verification} />
        </>
      ) : null}

      {detail.formData ? (
        <IdentityComparisonCard
          formData={detail.formData}
          verif={detail.verification}
        />
      ) : null}

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer le dossier"
        description={
          <>
            Le dossier{" "}
            <span className="font-mono font-semibold">{detail.reference}</span>{" "}
            sera définitivement supprimé avec toutes ses données de
            vérification. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
        loading={deleteCase.isPending}
        onConfirm={handleDelete}
      />

      {detail.stepHistory.length > 0 && (
        <div className="rounded-2xl border border-border bg-panel-strong p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">
            Historique
          </p>
          <ol className="space-y-3">
            {detail.stepHistory.map((h) => (
              <li key={h.id} className="flex gap-3 text-sm">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-[#2563eb]" />
                <div>
                  <span className="font-medium text-foreground">
                    {h.action}
                  </span>
                  {h.actor && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {h.actor.fullName}
                    </span>
                  )}
                  {h.comment && (
                    <p className="mt-0.5 text-muted-foreground">{h.comment}</p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground/50">
                    {formatDateTimeMedium(h.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
