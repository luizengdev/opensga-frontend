import {useEffect, useMemo, useState} from "react";

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50] as const;

export const useClientPagination = <T,>({
  items,
  initialPageSize = 10,
  resetKey,
}: {
  items: T[];
  initialPageSize?: number;
  resetKey?: string | number;
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setPage(1);
  };

  return {
    page: currentPage,
    pageCount,
    pageItems,
    pageSize,
    setPage,
    setPageSize,
    totalItems: items.length,
  };
};
