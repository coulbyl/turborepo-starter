"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useCases } from "@/domains/case/use-cases/get-cases";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import type { CaseStatus } from "@/domains/case/types/case";
import { CaseStatusBadge } from "./case-status-badge";

const STATUS_FILTERS: { label: string; value: CaseStatus | undefined }[] = [
  { label: "Tous", value: undefined },
  { label: "En attente", value: "PENDING" },
  { label: "En révision", value: "IN_REVIEW" },
  { label: "Approuvés", value: "APPROVED" },
  { label: "Refusés", value: "REJECTED" },
];

export function CasesListClient() {
  const workspace = useCurrentWorkspace();
  const [status, setStatus] = useState<CaseStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useCases({
    workspaceId: workspace.id,
    status,
    search: search || undefined,
    page,
    limit: 20,
  });

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setStatus(f.value);
                setPage(1);
              }}
              className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                status === f.value
                  ? "border-[#2563eb] bg-[#2563eb]/8 text-[#2563eb]"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
          <input
            type="text"
            placeholder="Référence, nom…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-border bg-background py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 sm:w-56"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-panel-strong">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Chargement…
          </div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-medium text-foreground">Aucun dossier</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Créez votre premier dossier pour commencer.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Référence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Sujet
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">
                  Pays / Document
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Statut
                </th>
                <th className="hidden px-4 py-3 text-right text-xs font-medium text-muted-foreground md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.items.map((c) => (
                <tr
                  key={c.id}
                  className="group transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="font-mono text-xs font-semibold text-[#2563eb] hover:underline"
                    >
                      {c.reference}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {c.formData
                      ? `${c.formData.firstName} ${c.formData.lastName}`
                      : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {c.formData ? (
                      <span>
                        {c.formData.country}{" "}
                        <span className="text-muted-foreground/50">·</span>{" "}
                        {c.formData.idType}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <CaseStatusBadge status={c.status} />
                  </td>
                  <td className="hidden px-4 py-3 text-right text-xs text-muted-foreground md:table-cell">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > data.limit && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {data.total} dossier{data.total > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
