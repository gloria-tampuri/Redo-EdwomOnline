import { NextRequest, NextResponse } from 'next/server';
import { getUnitById, updateUnit, deleteUnit } from '@/app/services/unitService';
import { z } from 'zod';

const UnitUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  abbreviation: z.string().min(1).optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const unit = await getUnitById(id);
    
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    
    return NextResponse.json(unit);
  } catch (error) {
    console.error('Failed to fetch unit:', error);
    return NextResponse.json({ error: 'Failed to fetch unit' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = UnitUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid unit data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const unit = await updateUnit(id, parsed.data);
    
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    
    return NextResponse.json(unit);
  } catch (error: any) {
    console.error('Failed to update unit:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Unit name or abbreviation already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update unit' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const unit = await deleteUnit(id);
    
    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete unit:', error);
    return NextResponse.json({ error: 'Failed to delete unit' }, { status: 500 });
  }
}
