'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader } from 'lucide-react';
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
import { useItems } from '@/hooks/useItems';
import { useCategories } from '@/hooks/useCategories';
import { useUnits } from '@/hooks/useUnits';

interface Item {
  _id?: string;
  name: string;
  category: string | { _id: string; name: string };
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  image?: string;
  lastUpdated?: string;
}

type DrawerMode = 'create' | 'view' | 'edit';

interface ItemDetailsDrawerProps {
  item?: Item | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

const ItemDetailsDrawer = ({ item, isOpen, onClose, mode: initialMode = 'view', onSuccess }: ItemDetailsDrawerProps) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [formData, setFormData] = useState<Item>(item || {
    name: '',
    category: '',
    description: '',
    price: 0,
    unit: '',
    discount: 0,
    stock: 0,
    status: 'In Stock',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>(item?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { createItem, updateItem } = useItems();
  const { categories } = useCategories();
  const { units } = useUnits();

  // Memoize computed values (must be before useEffect)
  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData(item);
        setImagePreview(item.image || '');
        setMode(initialMode);
      } else {
        setMode('create');
        setFormData({
          name: '',
          category: '',
          description: '',
          price: 0,
          unit: '',
          discount: 0,
          stock: 0,
          status: 'In Stock',
          image: '',
        });
        setImagePreview('');
      }
    }
  }, [item, initialMode, isOpen]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    if (name === 'price' || name === 'stock' || name === 'discount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setImagePreview(imageUrl);
    setFormData(prev => ({ ...prev, image: imageUrl }));
  }, []);

  const handleImageRemove = useCallback(() => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert numeric fields to numbers before submission
      const dataToSubmit = {
        ...formData,
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        discount: Number(formData.discount) || 0,
      };
      
      if (mode === 'create') {
        // For create, remove _id if present since API will generate it
        const { _id, ...createData } = dataToSubmit as any;
        await createItem.mutateAsync(createData as any);
        onSuccess?.();
        onClose();
      } else if (mode === 'edit') {
        await updateItem.mutateAsync({ 
          id: item?._id!, 
          data: { ...dataToSubmit, _id: item?._id! } as any 
        });
        onSuccess?.();
        setMode('view');
      }
    } catch (error) {
      console.error('Error submitting item:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader className=" py-4">
          <DrawerTitle>
            {mode === 'create' ? 'Add Item' : mode === 'edit' ? 'Edit Item' : 'Item Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Product Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Item Name</label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Item name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Category</label>
                  {isEditing ? (
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                      <SelectTrigger className="bg-white w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id!}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{categories.find(c => c._id === formData.category)?.name || formData.category}</p>
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

            {/* Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Pricing</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Price (₵)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Price"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">₵{formData.price.toLocaleString()}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Unit</label>
                  {isEditing ? (
                    <Select value={formData.unit} onValueChange={(value) => handleSelectChange('unit', value)}>
                      <SelectTrigger className="bg-white w-full">
                        <SelectValue placeholder="Select a unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit._id} value={unit._id!}>
                            {unit.name} ({unit.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">
                      {units.find(u => u._id === formData.unit)?.abbreviation || 
                       units.find(u => u.name === formData.unit)?.abbreviation ||
                       formData.unit}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Discount (%)</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="Discount"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.discount || 0}%</p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Inventory</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Stock Quantity</label>
                  {isEditing ? (
                    <Input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="Stock quantity"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{formData.stock} units</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Status</label>
                  {isEditing ? (
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger className="bg-white w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="In Stock">In Stock</SelectItem>
                        <SelectItem value="Low Stock">Low Stock</SelectItem>
                        <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{formData.status}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Media */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Product Image</h3>
              <ImageUploadSection
                title="Product Image"
                imagePreview={imagePreview}
                isEditing={isEditing}
                isUploading={isUploadingImage}
                onImageUpload={handleImageUpload}
                onImageRemove={handleImageRemove}
              />
            </div>

          {/* Footer Actions */}
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
                  disabled={createItem.isPending || updateItem.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {createItem.isPending || updateItem.isPending ? (
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 text-sm"
              >
                Edit Item
              </button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default ItemDetailsDrawer;
