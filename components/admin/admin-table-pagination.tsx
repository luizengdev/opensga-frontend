"use client";

import {cn} from "cn";
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "lucide-react";

import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {PAGE_SIZE_OPTIONS} from "@/lib/admin/use-client-pagination";

interface AdminTablePaginationProps {
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageCount: number;
  pageSize: number;
  totalItems: number;
}

export const AdminTablePagination = ({
  className,
  onPageChange,
  onPageSizeChange,
  page,
  pageCount,
  pageSize,
  totalItems,
}: AdminTablePaginationProps) => {
  const canPreviousPage = page > 1;
  const canNextPage = page < pageCount;
  const pageSizeItems = PAGE_SIZE_OPTIONS.map((size) => ({
    label: String(size),
    value: String(size),
  }));

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border py-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex-1 text-sm text-muted-foreground">
        {totalItems} registro{totalItems === 1 ? "" : "s"}
      </p>
      <div className="flex flex-wrap items-center gap-4 lg:gap-8">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Linhas por página</p>
          <Select
            items={pageSizeItems}
            onValueChange={(value) => {
              if (typeof value === "string" && value.length > 0) {
                onPageSizeChange(Number(value));
              }
            }}
            value={String(pageSize)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue>{() => String(pageSize)}</SelectValue>
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} label={String(size)} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="w-[110px] text-center text-sm font-medium">
          Página {page} de {pageCount}
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Primeira página"
            className="hidden lg:flex"
            disabled={!canPreviousPage}
            onClick={() => onPageChange(1)}
            size="icon"
            variant="outline"
          >
            <ChevronsLeft />
          </Button>
          <Button
            aria-label="Página anterior"
            disabled={!canPreviousPage}
            onClick={() => onPageChange(page - 1)}
            size="icon"
            variant="outline"
          >
            <ChevronLeft />
          </Button>
          <Button
            aria-label="Próxima página"
            disabled={!canNextPage}
            onClick={() => onPageChange(page + 1)}
            size="icon"
            variant="outline"
          >
            <ChevronRight />
          </Button>
          <Button
            aria-label="Última página"
            className="hidden lg:flex"
            disabled={!canNextPage}
            onClick={() => onPageChange(pageCount)}
            size="icon"
            variant="outline"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
};
