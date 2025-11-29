import crypto from 'crypto';

/**
 * API Route: POST /api/cloudinary/signature
 * Generates a signed upload signature for Cloudinary
 * Required parameters: timestamp, public_id (optional)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { public_id } = body;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return Response.json(
        { error: 'Missing Cloudinary configuration' },
        { status: 500 }
      );
    }

    // Generate timestamp
    const timestamp = Math.floor(Date.now() / 1000);

    // Build the string to sign - MUST match exactly what's in the upload
    // Format for unsigned: public_id={public_id}&timestamp={timestamp}
    let toSign = `timestamp=${timestamp}`;
    if (public_id) {
      toSign = `public_id=${public_id}&timestamp=${timestamp}`;
    }

    // Append the API secret
    const signatureString = toSign + apiSecret;

    // Generate SHA-1 hash
    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    return Response.json(
      { 
        signature, 
        timestamp, 
        cloudName, 
        apiKey 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return Response.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}

