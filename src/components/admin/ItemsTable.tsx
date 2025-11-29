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
import { Search, Filter, Download, Plus, MoreVertical, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ItemDetailsDrawer from './ItemDetailsDrawer';

interface Item {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image?: string;
  lastUpdated: string;
}

type DrawerMode = 'create' | 'view' | 'edit';

const ItemsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('view');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const queryClient = useQueryClient();

  // Fetch items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/items/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Filter items based on search and status
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || item.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Table columns
  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.image ? (
            <img
              src={row.original.image}
              alt={row.original.name}
              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-200" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Item Name
          {column.getIsSorted() && (
            <ChevronUp className={`w-4 h-4 ${column.getIsSorted() === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      ),
      cell: ({ row }) => <span className="font-medium text-gray-900">{row.original.name}</span>,
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => <span className="text-gray-600">{row.original.category}</span>,
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Price(₵)
          {column.getIsSorted() && (
            <ChevronUp className={`w-4 h-4 ${column.getIsSorted() === 'desc' ? 'rotate-180' : ''}`} />
          )}
        </div>
      ),
      cell: ({ row }) => <span className="text-gray-900 font-medium">₵{row.original.price.toLocaleString()}</span>,
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }) => <span className="text-gray-900">{row.original.stock}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusColors = {
          'In Stock': 'bg-green-100 text-green-800',
          'Out of Stock': 'bg-red-100 text-red-800',
          'Low Stock': 'bg-yellow-100 text-yellow-800',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}>
            {row.original.status}
          </span>
        );
      },
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.original.lastUpdated).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setSelectedItem(row.original);
                setDrawerMode('view');
                setShowDetails(true);
              }}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedItem(row.original);
                setDrawerMode('edit');
                setShowDetails(true);
              }}>
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this item?')) {
                    deleteItemMutation.mutate(row.original._id);
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

  // Create table instance
  const table = useReactTable({
    data: filteredItems,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        <Button 
          onClick={() => {
            setSelectedItem(null);
            setDrawerMode('create');
            setShowDetails(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search Item Name or Category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-gray-200 pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('')}>
              All Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('In Stock')}>
              In Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Low Stock')}>
              Low Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Out of Stock')}>
              Out of Stock
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  Loading items...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">No items added</p>
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                  {row.getVisibleCells().map(cell => (
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
              filteredItems.length
            )} of {filteredItems.length} logs
          </p>
          
          {/* Pagination */}
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

      {/* Item Details Drawer */}
      <ItemDetailsDrawer
        item={selectedItem}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        mode={drawerMode}
        onSuccess={() => {
          setShowDetails(false);
        }}
      />
    </div>
  );
};

export default ItemsPage;
