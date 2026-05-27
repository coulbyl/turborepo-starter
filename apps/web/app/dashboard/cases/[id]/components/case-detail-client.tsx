"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { Button } from "@identis/ui/components/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCase } from "@/domains/case/use-cases/get-case";
import { useDeleteCase } from "@/domains/case/use-cases/delete-case";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import { CaseStatusBadge } from "../../components/case-status-badge";
import type { CaseVerification, VerifStatus } from "@/domains/case/types/case";

function VerifResultCard({ verif }: { verif: CaseVerification }) {
  const icons: Record<VerifStatus, React.ReactNode> = {
    APPROVED: <ShieldCheck className="size-5 text-emerald-500" />,
    REJECTED: <ShieldAlert className="size-5 text-red-500" />,
    PENDING: <Clock className="size-5 text-amber-500 animate-pulse" />,
    UNKNOWN: <ShieldAlert className="size-5 text-muted-foreground" />,
  };

  const labels: Record<VerifStatus, string> = {
    APPROVED: "Vérification réussie",
    REJECTED: "Vérification échouée",
    PENDING: "Vérification en cours…",
    UNKNOWN: "Résultat inconnu",
  };

  return (
    <div className="rounded-2xl border border-border bg-panel-strong p-5">
      <p className="mb-4 text-sm font-semibold text-foreground">
        Résultat biométrique
      </p>
      <div className="flex items-center gap-3">
        {icons[verif.status]}
        <span className="text-sm font-medium text-foreground">
          {labels[verif.status]}
        </span>
      </div>
      {verif.status !== "PENDING" && (
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Document valide", val: verif.documentValid },
            { label: "Face match", val: verif.faceMatch },
            {
              label: "AML",
              val: verif.amlMatch !== null ? !verif.amlMatch : null,
            },
            {
              label: "Doublon",
              val: verif.duplicateFound !== null ? !verif.duplicateFound : null,
            },
          ].map(({ label, val }) =>
            val !== null ? (
              <div key={label} className="flex items-center gap-1.5">
                {val ? (
                  <CheckCircle2 size={13} className="text-emerald-500" />
                ) : (
                  <XCircle size={13} className="text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ) : null,
          )}
        </dl>
      )}
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
    router.push("/dashboard/cases");
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
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
              {c.reference}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Créé le{" "}
              {new Date(c.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CaseStatusBadge status={c.status} />
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

      {/* Verif result */}
      {c.verification && <VerifResultCard verif={c.verification} />}

      {/* Subject info */}
      {c.formData && (
        <div className="rounded-2xl border border-border bg-panel-strong p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">
            Identité du sujet
          </p>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {[
              { label: "Prénom", val: c.formData.firstName },
              { label: "Nom", val: c.formData.lastName },
              {
                label: "Date de naissance",
                val: c.formData.dateOfBirth ?? "—",
              },
              { label: "Pays", val: c.formData.country },
              { label: "Type document", val: c.formData.idType },
              { label: "N° document", val: c.formData.idNumber ?? "—" },
            ].map(({ label, val }) => (
              <div key={label}>
                <dt className="text-[0.7rem] uppercase tracking-wide text-muted-foreground/60">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-foreground">
                  {val}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Supprimer le dossier"
        description={
          <>
            Le dossier{" "}
            <span className="font-mono font-semibold">{c.reference}</span>{" "}
            sera définitivement supprimé avec toutes ses données de
            vérification. Cette action est irréversible.
          </>
        }
        confirmLabel="Supprimer"
        loading={deleteCase.isPending}
        onConfirm={handleDelete}
      />

      {/* Timeline */}
      {c.stepHistory.length > 0 && (
        <div className="rounded-2xl border border-border bg-panel-strong p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">
            Historique
          </p>
          <ol className="space-y-3">
            {c.stepHistory.map((h) => (
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
                    {new Date(h.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
