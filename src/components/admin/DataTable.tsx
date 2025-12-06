'use client';

import { flexRender, Table } from '@tanstack/react-table';
import NoItem from '@/components/svgs/no-item';

interface DataTableProps<TData> {
  table: Table<TData>;
  columns: any[];
  isLoading: boolean;
  emptyMessage: string;
}

export function DataTable<TData>({
  table,
  columns,
  isLoading,
  emptyMessage,
}: DataTableProps<TData>) {
  return (
    <div className=" rounded-lg p-4 bg-white overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#170A1108]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                Loading {emptyMessage.toLowerCase()}...
              </td>
            </tr>
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <NoItem />
                  <p className="text-gray-500 text-sm font-medium">No {emptyMessage.toLowerCase()} added</p>
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className=" hover:bg-gray-50 transition">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-4 text-sm text-gray-600">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
