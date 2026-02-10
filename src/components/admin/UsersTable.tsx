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
  MoreVertical,
  ChevronUp,
  ListFilter,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, useUsers } from "@/hooks/useUsers";
import { TablePagination } from "./TablePagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { DataTable } from "./DataTable";

const UsersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { users, isLoading, deleteUser } = useUsers();

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;

      const matchesRole = !roleFilter || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "email",
      header: ({ column }) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          {column.getIsSorted() === "asc" && <ChevronUp className="w-4 h-4" />}
          {column.getIsSorted() === "desc" && (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("email") || "N/A"}</span>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.getValue("name") || "N/A",
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              role === "admin"
                ? "bg-purple-100 text-purple-800"
                : role === "super-admin"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
            }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "isEmailVerified",
      header: "Email Verified",
      cell: ({ row }) => {
        const verified = row.getValue("isEmailVerified") as boolean;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              verified
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {verified ? "Verified" : "Pending"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string;
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setUserToDelete(user);
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: filteredUsers,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleDeleteConfirm = async () => {
    if (userToDelete?._id) {
      await deleteUser(userToDelete._id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <div className="flex-1 w-[400px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-gray-200 pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ListFilter className="w-4 h-4" />
                Role
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRoleFilter("")}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("user")}>
                User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("admin")}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("super-admin")}>
                Super Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="users"
      />

      {/* Pagination */}
      <TablePagination table={table} totalItems={filteredUsers.length} />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete User"
        description={`Are you sure you want to delete ${userToDelete?.email}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UsersTable;
