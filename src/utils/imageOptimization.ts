/**
 * Image Optimization Utilities
 * Handles Cloudinary URL optimization and image loading strategies
 */

/**
 * Optimize Cloudinary URL with quality and format parameters
 * @param url - Original Cloudinary URL
 * @param quality - Quality level 1-100 (default: 85)
 * @param format - Image format (auto, webp, avif)
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  quality: number = 85,
  format: string = "auto"
): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  // Extract the cloudinary path and apply transformations
  const urlParts = url.split("/upload/");
  if (urlParts.length < 2) {
    return url;
  }

  const baseUrl = urlParts[0];
  const path = urlParts[1];

  // Build transformation string
  const transformations = [
    `q_${quality}`, // Quality parameter
    `f_${format}`, // Format parameter (auto will use webp/avif for modern browsers)
  ].join(",");

  // Reconstruct URL with transformations
  return `${baseUrl}/upload/${transformations}/${path}`;
}

/**
 * Get optimized image srcSet for responsive images
 * @param url - Image URL
 * @param widths - Array of widths to generate
 * @returns srcSet string
 */
export function getResponsiveImageSrcSet(
  url: string,
  widths: number[] = [320, 640, 1024, 1280, 1920]
): string {
  if (!url.includes("res.cloudinary.com")) {
    return "";
  }

  const urlParts = url.split("/upload/");
  if (urlParts.length < 2) {
    return "";
  }

  const baseUrl = urlParts[0];
  const path = urlParts[1];

  return widths
    .map((width) => {
      const transformations = `w_${width},c_scale,q_85,f_auto`;
      return `${baseUrl}/upload/${transformations}/${path} ${width}w`;
    })
    .join(", ");
}

/**
 * Generate blur placeholder data URL
 * Simple single-pixel placeholder for better perceived performance
 * @param color - Color hex code (default: light gray)
 * @returns Data URL for placeholder
 */
export function generatePlaceholderDataUrl(color: string = "#f3f4f6"): string {
  // Create a simple 1x1 colored pixel as placeholder
  const canvas =
    typeof window !== "undefined" ? document.createElement("canvas") : null;
  if (!canvas) return "";

  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  return canvas.toDataURL();
}

/**
 * Image loading strategy constants
 */
export const IMAGE_QUALITY = {
  HIGH: 90,
  MEDIUM: 85,
  LOW: 75,
} as const;

export const IMAGE_SIZES = {
  HERO: "100vw",
  CAROUSEL_ITEM: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  CATEGORY_CARD:
    "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw",
  CARD_THUMBNAIL: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
} as const;
