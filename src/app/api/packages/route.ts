import { NextRequest, NextResponse } from 'next/server';
import { createPackage, getPackages } from '@/app/services/packageService';
import { PackageDocument } from '@/models/Package';
import { z } from 'zod';

const PackageSchema = z.object({
  name: z.string().min(1),
  description: z.string().default(''),
  items: z.array(
    z.object({
      itemId: z.string(),
      name: z.string(),
      quantity: z.number(),
      unit: z.string(),
      price: z.number(),
    })
  ),
  price: z.number(),
  discount: z.number().min(0, 'Discount cannot be negative'),
  status: z.enum(['active', 'inactive']).default('active'),
  youtubeUrl: z.string().optional(),
  image: z.string().min(1, 'Image is required'),
});

export async function GET() {
  try {
    const packages = await getPackages();
    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = PackageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid package data', details: parsed.error },
        { status: 400 }
      );
    }

    const packageData: Partial<PackageDocument> = {
      name: parsed.data.name,
      description: parsed.data.description,
      items: parsed.data.items,
      price: parsed.data.price,
      discount: parsed.data.discount,
      status: parsed.data.status,
      youtubeUrl: parsed.data.youtubeUrl,
      image: parsed.data.image,
    };

    const newPackage = await createPackage(packageData);
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    console.error('Error creating package:', error);
    return NextResponse.json(
      { error: 'Failed to create package', details: String(error) },
      { status: 500 }
    );
  }
}
