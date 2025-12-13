'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader, Plus, Trash2, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUploadSection from './ImageUploadSection';
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
import { usePackages, Package, PackageItem } from '@/hooks/usePackages';
import { useItems } from '@/hooks/useItems';
import { useUnits } from '@/hooks/useUnits';

type DrawerMode = 'create' | 'view' | 'edit';

interface PackageDetailsDrawerProps {
  pkg?: Package | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

const PackageDetailsDrawer = ({
  pkg,
  isOpen,
  onClose,
  mode: initialMode = 'view',
  onSuccess,
}: PackageDetailsDrawerProps) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [formData, setFormData] = useState<Package>(
    pkg || {
      name: '',
      description: '',
      items: [],
      price: 0,
      discount: 0,
      status: 'active',
      youtubeUrl: '',
      image: '',
    }
  );
  const [imagePreview, setImagePreview] = useState<string>(pkg?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [itemSearchInput, setItemSearchInput] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [editingQuantityIndex, setEditingQuantityIndex] = useState<number | null>(null);
  const [quantityInputValue, setQuantityInputValue] = useState<string>('');

  const { createPackage, updatePackage } = usePackages();
  const { items: allItems = [] } = useItems();
  const { units } = useUnits();

  // Helper function to calculate items total
  const calculateItemsTotal = (items: PackageItem[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Helper function to get unit name from unit ID
  const getUnitName = (unitId: string) => {
    if (!units) return unitId;
    const unit = units.find((u: any) => u._id === unitId);
    return unit?.name || unitId;
  };

  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!itemSearchInput.trim()) return allItems;
    return allItems.filter((item: any) =>
      item.name.toLowerCase().includes(itemSearchInput.toLowerCase()) ||
      item.category?.toLowerCase().includes(itemSearchInput.toLowerCase())
    );
  }, [allItems, itemSearchInput]);

