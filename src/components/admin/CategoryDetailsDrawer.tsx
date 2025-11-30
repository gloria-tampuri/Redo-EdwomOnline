'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Loader } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Input } from '@/components/ui/input';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { getCroppedImage } from '@/utils/cropImage';
import { Category } from '@/types/categories-units';

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
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const queryClient = useQueryClient();

  // Memoize computed values (must be before useEffect)
  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  useEffect(() => {
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
  }, [category, initialMode, isOpen]);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result as string);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirmCrop = useCallback(async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;

    try {
      setIsUploadingImage(true);
      const croppedFile = await getCroppedImage(rawImageSrc, croppedAreaPixels, 'category-image.jpg');
      const cloudinaryUrl = await uploadToCloudinary(croppedFile);
      setFormData(prev => ({ ...prev, image: cloudinaryUrl }));
      setImagePreview(cloudinaryUrl);
      setShowCropper(false);
      setRawImageSrc('');
    } catch (error) {
      console.error('Error cropping and uploading image:', error);
      alert('Failed to crop and upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  }, [rawImageSrc, croppedAreaPixels]);

  const handleCancelCrop = useCallback(() => {
    setShowCropper(false);
    setRawImageSrc('');
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleRemoveImage = useCallback(() => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImagePreview('');
  }, []);

  const createMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Category) => {
      const res = await fetch(`/api/categories/${category?._id}`, {
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onSuccess?.();
      setMode('view');
    },
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      await createMutation.mutateAsync(formData);
    } else if (mode === 'edit') {
      await updateMutation.mutateAsync(formData);
    }
  };


  if (!isOpen) return null;

  // Render cropper modal
  if (showCropper) {
    return (
      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-96 bg-gray-100">
            <Cropper
              image={rawImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-2">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={handleCancelCrop}
                disabled={isUploadingImage}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCrop}
                disabled={isUploadingImage}
                className="px-3 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {isUploadingImage ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Confirm & Upload'
                )}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>
            {mode === 'create' ? 'Add Category' : mode === 'edit' ? 'Edit Category' : 'Category Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Media</h3>
            <div>
              <label className="text-sm text-gray-600 block mb-2">Upload Category Cover</label>
              {isEditing ? (
                <div>
                  {imagePreview ? (
                    <div className="relative mb-3">
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="w-full h-32 rounded-lg object-cover bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={isUploadingImage}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`border-2 border-dashed ${isUploadingImage ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'} rounded-lg p-6 text-center cursor-pointer transition`}>
                      {isUploadingImage ? (
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader className="w-8 h-8 text-gray-400 animate-spin" />
                          <p className="text-sm text-gray-600">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Drag or click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">JPG, PNG (.5MB max)</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              ) : (
                imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Category"
                    className="w-full h-32 rounded-lg object-cover bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No image</p>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Category Status Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Category Status</h3>
            {isEditing ? (
              <Select value={formData.status || 'active'} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {formData.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <DrawerFooter>
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
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 transition text-sm flex items-center gap-2"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
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
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 transition text-sm"
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
