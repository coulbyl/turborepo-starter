"use client";

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@identis/ui/components/button";
import { Input } from "@identis/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@identis/ui/components/table";
import { TablePagination } from "@/components/table-pagination";
import { useCases } from "@/domains/case/use-cases/get-cases";
import { useCurrentWorkspace } from "@/domains/workspace/context/current-workspace-context";
import type { CaseStatus } from "@/domains/case/types/case";
import { ID_TYPE_LABEL } from "@/domains/case/constants";
import { CaseStatusBadge } from "./case-status-badge";
import { COUNTRY_MAP } from "@/lib/countries";
import { formatDateNumeric } from "@/lib/date";

const STATUS_FILTERS: { label: string; value: CaseStatus | undefined }[] = [
  { label: "Tous", value: undefined },
  { label: "En attente", value: "PENDING" },
  { label: "En révision", value: "IN_REVIEW" },
  { label: "Approuvés", value: "APPROVED" },
  { label: "Refusés", value: "REJECTED" },
  { label: "Expirés", value: "EXPIRED" },
  { label: "Échoués", value: "FAILED" },
];

export function CasesListClient() {
  const workspace = useCurrentWorkspace();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") as CaseStatus) || undefined;
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) params.set(key, value);
        else params.delete(key);
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const { data, isLoading } = useCases({
    workspaceId: workspace.id,
    status,
    search: search || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.label}
              variant={status === f.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setParams({ status: f.value, page: undefined })
              }
            >
              {f.label}
            </Button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50"
          />
          <Input
            type="text"
            placeholder="Référence, nom…"
            value={search}
            onChange={(e) =>
              setParams({ search: e.target.value || undefined, page: undefined })
            }
            className="pl-8 sm:w-56"
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Sujet</TableHead>
                <TableHead className="hidden sm:table-cell">
                  Pays / Document
                </TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden text-right md:table-cell">
                  Date
                </TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/cases/${c.id}`)}
                >
                  <TableCell>
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="font-mono text-xs font-semibold text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.reference}
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {c.formData
                      ? `${c.formData.firstName} ${c.formData.lastName}`
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {c.formData ? (
                      <span>
                        {COUNTRY_MAP[c.formData.country]}{" "}
                        <span className="text-muted-foreground/50">·</span>{" "}
                        {ID_TYPE_LABEL[c.formData.idType] ?? c.formData.idType}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <CaseStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="hidden text-right text-xs text-muted-foreground md:table-cell">
                    {formatDateNumeric(c.createdAt)}
                  </TableCell>
                  <TableCell className="w-8 text-right">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ChevronRight
                        size={15}
                        className="text-muted-foreground/50 transition-colors group-hover:text-foreground"
                      />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      <TablePagination
        page={page}
        total={data?.total ?? 0}
        limit={data?.limit ?? 20}
        onPageChange={(p) => setParams({ page: p > 1 ? String(p) : undefined })}
        itemLabel="dossier"
      />
    </div>
  );
}
