'use client';

import { ChevronUp } from 'lucide-react';
import { Table } from '@tanstack/react-table';

interface TablePaginationProps<TData> {
  table: Table<TData>;
  totalItems: number;
}

export function TablePagination<TData>({
  table,
  totalItems,
}: TablePaginationProps<TData>) {
  if (table.getRowModel().rows.length === 0) {
    return null;
  }

  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = table.getPageCount();

  const startItem = pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <p className="text-xs text-gray-600">
        Showing {startItem} to {endItem} of {totalItems}
      </p>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Button */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
        >
          <ChevronUp className="w-4 h-4 text-gray-600 rotate-180" />
        </button>

        {/* Page Numbers with Smart Ellipsis */}
        {Array.from({ length: pageCount }).map((_, i) => {
          const isVisible =
            i === 0 ||
            i === pageCount - 1 ||
            (i >= pageIndex - 1 && i <= pageIndex + 1);

          if (!isVisible && i !== 1 && i !== pageCount - 2) {
            return null;
          }

          if (
            (i === 1 && pageIndex > 2) ||
            (i === pageCount - 2 && pageIndex < pageCount - 3)
          ) {
            return (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-400">
                ...
              </span>
            );
          }

          return (
            <button
              key={i}
              onClick={() => table.setPageIndex(i)}
              className={`px-2 py-1 text-xs font-medium rounded transition ${
                pageIndex === i
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {i + 1}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition"
        >
          <ChevronUp className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
