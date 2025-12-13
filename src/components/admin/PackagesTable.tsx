'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { Search, Filter, Plus, MoreVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PackageDetailsDrawer from './PackageDetailsDrawer';
import { usePackages, Package } from '@/hooks/usePackages';
import NoItem from '@/components/svgs/no-item';
import { TablePagination } from './TablePagination';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DataTable } from './DataTable';

type DrawerMode = 'create' | 'view' | 'edit';

const PackagesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('view');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  const { packages, isLoading, isError, error, deletePackage } = usePackages();

  // Filter packages based on search and status
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || pkg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [packages, searchTerm, statusFilter]);

  // Table columns
  const columns: ColumnDef<Package>[] = [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }) => (
        <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
          {row.original.image ? (
            <img src={row.original.image} alt={row.original.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400">N/A</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Package Name
          {column.getIsSorted() === 'asc' && <ChevronUp className="w-4 h-4" />}
          {column.getIsSorted() === 'desc' && <ChevronDown className="w-4 h-4" />}
        </div>
      ),
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'items',
      header: 'Items Count',
      cell: ({ row }) => <span>{row.original.items.length}</span>,
    },
    {
      accessorKey: 'price',
      header: 'Total Price',
      cell: ({ row }) => <span>₵{(row.getValue('price') as number).toLocaleString()}</span>,
    },
    {
      accessorKey: 'discount',
      header: 'Discount',
      cell: ({ row }) => <span>₵{((row.original.discount || 0)).toLocaleString()}</span>,
    },
    {
      id: 'priceAfterDiscount',
      header: 'Final Price',
      cell: ({ row }) => {
        const itemsTotal = row.original.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const finalPrice = itemsTotal - (row.original.discount || 0);
        return <span className="font-semibold">₵{finalPrice.toLocaleString()}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.original.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date Created',
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt || '');
        return <span>{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedPackage(row.original);
                setDrawerMode('view');
                setShowDetails(true);
              }}
            >
              View details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedPackage(row.original);
                setDrawerMode('edit');
                setShowDetails(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setPackageToDelete(row.original);
                setShowDeleteConfirm(true);
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredPackages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleDeletePackage = async () => {
    if (packageToDelete?._id) {
      await deletePackage.mutateAsync(packageToDelete._id);
      setShowDeleteConfirm(false);
      setPackageToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Create Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Packages</h1>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex justify-between">
        <div className='flex gap-4'>
          <div className="flex-1 w-[400px] relative">
          <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search category name ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
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
            setSelectedPackage(null);
            setDrawerMode('create');
            setShowDetails(true);
          }}
          className="bg-[#556B2F] hover:bg-[#556B2F]/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && packages.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F]" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-64 text-red-600">
          <p className="text-center">{error?.message || 'Failed to load packages'}</p>
        </div>
      ) : (
        <>
          {/* Table or No Items Message */}
          {filteredPackages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <NoItem />
              <p className="mt-4 text-gray-500">No packages found</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg p-4 bg-white overflow-hidden">
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
                    {table.getRowModel().rows.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="px-6 py-4 text-center">
                          No packages found
                        </td>
                      </tr>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-t hover:bg-gray-50">
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
              <TablePagination table={table} totalItems={filteredPackages.length} />
            </>
          )}
        </>
      )}

      {/* Drawer for viewing/editing */}
      <PackageDetailsDrawer
        pkg={selectedPackage}
        isOpen={showDetails}
        onClose={() => {
          setShowDetails(false);
          setSelectedPackage(null);
        }}
        mode={drawerMode}
        onSuccess={() => {
          setShowDetails(false);
          setSelectedPackage(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeletePackage}
        title="Delete Package"
        description={`Are you sure you want to delete "${packageToDelete?.name}"? This action cannot be undone.`}
        isLoading={deletePackage.isPending}
      />
    </div>
  );
};

export default PackagesTable;
