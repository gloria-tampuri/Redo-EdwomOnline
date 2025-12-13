'use client';

import { useState, useMemo } from 'react';
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
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
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
import { useCategories } from '@/hooks/useCategories';
import NoItem from '@/components/svgs/no-item';
import { TablePagination } from './TablePagination';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DataTable } from './DataTable';

interface CategoriesTableProps {
  title?: string;
}

const CategoriesTable = ({ title = 'Categories' }: CategoriesTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view' | 'edit'>('view');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { categories, isLoading, deleteCategory } = useCategories();

  const filteredCategories = useMemo(() => {
    let filtered = categories;
    
    if (searchTerm) {
      filtered = filtered.filter((cat) =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter) {
      filtered = filtered.filter((cat) => cat.status === statusFilter);
    }
    
    return filtered;
  }, [categories, searchTerm, statusFilter]);

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
                  setCategoryToDelete(row.original);
                  setShowDeleteConfirm(true);
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
        {/* <h2 className="text-2xl font-bold text-gray-900">{title}</h2> */}
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
       <div className="flex gap-4 w-[400px]">
         <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="w-4 h-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter('')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
       </div>
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
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Loading categories...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <NoItem />
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
      <TablePagination table={table} totalItems={filteredCategories.length} />

      {/* Drawer */}
      <CategoryDetailsDrawer
        category={selectedCategory}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        mode={drawerMode}
        onSuccess={() => setShowDetails(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Category"
        itemName={categoryToDelete?.name}
        onConfirm={() => {
          if (categoryToDelete) {
            deleteCategory.mutate(categoryToDelete._id!);
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
          }
        }}
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
};

export default CategoriesTable;
