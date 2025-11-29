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
    return Item.find().sort({ createdAt: -1 });
  },

  async getItemById(id: string) {
    await dbConnect();
    return Item.findById(id);
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
