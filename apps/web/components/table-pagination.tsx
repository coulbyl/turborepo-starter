"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@identis/ui/components/pagination";

interface TablePaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  /** Singular label, e.g. "dossier" → "3 dossiers" */
  itemLabel?: string;
}

export function TablePagination({
  page,
  total,
  limit,
  onPageChange,
  itemLabel = "élément",
}: TablePaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (total <= limit) return null;

  const plural = total > 1 ? `${itemLabel}s` : itemLabel;

  return (
    <div className="flex items-center justify-between">
      <p className="text-xs text-muted-foreground">
        {total} {plural}
      </p>
      <Pagination className="w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Précédent"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className={page === 1 ? "pointer-events-none opacity-40" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 text-xs text-muted-foreground">
              {page} / {totalPages}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              text="Suivant"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className={
                page === totalPages ? "pointer-events-none opacity-40" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
