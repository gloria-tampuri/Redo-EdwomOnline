import { NextRequest, NextResponse } from 'next/server';
import { CreateItemSchema } from '@/app/types/schemas';
import { itemService } from '@/app/services/itemService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate using Zod schema
    const validation = CreateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const item = await itemService.createItem(validation.data as any);
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');

    // If categoryId is provided, fetch items by category
    if (categoryId) {
      const items = await itemService.getItemsByCategory(categoryId);
      return NextResponse.json(items, { status: 200 });
    }

    // Otherwise, fetch all items
    const items = await itemService.getItems();
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch items', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    );
  }
}
