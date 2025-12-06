'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader, Plus, Trash2 } from 'lucide-react';
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
      status: 'active',
      youtubeUrl: '',
      image: '',
    }
  );
  const [imagePreview, setImagePreview] = useState<string>(pkg?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [itemSearchInput, setItemSearchInput] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);

  const { createPackage, updatePackage } = usePackages();
  const { data: allItems = [] } = useItems() as any;
  const { units } = useUnits();

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
        setFormData(pkg);
        setImagePreview(pkg.image || '');
        setMode(initialMode);
      } else {
        setMode('create');
        setFormData({
          name: '',
          description: '',
          items: [],
          price: 0,
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
    const newItem: PackageItem = {
      itemId: item._id,
      name: item.name,
      quantity: 1,
      unit: item.unit,
      price: item.price,
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
      price: prev.price + newItem.price,
    }));

    setItemSearchInput('');
    setShowItemDropdown(false);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const removedItemPrice = prev.items[index].price;
      return {
        ...prev,
        items: newItems,
        price: Math.max(0, prev.price - removedItemPrice),
      };
    });
  };

  const handleItemQuantityChange = (index: number, quantity: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      const oldPrice = newItems[index].price;
      const newPrice = oldPrice * (quantity / newItems[index].quantity);
      newItems[index].quantity = quantity;
      newItems[index].price = newPrice;

      const priceDifference = newPrice - oldPrice;
      return {
        ...prev,
        items: newItems,
        price: prev.price + priceDifference,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        <DrawerHeader className="px-6 py-4">
          <DrawerTitle>
            {mode === 'create'
              ? 'Add Package'
              : mode === 'edit'
              ? 'Edit Package'
              : 'Package Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-8 px-6 py-6">
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Package Items</h3>
            <div className="space-y-3">
              {isEditing && (
                <div>
                  <label className="text-sm text-gray-600 block mb-2">Search & Add Items</label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search items..."
                      value={itemSearchInput}
                      onChange={(e) => setItemSearchInput(e.target.value)}
                      onFocus={() => setShowItemDropdown(true)}
                    />

                    {showItemDropdown && itemSearchInput && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item: any) => (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => handleAddItem(item)}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-0 text-sm"
                            >
                              {item.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">No items found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="border rounded-lg p-3 space-y-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemQuantityChange(index, parseInt(e.target.value) || 1)
                              }
                              className="w-16 px-1 py-0 border border-gray-300 rounded text-xs"
                            />
                          ) : (
                            <>Qty: {item.quantity}</>
                          )}{' '}
                          {item.unit} @ ₵{item.price.toFixed(2)}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 hover:bg-red-50 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {formData.items.length === 0 && isEditing && (
                <p className="text-xs text-gray-500 italic">No items added yet</p>
              )}
            </div>
          </div>

          {/* Upload Package Image Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Package Cover</h3>
            <ImageUploadSection
              title="Package Cover"
              imagePreview={imagePreview}
              isEditing={isEditing}
              isUploading={isUploadingImage}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
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
                  disabled={createPackage.isPending || updatePackage.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 transition text-sm flex items-center gap-2"
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
