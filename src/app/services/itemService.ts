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
      .populate("unit") // Populate unit if it's a reference
      .sort({ createdAt: -1 });

    // Return items with proper unit handling
    return items.map((item) => {
      const obj = item.toObject();
      // If unit is populated (has a name property), use the name
      if (obj.unit && typeof obj.unit === "object" && "name" in obj.unit) {
        obj.unit = (obj.unit as any).name;
      }
      return obj;
    });
  },

  async getItemsByCategory(categoryId: string) {
    await dbConnect();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID format");
    }

    const items = await Item.find({ category: categoryId })
      .populate("category")
      .populate("unit") // Populate unit if it's a reference
      .sort({ createdAt: -1 });

    return items.map((item) => {
      const obj = item.toObject();
      // If unit is populated (has a name property), use the name
      if (obj.unit && typeof obj.unit === "object" && "name" in obj.unit) {
        obj.unit = (obj.unit as any).name;
      }
      return obj;
    });
  },

  async getItemById(id: string) {
    await dbConnect();
    const item = await Item.findById(id).populate("category").populate("unit"); // Populate unit if it's a reference

    if (!item) return null;

    const obj = item.toObject();
    // If unit is populated (has a name property), use the name
    if (obj.unit && typeof obj.unit === "object" && "name" in obj.unit) {
      obj.unit = (obj.unit as any).name;
    }
    return obj;
  },

  async updateItem(id: string, data: Partial<ItemDocument>) {
    await dbConnect();
    const item = await Item.findByIdAndUpdate(id, data, { new: true })
      .populate("category")
      .populate("unit"); // Populate unit if it's a reference

    if (!item) return null;

    const obj = item.toObject();
    // If unit is populated (has a name property), use the name
    if (obj.unit && typeof obj.unit === "object" && "name" in obj.unit) {
      obj.unit = (obj.unit as any).name;
    }
    return obj;
  },

  async deleteItem(id: string) {
    await dbConnect();
    return Item.findByIdAndDelete(id);
  },
};
