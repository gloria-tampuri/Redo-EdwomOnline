import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Category } from '@/types/categories-units';

export const useCategories = () => {
  const queryClient = useQueryClient();

  // Fetch all categories (including inactive for admin)
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', 'all'],
    queryFn: async () => {
      const res = await fetch('/api/categories?all=true');
      if (!res.ok) throw new Error('Failed to fetch categories');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: Category) => {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create category');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Category created successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['categories'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Update category mutation
  const updateCategory = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Category }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update category');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Category updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['categories'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  // Delete category mutation
  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Category deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['categories'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete category');
    },
  });

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
