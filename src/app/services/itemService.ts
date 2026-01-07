import dbConnect from '@/lib/mongodb';
import Item, { ItemDocument } from '@/models/Item';

export const itemService = {
  async createItem(data: Partial<ItemDocument>) {
    await dbConnect();
    const item = new Item(data);
    return item.save();
  },

  async getItems() {
    await dbConnect();
    const items = await Item.find().populate('category').sort({ createdAt: -1 });
    
    // Return items as-is
    return items.map((item) => item.toObject());
  },

  async getItemsByCategory(categoryId: string) {
    try {
      await dbConnect();
      console.log('Fetching items for category:', categoryId);
      console.log('Category ID type:', typeof categoryId);
      const items = await Item.find({ category: categoryId }).populate('category').sort({ createdAt: -1 });
      console.log('Found items:', items.length);
      console.log('Items data:', JSON.stringify(items, null, 2));
      return items.map((item) => item.toObject());
    } catch (error) {
      console.error('Error in getItemsByCategory:', error);
      throw error;
    }
  },

  async getItemById(id: string) {
    await dbConnect();
    const item = await Item.findById(id).populate('category');
    return item ? item.toObject() : null;
  },

  async updateItem(id: string, data: Partial<ItemDocument>) {
    await dbConnect();
    return Item.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteItem(id: string) {
    await dbConnect();
    return Item.findByIdAndDelete(id);
  },
};
