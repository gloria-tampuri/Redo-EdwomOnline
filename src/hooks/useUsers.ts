import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AuthUser } from "./useAuth";

export interface User extends AuthUser {
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  isEmailVerified?: boolean;
}

export const useUsers = () => {
  const queryClient = useQueryClient();

  // Fetch all users
  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to fetch users");
      }
      const data = await res.json();
      return data.users || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<User> }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete user");
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  return {
    users,
    isLoading,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
  };
};
