'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ImageUploadSection from './ImageUploadSection';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Category } from '@/types/categories-units';
import { useCategories } from '@/hooks/useCategories';

type DrawerMode = 'create' | 'view' | 'edit';

interface CategoryDetailsDrawerProps {
  category?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  mode?: DrawerMode;
  onSuccess?: () => void;
}

const CategoryDetailsDrawer = ({ category, isOpen, onClose, mode: initialMode = 'view', onSuccess }: CategoryDetailsDrawerProps) => {
  const [mode, setMode] = useState<DrawerMode>(initialMode);
  const [formData, setFormData] = useState<Category>(
    category || {
      name: '',
      description: '',
      icon: '',
      color: '#556B2F',
      image: '',
      status: 'active',
    }
  );
  const [imagePreview, setImagePreview] = useState<string>(category?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { createCategory, updateCategory } = useCategories();

  // Memoize computed values (must be before useEffect)
  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData(category);
        setImagePreview(category.image || '');
        setMode(initialMode);
      } else {
        setMode('create');
        setFormData({
          name: '',
          description: '',
          icon: '',
          color: '#556B2F',
          image: '',
          status: 'active',
        });
        setImagePreview('');
      }
    }
  }, [category, initialMode, isOpen]);

  const handleImageUpload = useCallback((imageUrl: string) => {
    setImagePreview(imageUrl);
    setFormData(prev => ({ ...prev, image: imageUrl }));
  }, []);

  const handleImageRemove = useCallback(() => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'create') {
        await createCategory.mutateAsync(formData);
        onSuccess?.();
        onClose();
      } else if (mode === 'edit') {
        await updateCategory.mutateAsync({ id: category?._id!, data: formData });
        onSuccess?.();
        setMode('view');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader className=" py-4">
          <DrawerTitle>
            {mode === 'create' ? 'Add Category' : mode === 'edit' ? 'Edit Category' : 'Category Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Product Info Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Info</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Category Name</label>
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Category name"
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
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    placeholder="Description"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm h-20 focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{formData.description || '-'}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Color</label>
                {isEditing ? (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      name="color"
                      value={formData.color || '#556B2F'}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      name="color"
                      value={formData.color || '#556B2F'}
                      onChange={handleInputChange}
                      placeholder="#556B2F"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: formData.color || '#556B2F' }}
                    />
                    <p className="text-gray-600 text-sm">{formData.color || '#556B2F'}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Media Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Upload Category Cover</h3>
            <ImageUploadSection
              title="Category Cover"
              imagePreview={imagePreview}
              isEditing={isEditing}
              isUploading={isUploadingImage}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />
          </div>

          {/* Category Status Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 ">Category Status</h3>
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
                  disabled={createCategory.isPending || updateCategory.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 transition text-sm flex items-center gap-2"
                >
                  {createCategory.isPending || updateCategory.isPending ? (
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
                Edit Category
              </button>
            )}
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default CategoryDetailsDrawer;
