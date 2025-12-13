'use client';

import { useState, useMemo } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
} from '@tanstack/react-table';
import { Trash2, MoreVertical, Plus, Search } from 'lucide-react';
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
import { useUnits } from '@/hooks/useUnits';
import NoItem from '@/components/svgs/no-item';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DataTable } from './DataTable';
import { TablePagination } from './TablePagination';

export default function UnitsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'view' | 'edit'>('view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  const { units, isLoading, deleteUnit } = useUnits();

  // Calculate filtered units once using useMemo to avoid duplicate filtering
  const filteredUnits = useMemo(() => {
    if (!searchTerm) return units;
    return units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

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
    setUnitToDelete({ _id: id } as Unit);
    setShowDeleteConfirm(true);
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
    
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-gray-100 rounded transition">
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               <DropdownMenuItem             onClick={() => handleView(row.original)}
>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEdit(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(row.original._id!)}
                disabled={deleteUnit.isPending}
                className="text-red-600"
              >
                {deleteUnit.isPending ? 'Deleting...' : 'Delete'}
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
        {/* <h2 className="text-2xl font-bold text-gray-900">Units</h2> */}
      </div>

      {/* Search */}
      <div className="flex justify-between items-center">
        <div className='w-[400px]'>
          <div className="flex-1 relative ">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-primary hover:bg-primary/90 text-white ml-4"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
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
                  Loading units...
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <NoItem />
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
      <TablePagination table={table} totalItems={filteredUnits.length} />

      {/* Drawer */}
      <UnitDetailsDrawer
        unit={selectedUnit}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        mode={drawerMode}
        onSuccess={() => setIsDrawerOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Unit"
        itemName={unitToDelete?.name}
        onConfirm={() => {
          if (unitToDelete) {
            deleteUnit.mutate(unitToDelete._id!);
            setShowDeleteConfirm(false);
            setUnitToDelete(null);
          }
        }}
        isLoading={deleteUnit.isPending}
      />
    </div>
  );
}
