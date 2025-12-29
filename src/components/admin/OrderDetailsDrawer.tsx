'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Order, OrderItem, InventoryItem, Package } from '@/types/order';
import { useOrders } from '@/hooks/useOrders';
import { useUnits } from '@/hooks/useUnits';

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
  const [selectedTab, setSelectedTab] = useState<'items' | 'packages'>('items');
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
  
  const { createOrder, updateOrder } = useOrders();
  const { units } = useUnits();

  // Helper function to get unit name from unit ID
  const getUnitName = (unitId: string) => {
    if (!units) return unitId;
    const unit = units.find((u: any) => u._id === unitId);
    return unit?.abbreviation || unitId;
  };

  // Fetch available items from inventory
  const { data: availableItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ['items'],
    queryFn: async () => {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      return res.json();
    },
  });

  // Fetch available packages
  const { data: availablePackages = [] } = useQuery<Package[]>({
    queryKey: ['packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages');
      if (!res.ok) throw new Error('Failed to fetch packages');
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

  // Filter packages based on search
  const filteredPackages = useMemo(() => {
    if (!itemSearchInput.trim()) return availablePackages.filter(pkg => pkg.status === 'active');
    return availablePackages.filter(pkg =>
      pkg.status === 'active' && pkg.name.toLowerCase().includes(itemSearchInput.toLowerCase())
    );
  }, [availablePackages, itemSearchInput]);

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 9).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  };

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [order, initialMode, isOpen]);

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
    try {
      // Calculate total amount
      const itemsTotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const total = itemsTotal - (formData.discount || 0) + (formData.deliveryFee || 0) + (formData.tax || 0);
      
      const submitData = { ...formData, totalAmount: total };

      if (mode === 'create') {
        await createOrder.mutateAsync(submitData);
        onSuccess?.();
        onClose();
      } else if (mode === 'edit') {
        await updateOrder.mutateAsync({ id: order?._id!, data: submitData });
        onSuccess?.();
        setMode('view');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
    }
  };

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
        <DrawerHeader className=' py-4 font-semibold text-[#1A1015E5] text-[24px] line-height[32px]'>
          <DrawerTitle>
            {mode === 'create' ? 'Add Order' : mode === 'edit' ? 'Edit Order' : 'Order Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary / Details */}
            <div>
                <h3 className="mb-3 font-semibold text-[#170A11B2] text-[18px]">Order Summary</h3>
              <div className={isEditing ? "space-y-3" : "grid grid-cols-2 gap-4 text-sm"}>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Order ID</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="orderId"
                      value={formData.orderId}
                      onChange={handleInputChange}
                      disabled={isReadOnly || mode === 'create'}
                      placeholder="Enter order ID"
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-900">{formData.orderId}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Status</label>
                  {isEditing ? (
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger className="bg-white w-full">
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
                    <p className="text-xs font-medium text-gray-900">{formData.status}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Payment Status</label>
                  {isEditing ? (
                    <Select value={formData.paymentStatus} onValueChange={(value) => handleSelectChange('paymentStatus', value)}>
                      <SelectTrigger className="bg-white w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Unpaid">Unpaid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partial">Partial</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-xs font-medium text-gray-900">{formData.paymentStatus}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Order Date</label>
                  {isEditing ? (
                    <Input
                      type="date"
                      name="orderDate"
                      value={formData.orderDate.split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-900">
                      {new Date(formData.orderDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-[#170A11B2] text-[18px]">Customer Info</h3>
              <div className={isEditing ? "space-y-3" : "grid grid-cols-2 gap-4"}>
                {isEditing ? (
                  <>
                    <div>
                      <label className="text-sm text-[#170A11B2] block mb-2">Name</label>
                      <Input
                        type="text"
                        name="customer.name"
                        value={formData.customer.name}
                        onChange={handleInputChange}
                        placeholder="Customer name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#170A11B2] block mb-2">Phone</label>
                      <Input
                        type="tel"
                        name="customer.phone"
                        value={formData.customer.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#170A11B2] block mb-2">Email</label>
                      <Input
                        type="email"
                        name="customer.email"
                        value={formData.customer.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[#170A11B2] block mb-2">Address</label>
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
                      <p className="text-sm text-[#170A11B2]">Name</p>
                      <p className="text-xs font-medium text-gray-900">{formData.customer.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#170A11B2]">Phone</p>
                      <p className="text-xs font-medium text-gray-900">{formData.customer.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#170A11B2]">Email</p>
                      <p className="text-xs font-medium text-gray-900">{formData.customer.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#170A11B2]">Address</p>
                      <p className="text-xs font-medium text-gray-900">{formData.customer.address || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Delivery Location */}
            <div>
              <label className="text-sm text-[#170A11B2] ">Delivery Location</label>
              {isEditing ? (
                <Input
                  type="text"
                  name="deliveryLocation"
                  value={formData.deliveryLocation}
                  onChange={handleInputChange}
                  placeholder="Delivery location"
                />
              ) : (
                <p className="text-xs text-gray-900">{formData.deliveryLocation || '-'}</p>
              )}
            </div>

            {/* Items List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#170A11B2] text-[18px]">Items List</h3>
              </div>

              {isEditing && (
                <div className="mb-4">
                  {/* Tabs for Items/Packages */}
                  <div className="flex gap-2 mb-3 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTab('items');
                        setItemSearchInput('');
                      }}
                      className={`px-3 py-2 text-sm font-medium ${
                        selectedTab === 'items'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Items
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTab('packages');
                        setItemSearchInput('');
                      }}
                      className={`px-3 py-2 text-sm font-medium ${
                        selectedTab === 'packages'
                          ? 'text-green-600 border-b-2 border-green-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Packages
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder={selectedTab === 'items' ? "Search items by name or category..." : "Search packages..."}
                      value={itemSearchInput}
                      onChange={(e) => setItemSearchInput(e.target.value)}
                      onFocus={() => setShowItemDropdown(true)}
                      className="pl-8"
                    />
                    
                    {showItemDropdown && itemSearchInput && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        {selectedTab === 'items' ? (
                          filteredItems.length > 0 ? (
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
                                        type: 'item' as const,
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
                                  <p className="text-xs text-gray-500">₵{invItem.price.toLocaleString()} • {getUnitName(invItem.unit)}</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No items found</div>
                          )
                        ) : (
                          filteredPackages.length > 0 ? (
                            filteredPackages.map((pkg) => (
                              <button
                                key={pkg._id}
                                type="button"
                                onClick={() => {
                                  // Check if package already exists
                                  const existingIndex = formData.items.findIndex(i => i._id === pkg._id);
                                  if (existingIndex === -1) {
                                    // Add new package
                                    const packagePrice = Math.max(0, pkg.price - pkg.discount);
                                    const newItems = [
                                      ...formData.items,
                                      {
                                        _id: pkg._id,
                                        name: pkg.name,
                                        price: packagePrice,
                                        quantity: 1,
                                        unit: 'package',
                                        image: pkg.image,
                                        type: 'package' as const,
                                      },
                                    ];
                                    // Recalculate total when package is added
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
                                {pkg.image && (
                                  <img src={pkg.image} alt={pkg.name} className="w-8 h-8 rounded object-cover" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{pkg.name}</p>
                                  <p className="text-xs text-gray-500">₵{(pkg.price - pkg.discount).toLocaleString()} ({pkg.items.length} items)</p>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No packages found</div>
                          )
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
                    <div key={idx} className="rounded-lg py-4 pb-0.5 bg-white hover:shadow-md transition">
                      <div className="flex gap-3 items-start">
                        {/* Item Image */}
                        {item.image && (
                          <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        
                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#12170AB2] text-sm">{item.name}</p>
                              {item.type === 'package' && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                  Package
                                </span>
                              )}
                            </div>
                            <p className="text-xstext-gray-900 flex-shrink-0">₵{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                          </div>
                          {isEditing ? (
                            <div className="mt-1 flex items-center gap-1">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === '' || value === '0') {
                                    // Allow empty for now, will validate on blur
                                    handleItemChange(idx, 'quantity', 0);
                                  } else {
                                    const num = parseInt(value);
                                    if (!isNaN(num) && num > 0) {
                                      handleItemChange(idx, 'quantity', num);
                                    }
                                  }
                                }}
                                onBlur={(e) => {
                                  // On blur, ensure minimum of 1
                                  const value = parseInt(e.target.value) || 1;
                                  handleItemChange(idx, 'quantity', Math.max(1, value));
                                }}
                                min="1"
                                className="w-12 h-6"
                              />
                              <span className="text-xs text-gray-700">
                                Qty: {item.quantity}
                              </span>
                              <span className="text-xs text-gray-600">•</span>
                              <p className="text-xs text-gray-600">₵{item.price.toLocaleString()} per {getUnitName(item.unit)}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-gray-700 mt-1">
                              Qty: {item.quantity} • ₵{item.price.toLocaleString()} per {getUnitName(item.unit)}
                            </p>
                          )}
                        </div>

                        {/* Remove Button */}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition"
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
            <div>
              <h3 className="text-sm font-semibold mb-3 text-[#170A11B2] text-[18px]">Subtotal</h3>
              <div className={isEditing ? "space-y-3" : "grid grid-cols-2 gap-4"}>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Subtotal</label>
                  <p className="text-xs font-medium text-gray-900">₵{subtotal.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Discount</label>
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
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-900">{discount > 0 ? `-₵${discount.toLocaleString()}` : '₵0'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Delivery Fee</label>
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
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-900">₵{deliveryFee.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-[#170A11B2] block mb-2">Tax</label>
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
                      className="w-full"
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-900">₵{tax.toLocaleString()}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-[#170A11B2]">Grand Total</span>
                  <span className="text-sm font-semibold text-[#170A11B2]">₵{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

          {/* Footer */}
          <DrawerFooter className="flex justify-end gap-2 pt-6 mt-8">
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
                  disabled={createOrder.isPending || updateOrder.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {createOrder.isPending || updateOrder.isPending ? (
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
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 text-sm"
                >
                  Edit Order
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium text-sm"
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