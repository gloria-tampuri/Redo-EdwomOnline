/**
 * Image Cropping Utility
 * Converts cropped canvas data to a File blob for upload
 */

export interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates a cropped image file from the original image and crop area
 * @param imageSrc - The image source URL (base64 or blob URL)
 * @param croppedAreaPixels - The crop area coordinates and dimensions
 * @returns Promise<File> - The cropped image as a File
 */
export async function getCroppedImage(
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  fileName: string = 'cropped-image.jpg'
): Promise<File> {
  const image = new Image();
  image.src = imageSrc;

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Set canvas dimensions to the cropped area size
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped image onto the canvas
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert canvas to blob and create File
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob from canvas'));
          return;
        }

        const file = new File([blob], fileName, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.95);
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}
