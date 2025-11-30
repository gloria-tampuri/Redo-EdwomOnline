'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Search, Filter, Plus, MoreVertical, Trash2, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Category } from '@/types/categories-units';
import CategoryDetailsDrawer from './CategoryDetailsDrawer';

interface CategoriesTableProps {
  title?: string;
}

const CategoriesTable = ({ title = 'Categories' }: CategoriesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view' | 'edit'>('view');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const queryClient = useQueryClient();

  // Fetch categories (all including inactive for admin)
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/categories?all=true');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: (info) => {
        const image = info.getValue() as string;
        return image ? (
          <img
            src={image}
            alt="Category"
            className="w-10 h-10 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-500">
            No image
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: (info) => <span className="text-gray-600">{(info.getValue() as string) || '-'}</span>,
    },
    {
      accessorKey: 'color',
      header: 'Color',
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: (info.getValue() as string) || '#556B2F' }}
          />
          <span className="text-sm text-gray-600">{(info.getValue() as string) || '#556B2F'}</span>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {status === 'active' ? 'Active' : 'Inactive'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCategory(row.original);
                  setDrawerMode('view');
                  setShowDetails(true);
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedCategory(row.original);
                  setDrawerMode('edit');
                  setShowDetails(true);
                }}
              >
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this category?')) {
                    deleteMutation.mutate(row.original._id!);
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredCategories,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setDrawerMode('create');
            setShowDetails(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
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
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">No categories added</p>
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
              filteredCategories.length
            )} of {filteredCategories.length} categories
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
      <CategoryDetailsDrawer
        category={selectedCategory}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        mode={drawerMode}
        onSuccess={() => setShowDetails(false)}
      />
    </div>
  );
};

export default CategoriesTable;
