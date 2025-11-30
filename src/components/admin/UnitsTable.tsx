'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { Trash2, MoreVertical, Plus, Search, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UnitDetailsDrawer from './UnitDetailsDrawer';
import { Unit } from '@/types/categories-units';

export default function UnitsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view' | 'edit'>('view');
  const queryClient = useQueryClient();

  const { data: units = [], isLoading } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await fetch('/api/units');
      if (!res.ok) throw new Error('Failed to fetch units');
      return res.json();
    },
  });

  // Filter units based on search
  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/units/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete unit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
    },
  });

  const handleCreate = () => {
    setSelectedUnit(null);
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const handleView = (unit: Unit) => {
    setSelectedUnit(unit);
    setDrawerMode('view');
    setIsDrawerOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const columns: ColumnDef<Unit>[] = [
    {
      accessorKey: 'name',
      header: 'Unit Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'abbreviation',
      header: 'Short Code',
      cell: ({ row }) => (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">
          {row.getValue('abbreviation')}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="text-gray-600 text-sm">{row.getValue('description') || '-'}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => {
        const date = new Date(row.getValue('createdAt') as string);
        return <span className="text-gray-600 text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row.original)}
            className="text-xs"
          >
            View
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original._id!)}
                disabled={deleteMutation.isPending}
                className="text-red-600"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredUnits,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Units</h1>
        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
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
                  Loading units...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">No units added</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
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

      {/* Pagination */}
      {table.getRowModel().rows.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filteredUnits.length
            )} of {filteredUnits.length} units
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
            {Array.from({ length: table.getPageCount() }).map((_, i) => {
              const pageIndex = table.getState().pagination.pageIndex;
              const pageCount = table.getPageCount();
              
              const isVisible = 
                i === 0 ||
                i === pageCount - 1 ||
                (i >= pageIndex - 1 && i <= pageIndex + 1);

              if (!isVisible && i !== 1 && i !== pageCount - 2) {
                return null;
              }

              if ((i === 1 && pageIndex > 2) || (i === pageCount - 2 && pageIndex < pageCount - 3)) {
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
      )}

      {/* Drawer */}
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mode={drawerMode}
        onSuccess={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
