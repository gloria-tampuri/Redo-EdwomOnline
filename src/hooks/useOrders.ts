import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Order } from '@/types/order';

export const useOrders = () => {
  const queryClient = useQueryClient();

  // Fetch all orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await fetch('/api/orders');
      if (!res.ok) throw new Error('Failed to fetch orders');
      return res.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  });

  // Create order mutation
  const createOrder = useMutation({
    mutationFn: async (data: Order) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Order created successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['orders'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create order');
    },
  });

  // Update order mutation
  const updateOrder = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Order }) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update order');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Order updated successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['orders'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update order');
    },
  });

  // Delete order mutation
  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Order deleted successfully');
      queryClient.invalidateQueries({ 
        queryKey: ['orders'],
        refetchType: 'active',
      });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete order');
    },
  });

  return {
    orders,
    isLoading,
    createOrder,
    updateOrder,
    deleteOrder,
  };
};
