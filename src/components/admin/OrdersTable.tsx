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
  ChevronDown,
  FilterXIcon,
  FilterIcon,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Order } from "@/types/order";
import OrderDetailsDrawer from "./OrderDetailsDrawer";
import { useOrders } from "@/hooks/useOrders";
import NoItem from "@/components/svgs/no-item";
import { TablePagination } from "./TablePagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DataTable } from "./DataTable";

type DrawerMode = "create" | "view" | "edit";

const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>("view");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const { orders, isLoading, deleteOrder } = useOrders();

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // If no search term, match all orders
      if (!searchTerm) {
        const matchesStatus = !statusFilter || order.status === statusFilter;
        return matchesStatus;
      }

      // Search across multiple fields
      const matchesSearch =
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm) ||
        order.customer?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        false;

      const matchesStatus = !statusFilter || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Table columns
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderId",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Order ID
          {column.getIsSorted() === "asc" && <ChevronUp className="w-4 h-4" />}
          {column.getIsSorted() === "desc" && (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("orderId") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Customer",
      cell: ({ row }) => row.original.customer?.name || "N/A",
    },
    {
      accessorKey: "items",
      header: "Items",
      cell: ({ row }) => `${row.original.items.length} items`,
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount",
      cell: ({ row }) => {
        const totalAmount = row.getValue<number | undefined>("totalAmount");
        const total = row.original.total;
        const amount = totalAmount ?? total ?? 0;
        return `₵${amount.toLocaleString()}`;
      },
    },
    {
      accessorKey: "deliveryLocation",
      header: "Delivery Location",
      cell: ({ row }) => row.getValue("deliveryLocation"),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : status === "Processing"
                  ? "bg-blue-100 text-blue-800"
                  : status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "orderDate",
      header: "Order Date",
      cell: ({ row }) => {
        const orderDate = row.getValue("orderDate");
        const createdAt = row.original.createdAt;
        const dateToUse = orderDate || createdAt;
        if (!dateToUse) return "N/A";
        return new Date(dateToUse).toLocaleDateString();
      },
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
                  setSelectedOrder(row.original);
                  setDrawerMode("view");
                  setShowDetails(true);
                }}
              >
                View details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOrder(row.original);
                  setDrawerMode("edit");
                  setShowDetails(true);
                }}
              >
                Edit Order
              </DropdownMenuItem>
              <DropdownMenuItem>Print Invoice</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  setOrderToDelete(row.original);
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
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex-1 w-[400px] relative">
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
              <Button variant="outline" className="gap-3">
                <ListFilter className="w-4 h-4" />
                Status
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Processing")}>
                Processing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Cancelled")}>
                Cancelled
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
              setSelectedOrder(null);
              setDrawerMode("create");
              setShowDetails(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Order
          </Button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="orders"
      />

      {/* Pagination */}
      <TablePagination table={table} totalItems={filteredOrders.length} />

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

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Order"
        itemName={
          orderToDelete?.orderId || `Order #${orderToDelete?._id?.slice(-8)}`
        }
        onConfirm={() => {
          if (orderToDelete?._id) {
            deleteOrder.mutate(orderToDelete._id);
            setShowDeleteConfirm(false);
            setOrderToDelete(null);
          }
        }}
        isLoading={deleteOrder.isPending}
      />
    </div>
  );
};

export default OrdersPage;
