/**
 * Unified Order and OrderItem types
 * Used across OrdersTable.tsx and OrderDetailsDrawer.tsx
 */

export interface OrderItem {
  _id: string; // Reference to item in inventory or unique identifier
  name: string;
  price: number; // Price per unit
  quantity: number;
  unit: string;
  image?: string;
  type?: 'item' | 'package'; // Distinguish between inventory items and packages
}

export interface Package {
  _id: string;
  name: string;
  description?: string;
  items: Array<{
    itemId: string;
    name: string;
    quantity: number;
    unit: string;
    price: number;
    image?: string;
  }>;
  price: number; // Total price of all items
  discount: number; // Package discount
  status: 'active' | 'inactive';
  youtubeUrl?: string;
  image?: string;
}

export interface Order {
  _id?: string; // MongoDB ID (optional for new orders during creation)
  orderId?: string; // Human-readable order ID (ORD-XXXXX-XXXXX) - optional since user orders don't have this yet
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  items: OrderItem[]; // Array of order items (both inventory items and packages) with _id
  totalAmount?: number;
  subtotal?: number; // From user checkout
  total?: number; // From user checkout
  deliveryLocation?: string;
  deliveryDate?: Date | string;
  deliveryTime?: string;
  deliveryInstructions?: string;
  status: string; // e.g., 'Pending', 'Processing', 'Completed', 'Cancelled'
  orderDate?: string; // ISO date string
  paymentStatus?: string; // e.g., 'Unpaid', 'Paid', 'Refunded'
  discount?: number;
  deliveryFee?: number;
  tax?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  unit: string;
  discount?: number;
  stock: number;
  status: string;
  image?: string;
  lastUpdated?: string;
}
