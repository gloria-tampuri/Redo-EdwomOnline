import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Unit } from '@/types/categories-units';

export const useUnits = () => {
  const queryClient = useQueryClient();

  // Fetch all units
  const { data: units = [], isLoading } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: async () => {
      const res = await fetch('/api/units');
      if (!res.ok) throw new Error('Failed to fetch units');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Create unit mutation
  const createUnit = useMutation({
    mutationFn: async (data: Unit) => {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create unit');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Unit created successfully');
      // Invalidate and refetch the units query to get fresh data
      queryClient.invalidateQueries({ 
        queryKey: ['units'],
        refetchType: 'active', // Only refetch if query is currently in use
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create unit');
    },
  });

  // Update unit mutation
  const updateUnit = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Unit }) => {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update unit');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Unit updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['units'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update unit');
    },
  });

  // Delete unit mutation
  const deleteUnit = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/units/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete unit');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Unit deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['units'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete unit');
    },
  });

  return {
    units,
    isLoading,
    createUnit,
    updateUnit,
    deleteUnit,
  };
};
