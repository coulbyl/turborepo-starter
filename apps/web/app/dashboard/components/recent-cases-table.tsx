"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, FolderOpen } from "lucide-react";
import { Button } from "@identis/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@identis/ui/components/table";
import { formatDate } from "@/lib/date";
import { CaseStatusBadge } from "@/app/dashboard/cases/components/case-status-badge";
import type { WorkspaceStats } from "@/domains/workspace/use-cases/get-workspace-stats";

type RecentCase = WorkspaceStats["recentCases"][number];

export function RecentCasesTable({ cases }: { cases: RecentCase[] }) {
  const router = useRouter();

  if (cases.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <FolderOpen className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Aucun dossier pour l&apos;instant
        </p>
        <Button asChild size="sm">
          <Link href="/dashboard/cases/new">Créer le premier dossier</Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Sujet</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="hidden text-right md:table-cell">Date</TableHead>
          <TableHead className="w-8" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {cases.map((c) => (
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
            <TableCell className="font-medium">
              {c.formData
                ? `${c.formData.firstName} ${c.formData.lastName}`
                : "—"}
            </TableCell>
            <TableCell>
              <CaseStatusBadge status={c.status} />
            </TableCell>
            <TableCell className="hidden text-right text-xs text-muted-foreground md:table-cell">
              {formatDate(c.createdAt)}
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
  );
}
