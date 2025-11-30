'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, OrderItem, InventoryItem } from '@/types/order';

type DrawerMode = 'create' | 'view' | 'edit';

interface OrderDetailsDrawerProps {
  order?: Order | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

const OrderDetailsDrawer = ({ order, isOpen, onClose, mode: initialMode = 'view', onSuccess }: OrderDetailsDrawerProps) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [itemSearchInput, setItemSearchInput] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [formData, setFormData] = useState<Order>(order || {
    orderId: '',
    customer: { name: '', phone: '', email: '', address: '' },
    items: [],
    totalAmount: 0,
    deliveryLocation: '',
    status: 'Pending',
    orderDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Unpaid',
    discount: 0,
    deliveryFee: 0,
    tax: 0,
  });
  const queryClient = useQueryClient();

  // Fetch available items from inventory
  const { data: availableItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
  });

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!itemSearchInput.trim()) return availableItems;
    return availableItems.filter(item =>
      item.name.toLowerCase().includes(itemSearchInput.toLowerCase()) ||
      item.category?.toLowerCase().includes(itemSearchInput.toLowerCase())
    );
  }, [availableItems, itemSearchInput]);

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (order) {
      setFormData(order);
      setMode(initialMode);
    } else {
      setMode('create');
      setFormData({
        orderId: generateOrderId(),
        customer: { name: '', phone: '', email: '', address: '' },
        items: [],
        totalAmount: 0,
        deliveryLocation: '',
        status: 'Pending',
        orderDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'Unpaid',
        discount: 0,
        deliveryFee: 0,
        tax: 0,
      });
    }
  }, [order, initialMode, isOpen]);

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: async (data: Order) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create order');
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      onSuccess?.();
      onClose();
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: Order) => {
      const res = await fetch(`/api/orders/${order?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update order');
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      onSuccess?.();
      setMode('view');
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('customer.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        customer: { ...formData.customer, [field]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'paymentStatus' || name === 'status') {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    // Recalculate total when items change
    const itemsTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + (formData.tax || 0);
    setFormData({ ...formData, items: newItems, totalAmount: total });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    // Recalculate total when items are removed
    const itemsTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + (formData.tax || 0);
    setFormData({
      ...formData,
      items: updatedItems,
      totalAmount: total,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate total amount
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + (formData.tax || 0);
    
    const submitData = { ...formData, totalAmount: total };

    if (mode === 'create') {
      await createOrderMutation.mutateAsync(submitData);
    } else if (mode === 'edit') {
      await updateOrderMutation.mutateAsync(submitData);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit' || mode === 'create';

  const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = formData.discount || 0;
  const deliveryFee = formData.deliveryFee || 0;
  const tax = formData.tax || 0;
  const grandTotal = subtotal - discount + deliveryFee + tax;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>
            {mode === 'create' ? 'Add Order' : mode === 'edit' ? 'Edit Order' : 'Order Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary / Details */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {isEditing ? 'Order Details' : 'Order Summary'}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-600 block mb-1">Order ID</label>
                  <Input
                    type="text"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    disabled={isReadOnly || mode === 'create'}
                    placeholder="Enter order ID"
                  />
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Status</label>
                  {isEditing ? (
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Processing">Processing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium text-gray-900">{formData.status}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Payment Status</label>
                  {isEditing ? (
                    <Select value={formData.paymentStatus} onValueChange={(value) => handleSelectChange('paymentStatus', value)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="font-medium text-gray-900">{formData.paymentStatus}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-600 block mb-1">Order Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate.split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {new Date(formData.orderDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Info</h3>
              <div className="grid grid-cols-2 gap-4">
                {isEditing ? (
                  <>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600 block mb-1">Name</label>
                      <Input
                        type="text"
                        name="customer.name"
                        value={formData.customer.name}
                        onChange={handleInputChange}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Phone</label>
                      <Input
                        type="tel"
                        name="customer.phone"
                        value={formData.customer.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600 block mb-1">Email</label>
                      <Input
                        type="email"
                        name="customer.email"
                        value={formData.customer.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600 block mb-1">Address</label>
                      <Input
                        type="text"
                        name="customer.address"
                        value={formData.customer.address}
                        onChange={handleInputChange}
                        placeholder="Address"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-gray-600 text-xs">Name</p>
                      <p className="font-medium text-gray-900">{formData.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Phone</p>
                      <p className="font-medium text-gray-900">{formData.customer.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Email</p>
                      <p className="font-medium text-gray-900">{formData.customer.email || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 text-xs">Address</p>
                      <p className="font-medium text-gray-900">{formData.customer.address || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Location */}
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-2">Delivery Location</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleInputChange}
                  placeholder="Delivery location"
                />
              ) : (
                <p className="text-gray-900">{formData.deliveryLocation || '-'}</p>
              )}
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Items List</h3>
              </div>

              {isEditing && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="text-xs font-semibold text-gray-700 block mb-2">Search & Add Items</label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search items by name or category..."
                      value={itemSearchInput}
                      onChange={(e) => setItemSearchInput(e.target.value)}
                      onFocus={() => setShowItemDropdown(true)}
                      className="pl-8"
                    />
                    
                    {showItemDropdown && itemSearchInput && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((invItem) => (
                            <button
                              key={invItem._id}
                              type="button"
                              onClick={() => {
                                // Check if item already exists
                                const existingIndex = formData.items.findIndex(i => i._id === invItem._id);
                                if (existingIndex === -1) {
                                  // Add new item
                                  const newItems = [
                                    ...formData.items,
                                    {
                                      _id: invItem._id,
                                      name: invItem.name,
                                      price: invItem.price,
                                      quantity: 1,
                                      unit: invItem.unit,
                                      image: invItem.image,
                                    },
                                  ];
                                  // Recalculate total when item is added
                                  const itemsTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                  const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + (formData.tax || 0);
                                  setFormData({
                                    ...formData,
                                    items: newItems,
                                    totalAmount: total,
                                  });
                                }
                                setItemSearchInput('');
                                setShowItemDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-0 flex items-center gap-2"
                            >
                              {invItem.image && (
                                <img src={invItem.image} alt={invItem.name} className="w-8 h-8 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{invItem.name}</p>
                                <p className="text-xs text-gray-500">₵{invItem.price.toLocaleString()} • {invItem.unit}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No items found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items Display */}
              <div className="space-y-2">
                {formData.items.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {isEditing ? 'No items added yet. Search and select items above.' : 'No items'}
                  </p>
                ) : (
                  formData.items.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 transition">
                      <div className="flex gap-3">
                        {/* Item Image */}
                        {item.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-600">₵{item.price.toLocaleString()} per {item.unit}</p>
                          
                          {isEditing ? (
                            <div className="mt-2 flex items-center gap-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))
                                }
                                min="1"
                                className="w-16"
                              />
                              <span className="text-xs text-gray-600">
                                Qty: {item.quantity} • Subtotal: <span className="font-medium">₵{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                              </span>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-600 mt-1">
                              Qty: {item.quantity} • Subtotal: <span className="font-medium">₵{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 text-sm border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                {isEditing ? (
                  <span className="font-medium text-gray-900">₵{subtotal.toLocaleString()}</span>
                ) : (
                  <span className="font-medium text-gray-900">₵{subtotal.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => {
                      const newDiscount = parseFloat(e.target.value) || 0;
                      const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const total = itemsTotal - newDiscount + (formData.deliveryFee || 0) + (formData.tax || 0);
                      setFormData({ ...formData, discount: newDiscount, totalAmount: total });
                    }}
                    className="w-24"
                  />
                ) : (
                  <span className="font-medium text-gray-900">{discount > 0 ? `-₵${discount.toLocaleString()}` : '₵0'}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivery Fee</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={deliveryFee}
                    onChange={(e) => {
                      const newFee = parseFloat(e.target.value) || 0;
                      const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const total = itemsTotal - (formData.discount || 0) + newFee + (formData.tax || 0);
                      setFormData({ ...formData, deliveryFee: newFee, totalAmount: total });
                    }}
                    className="w-24"
                  />
                ) : (
                  <span className="font-medium text-gray-900">₵{deliveryFee.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax</span>
                {isEditing ? (
                  <Input
                    type="number"
                    value={tax}
                    onChange={(e) => {
                      const newTax = parseFloat(e.target.value) || 0;
                      const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                      const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + newTax;
                      setFormData({ ...formData, tax: newTax, totalAmount: total });
                    }}
                    className="w-24"
                  />
                ) : (
                  <span className="font-medium text-gray-900">₵{tax.toLocaleString()}</span>
                )}
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 mt-2">
                <span>Grand Total</span>
                <span>₵{grandTotal.toLocaleString()}</span>
              </div>
            </div>

          {/* Footer */}
          <DrawerFooter>
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => (mode === 'create' ? onClose() : setMode('view'))}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending || updateOrderMutation.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {createOrderMutation.isPending || updateOrderMutation.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Order'
                  )}
                </button>
              </>
            )}
            {!isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-50 text-sm"
                >
                  Edit Order
                </button>
                <button
                  type="button"
                  className="flex-1 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white px-4 py-2 rounded font-medium text-sm"
                >
                  Print Invoice
                </button>
              </>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default OrderDetailsDrawer;