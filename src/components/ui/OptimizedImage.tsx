/**
 * Optimized Image Component
 * Wrapper around Next.js Image with automatic Cloudinary optimization
 */

import React from "react";
import Image, { ImageProps } from "next/image";
import {
  optimizeCloudinaryUrl,
  IMAGE_QUALITY,
  IMAGE_SIZES,
} from "@/utils/imageOptimization";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  quality?: number;
  cloudinaryOptimize?: boolean;
}

/**
 * OptimizedImage component
 * Automatically optimizes Cloudinary URLs and applies best practices
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  quality = IMAGE_QUALITY.MEDIUM,
  cloudinaryOptimize = true,
  placeholder = "empty",
  ...props
}) => {
  // Optimize Cloudinary URLs
  const optimizedSrc =
    cloudinaryOptimize && src.includes("res.cloudinary.com")
      ? optimizeCloudinaryUrl(src, quality, "auto")
      : src;

  return (
    <Image
      src={optimizedSrc}
      placeholder={placeholder}
      quality={quality}
      {...props}
    />
  );
};

export default OptimizedImage;
