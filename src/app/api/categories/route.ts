import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/app/services/categoryService';
import { CreateCategorySchema } from '@/app/types/schemas';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const includeInactive = searchParams.get('all') === 'true';
    const categories = await getAllCategories(includeInactive);
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid category data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create category:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Failed to create category', details: String(error) },
      { status: 500 }
    );
  }
}