  useEffect(() => {
    if (isOpen) {
      if (pkg) {
        console.log('Loading package for edit:', pkg);
        // Ensure price is recalculated based on current items
        const itemsTotal = pkg.items?.reduce((sum: number, item: PackageItem) => sum + (item.price * item.quantity), 0) || 0;
        setFormData({
          ...pkg,
          price: itemsTotal, // Always set price to items total
          discount: pkg.discount ?? 0,
        });
        setImagePreview(pkg.image || '');
        setMode(initialMode);
      } else {
        setMode('create');
        setFormData({
          name: '',
          description: '',
          items: [],
          price: 0,
          discount: 0,
          status: 'active',
          youtubeUrl: '',
          image: '',
        });
        setImagePreview('');
      }
    }
  }, [pkg, initialMode, isOpen]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setImagePreview(imageUrl);
    setFormData((prev) => ({ ...prev, image: imageUrl }));
  }, []);

  const handleImageRemove = useCallback(() => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, image: '' }));
  }, []);

  const handleAddItem = (item: any) => {
    // Check if item already exists
    const itemExists = formData.items.some((existingItem) => existingItem.itemId === item._id);
    if (itemExists) {
      return; // Don't add duplicate
    }

    const newItem: PackageItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      unit: item.unit,
      unitName: getUnitName(item.unit),
      price: item.price,
    };

    setFormData((prev) => {
      const newItems = [...prev.items, newItem];
      const itemsTotal = newItems.reduce((sum, itm) => sum + (itm.price * itm.quantity), 0);
      return {
        ...prev,
        items: newItems,
        price: itemsTotal,
      };
    });

    setItemSearchInput('');
    setShowItemDropdown(false);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const itemsTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...prev,
        items: newItems,
        price: itemsTotal, // Price is sum of items, discount is separate
      };
    });
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], quantity };
      const itemsTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        ...prev,
        items: newItems,
        price: itemsTotal, // Price is always the sum of items, discount is separate
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that items are present
    if (formData.items.length === 0) {
      console.error('Package must have at least one item');
      alert('Please add at least one item to the package before saving.');
      return;
    }
    
    // Validate that discount is set (compulsory)
    if (formData.discount === null || formData.discount === undefined || typeof formData.discount !== 'number') {
      console.error('Discount is required');
      alert('Please set a discount value (minimum 0) before saving.');
      return;
    }
    
    // Validate that image is set (compulsory)
    if (!formData.image || formData.image.trim() === '') {
      console.error('Image is required');
      alert('Please upload a package image before saving.');
      return;
    }
    
    console.log('Submitting package with data:', formData); // Debug log
    try {
      if (mode === 'create') {
        await createPackage.mutateAsync(formData);
        onSuccess?.();
        onClose();
      } else if (mode === 'edit') {
        await updatePackage.mutateAsync({ id: pkg?._id!, data: formData });
        onSuccess?.();
        setMode('view');
      }
    } catch (error) {
      console.error('Error submitting package:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader className=" py-4">
          <DrawerTitle>
            {mode === 'create'
              ? 'Add Package'
              : mode === 'edit'
              ? 'Edit Package'
              : 'Package Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Basic Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Package Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Package name"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{formData.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Description</label>
                {isEditing ? (
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-20"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{formData.description || '-'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Cooking Video Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Cooking Video</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">YouTube URL</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="youtubeUrl"
                    value={formData.youtubeUrl || ''}
                    onChange={handleInputChange}
                    placeholder="YouTube URL"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">
                    {formData.youtubeUrl ? (
                      <a
                        href={formData.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#556B2F] hover:underline"
                      >
                        {formData.youtubeUrl}
                      </a>
                    ) : (
                      '-'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Package Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#170A11B2] text-[18px]">Package Items</h3>
              {formData.items.length > 0 && (
                <div className="text-sm font-semibold text-gray-900">
                  Total: ₵{formData.price.toLocaleString()}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="mb-4">
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
                        filteredItems.map((invItem) => {
                          const isAdded = formData.items.some(i => i.itemId === invItem._id);
                          return (
                            <button
                              key={invItem._id}
                              type="button"
                              onClick={() => {
                                if (!isAdded) {
                                  const newItems = [
                                    ...formData.items,
                                    {
                                      itemId: invItem._id,
                                      name: invItem.name,
                                      price: invItem.price,
                                      quantity: 1,
                                      unit: invItem.unit,
                                      unitName: getUnitName(invItem.unit),
                                      image: invItem.image,
                                    },
                                  ];
                                  const itemsTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                                  setFormData({
                                    ...formData,
                                    items: newItems,
                                    price: itemsTotal, // Price is sum of items, discount is applied separately
                                  });
                                }
                                setItemSearchInput('');
                                setShowItemDropdown(false);
                              }}
                              disabled={isAdded}
                              className={`w-full px-3 py-2 text-left border-b border-gray-100 last:border-0 flex items-center gap-2 ${
                                isAdded ? 'bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-100'
                              }`}
                            >
                              {invItem.image && (
                                <img src={invItem.image} alt={invItem.name} className="w-8 h-8 rounded object-cover" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{invItem.name}</p>
                                <p className="text-xs text-gray-500">₵{invItem.price.toLocaleString()} • {getUnitName(invItem.unit)}</p>
                              </div>
                              {isAdded && <span className="text-xs text-gray-500 flex-shrink-0">✓ Added</span>}
                            </button>
                          );
                        })
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
                          <p className="font-semibold text-[#12170AB2] text-sm">{item.name}</p>
                          <p className="text-xs text-gray-900 flex-shrink-0">₵{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</p>
                        </div>
                        {isEditing ? (
                          <div className="mt-1 flex items-center gap-1">
                            <Input
                              type="number"
                              value={editingQuantityIndex === idx ? quantityInputValue : item.quantity}
                              onChange={(e) => {
                                setEditingQuantityIndex(idx);
                                setQuantityInputValue(e.target.value);
                                // Only update if it has a valid value
                                if (e.target.value !== '' && e.target.value !== '-') {
                                  const qty = Math.max(1, parseInt(e.target.value) || 1);
                                  handleItemQuantityChange(idx, qty);
                                }
                              }}
                              onFocus={() => {
                                setEditingQuantityIndex(idx);
                                setQuantityInputValue(item.quantity.toString());
                              }}
                              onBlur={(e) => {
                                // When user leaves the field, ensure it has a valid value
                                const value = e.target.value === '' ? 1 : Math.max(1, parseInt(e.target.value) || 1);
                                handleItemQuantityChange(idx, value);
                                setEditingQuantityIndex(null);
                                setQuantityInputValue('');
                              }}
                              className="w-12 h-6"
                            />
                            <span className="text-xs text-gray-700">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-600">•</span>
                            <p className="text-xs text-gray-600">₵{item.price.toLocaleString()} per {item.unitName || getUnitName(item.unit)}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-700 mt-1">
                            Qty: {item.quantity} • ₵{item.price.toLocaleString()} per {item.unitName || getUnitName(item.unit)}
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


          {/* Upload Package Image Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Package Cover <span className="text-red-500">*</span></h3>
            <ImageUploadSection
              title="Package Cover"
              imagePreview={imagePreview}
              isEditing={isEditing}
              isUploading={isUploadingImage}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
          </div>

          {/* Pricing Summary Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[#170A11B2] text-[18px]">Pricing</h3>
            
            {formData.items.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Add items to the package to set pricing</p>
            ) : (
              <>
                <div className={isEditing ? "space-y-3" : "grid grid-cols-2 gap-4"}>
                  <div>
                    <label className="text-sm text-[#170A11B2] block mb-2">Items Total</label>
                    <p className="text-xs font-medium text-gray-900">₵{formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#170A11B2] block mb-2">Discount <span className="text-red-500">*</span></label>
                    {isEditing ? (
                      <Input
                        type="number"
                        name="discount"
                        value={formData.discount || 0}
                        onChange={(e) => {
                          const discount = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0;
                          setFormData((prev) => ({
                            ...prev,
                            discount: Math.max(0, discount),
                          }));
                        }}
                        placeholder="0"
                        className="w-full"
                      />
                    ) : (
                      <p className="text-xs font-medium text-gray-900">₵{(formData.discount || 0).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-[#170A11B2]">Final Price</span>
                    <span className="text-sm font-semibold text-[#170A11B2]">₵{Math.max(0, formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - (formData.discount || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Package Status Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Status</h3>
            {isEditing ? (
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    className="w-4 h-4 cursor-pointer accent-[#556B2F]"
                  />
                  <span className="text-sm text-gray-700">Publish</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={(e) => handleSelectChange('status', e.target.value)}
                    className="w-4 h-4 cursor-pointer accent-[#556B2F]"
                  />
                  <span className="text-sm text-gray-700">Save as draft</span>
                </label>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formData.status === 'active' ? 'Publish' : 'Save as draft'}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <DrawerFooter className="flex justify-end gap-2 pt-6 mt-8">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={() => (mode === 'create' ? onClose() : setMode('view'))}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPackage.isPending || updatePackage.isPending || formData.items.length === 0 || formData.discount === null || formData.discount === undefined || !formData.image || formData.image.trim() === ''}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition text-sm flex items-center gap-2"
                  title={formData.items.length === 0 ? 'Add at least one item to save' : formData.discount === null || formData.discount === undefined ? 'Set discount value to save' : !formData.image || formData.image.trim() === '' ? 'Upload package image to save' : ''}
                >
                  {createPackage.isPending || updatePackage.isPending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setMode('edit')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition text-sm"
              >
                Edit Package
              </button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default PackageDetailsDrawer;
