import { NextRequest, NextResponse } from 'next/server';
import { getAllUnits, createUnit } from '@/app/services/unitService';
import { z } from 'zod';

const UnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const units = await getAllUnits();
    return NextResponse.json(units);
  } catch (error) {
    console.error('Failed to fetch units:', error);
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = UnitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid unit data', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const unit = await createUnit(parsed.data);
    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create unit:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Unit name or abbreviation already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
  }
}
