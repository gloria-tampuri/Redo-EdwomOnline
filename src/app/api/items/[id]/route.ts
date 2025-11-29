import { NextRequest, NextResponse } from 'next/server';
import { UpdateItemSchema } from '@/app/types/schemas';
import { itemService } from '@/app/services/itemService';

type ParamsType = Promise<{ id: string }>;

export async function GET(_req: NextRequest, { params }: { params: ParamsType }) {
  try {
    const { id } = await params;
    const item = await itemService.getItemById(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error fetching item:', error);
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: ParamsType }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate using Zod schema
    const validation = UpdateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    const item = await itemService.updateItem(id, validation.data);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: ParamsType }) {
  try {
    const { id } = await params;
    const item = await itemService.deleteItem(id);

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
