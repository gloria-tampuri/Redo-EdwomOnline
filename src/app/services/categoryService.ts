import Category, { CategoryDocument } from '@/models/Category';
import dbConnect from '@/lib/mongodb';

/**
 * Get all categories (active only by default)
 * @param includeInactive - If true, returns all categories including inactive ones
 */
export async function getAllCategories(includeInactive: boolean = false) {
  await dbConnect();
  const query = includeInactive ? {} : { status: 'active' };
  return await Category.find(query).sort({ createdAt: -1 });
}

export async function getCategoryById(id: string) {
  await dbConnect();
  return await Category.findById(id);
}

export async function createCategory(data: Partial<CategoryDocument>) {
  await dbConnect();
  const category = new Category(data);
  return await category.save();
}

export async function updateCategory(id: string, data: Partial<CategoryDocument>) {
  await dbConnect();
  return await Category.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteCategory(id: string) {
  await dbConnect();
  return await Category.findByIdAndDelete(id);
}
