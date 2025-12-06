# Cloudinary Setup Guide for EdwomOnline

This guide explains how to set up Cloudinary for image uploads in your EdwomOnline application.

## Why Cloudinary?

- **Free tier**: Up to 25 GB monthly storage and 25 GB bandwidth
- **No backend processing**: Images uploaded directly from client to Cloudinary
- **Secure URLs**: All images returned as secure URLs (https://)
- **Automatic optimization**: Images are optimized automatically
- **Easy integration**: Simple API with unsigned uploads

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up with your email (you can also use Google/GitHub)
3. Complete the registration process
4. After signup, you'll be taken to your Cloudinary Dashboard

## Step 2: Find Your Credentials

1. On the Cloudinary Dashboard, look for your **Cloud Name** (displayed at the top)
   - It will look like: `your_cloud_name`
2. Keep this tab open, you'll need it in the next step

## Step 3: Create an Upload Preset

An **Upload Preset** is required for unsigned uploads (uploading from the client without backend authentication).

1. In Cloudinary Dashboard, go to **Settings** (gear icon at the top-right)
2. Navigate to the **Upload** tab
3. Scroll down to **Upload presets** section
4. Click **Add upload preset**
5. Fill in the form:
   - **Name**: `edwom_items` (or any name you prefer)
   - **Signing Mode**: Select **Unsigned**
   - Leave other settings as default
6. Click **Save**
7. Copy your preset name (this is your `UPLOAD_PRESET`)

## Step 4: Add Environment Variables

1. Open `.env.local` in your project root
2. Add the following variables:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

3. Replace:
   - `your_cloud_name` with your actual Cloud Name
   - `your_upload_preset` with your Upload Preset name
4. Save the file

## Step 5: Restart Development Server

```bash
npm run dev
```

## How It Works

1. User selects an image in the "Add Item" or "Edit Item" form
2. The image is uploaded directly from the browser to Cloudinary
3. Cloudinary returns a secure URL (https://...)
4. The URL is stored in MongoDB with the item data
5. When displaying items, images load directly from Cloudinary's CDN

## Security Notes

- **Unsigned uploads** are secure because you're using a specific preset for your cloud
- You can set limits on the upload preset (file size, file types, etc.)
- The preset name is public, but it's scoped to your specific cloud account
- In production, ensure your upload preset is configured to only accept images

## Optional: Configure Upload Preset Limits

To add security restrictions to your upload preset:

1. Go to **Settings > Upload** in Cloudinary Dashboard
2. Find your upload preset and click **Edit**
3. Set restrictions:
   - **Allowed file types**: Image
   - **Max file size**: 5 MB (adjust as needed)
   - **Transformation**: You can add automatic transformations

## Troubleshooting

### "Failed to upload image to Cloudinary"

- Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is correct
- Check that `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` exists and is set to **Unsigned**
- Check browser console for CORS or network errors
- Ensure the file is a valid image (JPG, PNG)

### Image not displaying

- Verify the Cloudinary URL is valid (should start with `https://`)
- Check that the image was uploaded by going to Cloudinary Media Library
- Verify MongoDB has the URL stored correctly

## Free Tier Limits

- **Storage**: 25 GB/month
- **Bandwidth**: 25 GB/month
- **API calls**: 500/hour
- After limits are reached, uploads will fail until next month

## Upgrade Options

If you exceed free tier limits:
- **Pro Plan**: $99/month for 200 GB storage + 200 GB bandwidth
- Pay-as-you-go: Only pay for what you use

## References

- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Unsigned Upload Documentation](https://cloudinary.com/documentation/upload_images#unsigned_upload)
- [Upload Presets](https://cloudinary.com/documentation/upload_presets)
