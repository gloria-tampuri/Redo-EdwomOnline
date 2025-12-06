'use client';

import { useState, useCallback } from 'react';
import { Upload, Trash2, Loader } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { uploadToCloudinary } from '@/utils/cloudinary';
import { getCroppedImage } from '@/utils/cropImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import UploadSvg from '../ui/upload-svg';

interface ImageUploadSectionProps {
  title: string;
  imagePreview: string;
  isEditing: boolean;
  isUploading: boolean;
  onImageUpload: (imageUrl: string) => void;
  onImageRemove: () => void;
}

const ImageUploadSection = ({
  title,
  imagePreview,
  isEditing,
  isUploading,
  onImageUpload,
  onImageRemove,
}: ImageUploadSectionProps) => {
  const [rawImageSrc, setRawImageSrc] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCropComplete = useCallback((_croppedArea: unknown, croppedAreaPixels: unknown) => {
    setCroppedAreaPixels(croppedAreaPixels as any);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!rawImageSrc || !croppedAreaPixels) return;
    
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImage(rawImageSrc, croppedAreaPixels);
      const file = new File([croppedImage], 'cropped-image.png', { type: 'image/png' });
      
      const cloudinaryUrl = await uploadToCloudinary(file);
      onImageUpload(cloudinaryUrl);
      setShowCropper(false);
      setRawImageSrc('');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsCropping(false);
    }
  }, [rawImageSrc, croppedAreaPixels, onImageUpload]);

  if (!isEditing) {
    return imagePreview ? (
      <div>
        <img
          src={imagePreview}
          alt={title}
          className="w-full rounded-lg object-cover bg-gray-100"
          style={{ aspectRatio: '16/9' }}
        />
      </div>
    ) : (
      <div className="w-full rounded-lg bg-gray-100 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
        <p className="text-gray-500 text-sm">No image</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt={title}
              className="w-full rounded-lg object-cover bg-gray-100"
              style={{ aspectRatio: '16/9' }}
            />
            <button
              type="button"
              onClick={onImageRemove}
              disabled={isUploading}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            className={`border-2 border-dashed ${
              isUploading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
            } rounded-lg p-12 text-center cursor-pointer transition`}
            style={{ aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            {isUploading ? (
              <div className="flex flex-col items-center justify-center gap-3">
                <Loader className="w-12 h-12 text-gray-400 animate-spin" />
                <p className="text-sm text-gray-600">Uploading to Cloudinary...</p>
              </div>
            ) : (
              <>
              <UploadSvg/>
                <p className="text-base text-gray-600 mb-1">Drag your file(s) to start uploading</p>
                <p className="text-sm text-gray-500 mb-4">OR</p>
                <button
                  type="button"
                  className="px-6 py-2 border-2 border-gray-400 text-gray-600 rounded-lg font-medium hover:border-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.preventDefault();
                    (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)?.click();
                  }}
                >
                  Button
                </button>
                <p className="text-xs text-gray-500 mt-4">Only supports .jpg, .png and .jpeg files</p>
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleImageSelect}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          {rawImageSrc && (
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
              <Cropper
                image={rawImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={true}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-600 block mb-2">Zoom</label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowCropper(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveCrop}
              disabled={isCropping}
              className="px-4 py-2 bg-[#556B2F] hover:bg-[#556B2F]/90 text-white rounded font-medium disabled:opacity-50 text-sm flex items-center gap-2"
            >
              {isCropping ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Crop'
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploadSection;
