"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Search,
  Filter,
  Download,
  Plus,
  MoreVertical,
  ChevronUp,
  ListFilter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ItemDetailsDrawer from "./ItemDetailsDrawer";
import { useItems } from "@/hooks/useItems";
import NoItem from "@/components/svgs/no-item";
import { TablePagination } from "./TablePagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DataTable } from "./DataTable";

interface Item {
  _id: string;
  name: string;
  category:
    | {
        _id: string;
        name: string;
      }
    | string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: "In Stock" | "Out of Stock" | "Low Stock";
  image?: string;
  lastUpdated: string;
}

type DrawerMode = "create" | "view" | "edit";

const ItemsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const { items, isLoading, deleteItem } = useItems();

  // Normalize item data for the drawer (convert nested objects to IDs)
  const normalizeItem = (item: Item): Item => {
    return {
      ...item,
      category:
        typeof item.category === "object" ? item.category._id : item.category,
      unit: typeof item.unit === "object" ? (item.unit as any)._id : item.unit,
    };
  };

  // Filter items based on search and status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const categoryName =
        typeof item.category === "object" ? item.category?.name : item.category;
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (categoryName?.toLowerCase() || "").includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Table columns
  const columns: ColumnDef<Item>[] = [
    {
      accessorKey: "image",
      header: "Image",
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
      accessorKey: "name",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Item Name
          {column.getIsSorted() && (
            <ChevronUp
              className={`w-4 h-4 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        const categoryName =
          typeof category === "object" ? category?.name : category;
        return <span className="text-gray-600">{categoryName || "-"}</span>;
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Price(₵)
          {column.getIsSorted() && (
            <ChevronUp
              className={`w-4 h-4 ${
                column.getIsSorted() === "desc" ? "rotate-180" : ""
              }`}
            />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-gray-900 font-medium">
          ₵{row.original.price.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span className="text-gray-900">{row.original.stock}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const statusColors = {
          "In Stock": "bg-green-100 text-green-800",
          "Out of Stock": "bg-red-100 text-red-800",
          "Low Stock": "bg-yellow-100 text-yellow-800",
        };
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColors[row.original.status]
            }`}
          >
            {row.original.status}
          </span>
        );
      },
    },
    {
      accessorKey: "lastUpdated",
      header: "Last Updated",
      cell: ({ row }) => (
        <span className="text-gray-600 text-sm">
          {new Date(row.original.lastUpdated).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(normalizeItem(row.original));
                  setDrawerMode("view");
                  setShowDetails(true);
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedItem(normalizeItem(row.original));
                  setDrawerMode("edit");
                  setShowDetails(true);
                }}
              >
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setItemToDelete(row.original);
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
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex-1 w-[400px] relative">
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
                <ListFilter className="w-4 h-4" />
                Status
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("In Stock")}>
                In Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Low Stock")}>
                Low Stock
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Out of Stock")}>
                Out of Stock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setSelectedItem(null);
              setDrawerMode("create");
              setShowDetails(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="items"
      />

      {/* Pagination */}
      <TablePagination table={table} totalItems={filteredItems.length} />

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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Item"
        itemName={itemToDelete?.name}
        onConfirm={() => {
          if (itemToDelete) {
            deleteItem.mutate(itemToDelete._id!);
            setShowDeleteConfirm(false);
            setItemToDelete(null);
          }
        }}
        isLoading={deleteItem.isPending}
      />
    </div>
  );
};

export default ItemsPage;
