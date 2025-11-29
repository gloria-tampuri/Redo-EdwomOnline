/**
 * Cloudinary Image Upload Utility with Signed Uploads
 * Handles uploading pre-cropped images to Cloudinary
 * Images are cropped by admin before upload using react-easy-crop
 */

export const uploadToCloudinary = async (file: File): Promise<string> => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

    if (!cloudName || !apiKey) {
      throw new Error(
        `Missing Cloudinary config: Cloud Name=${!!cloudName}, API Key=${!!apiKey}`
      );
    }

    // Step 1: Get signature from backend
    const sigResponse = await fetch('/api/cloudinary/signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    if (!sigResponse.ok) {
      throw new Error('Failed to get signature from server');
    }

    const { signature, timestamp, apiKey: returnedApiKey } = await sigResponse.json();

    // Step 2: Prepare FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', returnedApiKey);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);

    console.log('Uploading cropped image to Cloudinary:', {
      cloudName,
      fileName: file.name,
      fileSize: file.size,
    });

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    console.log('Cloudinary response:', { status: response.status, secure_url: data.secure_url });

    if (!response.ok) {
      console.error('Cloudinary error:', data);
      throw new Error(data.error?.message || `Upload failed: ${response.status}`);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};




