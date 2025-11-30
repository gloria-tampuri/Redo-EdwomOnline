'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Trash2, Loader, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { getCroppedImage } from '@/utils/cropImage';
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

interface Item {
  _id?: string;
  name: string;
  category: string;
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
  const [rawImageSrc, setRawImageSrc] = useState<string>(''); // For cropper
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const queryClient = useQueryClient();

  // Memoize computed values (must be before useEffect)
  const isReadOnly = useMemo(() => mode === 'view', [mode]);
  const isEditing = useMemo(() => mode === 'edit' || mode === 'create', [mode]);

  useEffect(() => {
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
  }, [item, initialMode, isOpen]);

  // Mutations
  const createItemMutation = useMutation({
    mutationFn: async (data: Item) => {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      onSuccess?.();
      onClose();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (data: Item) => {
      const res = await fetch(`/api/items/${item?._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      onSuccess?.();
      setMode('view');
    },
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Convert numeric fields to numbers
    if (name === 'price' || name === 'stock' || name === 'discount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, []);

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL for cropper
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
      // Get cropped image as File
      const croppedFile = await getCroppedImage(rawImageSrc, croppedAreaPixels, 'product-image.jpg');
      
      // Upload cropped image to Cloudinary
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert numeric fields to numbers before submission
    const dataToSubmit = {
      ...formData,
      price: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      discount: Number(formData.discount) || 0,
    };
    
    if (mode === 'create') {
      await createItemMutation.mutateAsync(dataToSubmit);
    } else if (mode === 'edit') {
      await updateItemMutation.mutateAsync(dataToSubmit);
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
            {mode === 'create' ? 'Add Item' : mode === 'edit' ? 'Edit Item' : 'Item Details'}
          </DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fruits">Fruits</SelectItem>
                        <SelectItem value="Vegetables">Vegetables</SelectItem>
                        <SelectItem value="Grains">Grains</SelectItem>
                        <SelectItem value="Dairy">Dairy</SelectItem>
                        <SelectItem value="Meat">Meat</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{formData.category}</p>
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
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">Pcs</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="g">G</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="ml">ML</SelectItem>
                        <SelectItem value="box">Box</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-gray-900">{formData.unit}</p>
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
                      <SelectTrigger className="bg-white">
                        <SelectValue />
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
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Media</h3>
              <div>
                <label className="text-sm text-gray-600 block mb-2">Upload Product Image</label>
                {isEditing ? (
                  <div>
                    {imagePreview ? (
                      <div className="relative mb-3">
                        <img
                          src={imagePreview}
                          alt="Product preview"
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
                            <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Drag or click to upload image</p>
                            <p className="text-xs text-gray-500 mt-1">Only .jpg, .png and .jpeg files</p>
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
                      alt="Product"
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

          {/* Footer Actions */}
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
                  disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {createItemMutation.isPending || updateItemMutation.isPending ? (
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
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 text-sm"
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
