import dbConnect from "@/lib/mongodb";
import Item, { ItemDocument } from "@/models/Item";
import mongoose from "mongoose";

export const itemService = {
  async createItem(data: Partial<ItemDocument>) {
    await dbConnect();
    const item = new Item(data);
    return item.save();
  },

  async getItems() {
    await dbConnect();
    const items = await Item.find()
      .populate("category")
      .sort({ createdAt: -1 });

    // Return items as-is
    return items.map((item) => item.toObject());
  },

  async getItemsByCategory(categoryId: string) {
    await dbConnect();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID format");
    }

    const items = await Item.find({ category: categoryId })
      .populate("category")
      .sort({ createdAt: -1 });

    return items.map((item) => item.toObject());
  },

  async getItemById(id: string) {
    await dbConnect();
    const item = await Item.findById(id).populate("category");
    return item ? item.toObject() : null;
  },

  async updateItem(id: string, data: Partial<ItemDocument>) {
    await dbConnect();
    const item = await Item.findByIdAndUpdate(id, data, { new: true }).populate(
      "category"
    );
    return item ? item.toObject() : null;
  },

  async deleteItem(id: string) {
    await dbConnect();
    return Item.findByIdAndDelete(id);
  },
};
