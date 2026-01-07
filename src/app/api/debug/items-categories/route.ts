import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import Category from '@/models/Category';

export async function GET() {
  try {
    await dbConnect();

    // Get all categories
    const categories = await Category.find({}).lean();
    console.log('All categories:', categories);

    // Get all items with their category info
    const items = await Item.find({})
      .select('name category')
      .lean();
    
    console.log('All items and their categories:', items);

    // Get a count of items per category
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('Items per category:', itemsByCategory);

    return NextResponse.json(
      {
        categories,
        items: items.slice(0, 5), // First 5 items as sample
        itemsByCategory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}
