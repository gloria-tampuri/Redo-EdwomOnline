import dbConnect from '@/lib/mongodb';
import Item, { ItemDocument } from '@/models/Item';
import Category from '@/models/Category';

export const itemService = {
  async createItem(data: Partial<ItemDocument>) {
    await dbConnect();
    const item = new Item(data);
    return item.save();
  },

  async getItems() {
    await dbConnect();
    const items = await Item.find().sort({ createdAt: -1 });
    
    // Map items and get category names
    const itemsWithCategoryNames = await Promise.all(
      items.map(async (item) => {
        const itemObj = item.toObject();
        if (itemObj.category) {
          try {
            const category = await Category.findById(itemObj.category);
            if (category) {
              itemObj.category = category.name;
            }
          } catch (error) {
            // If category lookup fails, keep the original ID
            console.error(`Failed to lookup category ${itemObj.category}:`, error);
          }
        }
        return itemObj;
      })
    );
    
    return itemsWithCategoryNames;
  },

  async getItemById(id: string) {
    await dbConnect();
    const item = await Item.findById(id);
    if (item && item.category) {
      try {
        const category = await Category.findById(item.category);
        if (category) {
          const itemObj = item.toObject();
          itemObj.category = category.name;
          return itemObj;
        }
      } catch (error) {
        console.error(`Failed to lookup category ${item.category}:`, error);
      }
    }
    return item;
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
