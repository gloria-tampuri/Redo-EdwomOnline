import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Item {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image?: string;
  lastUpdated: string;
}

export const useItems = () => {
  const queryClient = useQueryClient();

  // Fetch all items
  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Create item mutation
  const createItem = useMutation({
    mutationFn: async (data: Item) => {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create item');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Item created successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['items'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create item');
    },
  });

  // Update item mutation
  const updateItem = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Item }) => {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to update item');
      }
      return res.json();
    },
    onSuccess: () => {
      toast.success('Item updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['items'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update item');
    },
  });

  // Delete item mutation
  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete item');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Item deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['items'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });

  return {
    items,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
  };
};
