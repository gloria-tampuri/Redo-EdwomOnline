import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Item from "@/models/Item";
import Category from "@/models/Category";
import mongoose from "mongoose";

type ParamsType = Promise<{ id: string }>;

export async function GET(_req: NextRequest, context: { params: ParamsType }) {
  try {
    const { id: categoryId } = await context.params;

    // Validate categoryId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { error: "Invalid category ID format" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Fetch items for the category
    const items = await Item.find({ category: categoryId })
      .populate("category")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      category: category.toObject(),
      items: items.map((item) => item.toObject()),
      count: items.length,
    });
  } catch (error) {
    console.error("Error fetching items by category:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch items by category",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
