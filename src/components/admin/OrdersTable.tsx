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
import { Search, Filter, Download, Plus, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Order } from '@/types/order';
import OrderDetailsDrawer from './OrderDetailsDrawer';

type DrawerMode = 'create' | 'view' | 'edit';

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('view');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const queryClient = useQueryClient();

  // Fetch orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
  });

  // Delete order mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
    },
  });

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.orderId.includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.phone.includes(searchTerm) ||
        order.customer.email.includes(searchTerm);
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'orderId',
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Order ID
          {column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
          {column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
        </div>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('orderId')}</span>,
    },
    {
      accessorKey: 'customer.name',
      header: 'Customer',
      cell: ({ row }) => row.original.customer.name,
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => `${row.original.items.length} items`,
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => `₵${row.getValue<number>('totalAmount').toLocaleString()}`,
    },
    {
      accessorKey: 'deliveryLocation',
      header: 'Delivery Location',
      cell: ({ row }) => row.getValue('deliveryLocation'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
            status === 'Processing' ? 'bg-blue-100 text-blue-800' :
            status === 'Completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'orderDate',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.getValue('orderDate')).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
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
                setSelectedOrder(row.original);
                setDrawerMode('view');
                setShowDetails(true);
              }}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSelectedOrder(row.original);
                setDrawerMode('edit');
                setShowDetails(true);
              }}>
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuItem>Print Invoice</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this order?')) {
                    if (row.original._id) {
                      deleteOrderMutation.mutate(row.original._id);
                    }
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
    data: filteredOrders,
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
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <Button 
          onClick={() => {
            setSelectedOrder(null);
            setDrawerMode('create');
            setShowDetails(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search Order ID, Customer Name, Phone, or Email..."
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
            <DropdownMenuItem onClick={() => setStatusFilter('Pending')}>
              Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Processing')}>
              Processing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Completed')}>
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Cancelled')}>
              Cancelled
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead>
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
                  Loading orders...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0 0h5a2 2 0 002-2V8a2 2 0 00-2-2h-5m0 0V5a2 2 0 012-2h2a2 2 0 012 2v1m0 0h2m0 0V5" />
                    </svg>
                    <p className="text-gray-500 text-sm font-medium">No orders yet</p>
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
              filteredOrders.length
            )} of {filteredOrders.length} logs
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
              const maxVisible = 5;
              
              // Show first page, last page, current page, and neighbors
              const isVisible = 
                i === 0 || // First page
                i === pageCount - 1 || // Last page
                (i >= pageIndex - 1 && i <= pageIndex + 1); // Current and neighbors

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

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        mode={drawerMode}
        onSuccess={() => {
          // Refresh orders and close drawer after successful creation/update
          setShowDetails(false);
        }}
      />
    </div>
  );
};

export default OrdersPage;
