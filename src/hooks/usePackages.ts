import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PackageItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Package {
  _id?: string;
  name: string;
  description: string;
  items: PackageItem[];
  price: number;
  status: 'active' | 'inactive';
  youtubeUrl?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const usePackages = () => {
  const queryClient = useQueryClient();

  // Fetch all packages
  const { data: packages = [], isLoading, isError, error } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/packages');
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || 'Failed to fetch packages');
        }
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      } catch (err) {
        console.error('Error fetching packages:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });

  // Create package mutation
  const createPackage = useMutation({
    mutationFn: async (data: Package) => {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create package');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Package created successfully');
      queryClient.invalidateQueries({
        queryKey: ['packages'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create package');
    },
  });

  // Update package mutation
  const updatePackage = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Package }) => {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update package');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Package updated successfully');
      queryClient.invalidateQueries({
        queryKey: ['packages'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update package');
    },
  });

  // Delete package mutation
  const deletePackage = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete package');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Package deleted successfully');
      queryClient.invalidateQueries({
        queryKey: ['packages'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete package');
    },
  });

  return {
    packages,
    isLoading,
    isError,
    error,
    createPackage,
    updatePackage,
    deletePackage,
  };
};
